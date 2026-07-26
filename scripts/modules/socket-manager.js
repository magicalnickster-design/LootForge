/**
 * GM-authoritative socket layer for corpse loot assignment and takes.
 */

import { MODULE_ID, OPS, SOCKET_EVENT } from "./constants.js";
import { log } from "./logger.js";
import {
  canUserAccessAssignedLoot,
  canUserLootCorpse,
  resolveAssignedOwnerUsers,
  userOwnsActor
} from "./ownership.js";
import {
  canUserModifyToken,
  getCorpseState,
  updateCorpseState
} from "./loot-storage.js";
import {
  canTakeLoot,
  claimLootSession,
  depositRemainingToCorpse,
  takeAllCorpseItems,
  takeCorpseItem
} from "./loot-transfer.js";
import { refreshLootWindows } from "../applications/window-registry.js";

let registered = false;

/** @type {Set<string>} */
const dmPromptTokens = new Set();

/** @type {Map<string, { resolve: Function, reject: Function, timer: any }>} */
const pendingInvestigationRolls = new Map();

/**
 * Register socket listeners (ready).
 */
export function registerSocketManager() {
  if (registered) return;
  registered = true;

  game.socket.on(SOCKET_EVENT, async (payload) => {
    try {
      await handleSocketPayload(payload);
    } catch (err) {
      log.error("Socket handler error", err);
    }
  });

  log.debug("Socket manager registered");
}

/**
 * @param {object} payload
 */
export function emitLootForge(payload) {
  const full = {
    ...payload,
    moduleId: MODULE_ID,
    fromUserId: game.user.id
  };
  game.socket.emit(SOCKET_EVENT, full);
  return full;
}

/**
 * @param {string} tokenUuid
 */
export function broadcastStateUpdated(tokenUuid) {
  emitLootForge({ op: OPS.STATE_UPDATED, tokenUuid });
  refreshLootWindows(tokenUuid);
  void refreshIndicatorsSafe(tokenUuid);
}

/**
 * @param {string} [tokenUuid]
 */
async function refreshIndicatorsSafe(tokenUuid) {
  try {
    const { refreshLootIndicators } = await import("./loot-indicator.js");
    await refreshLootIndicators(tokenUuid ? { tokenUuid } : undefined);
  } catch (err) {
    log.debug("Indicator refresh skipped", err);
  }
}

/**
 * @param {object} payload
 */
async function handleSocketPayload(payload) {
  if (!payload || payload.moduleId !== MODULE_ID) return;
  const op = payload.op;

  switch (op) {
    case OPS.STATE_UPDATED:
      refreshLootWindows(payload.tokenUuid);
      await refreshIndicatorsSafe(payload.tokenUuid);
      if (payload.error && payload.targetUserId === game.user.id) {
        ui.notifications.warn(payload.error);
      }
      return;

    case OPS.OPEN_PLAYER_WINDOW:
      log.info("Socket event received", {
        op,
        fromUserId: payload.fromUserId,
        targetUserId: payload.targetUserId,
        actorId: payload.actorId,
        tokenUuid: payload.tokenUuid,
        localUserId: game.user.id
      });
      await openPlayerWindowFromPayload(payload);
      return;

    case OPS.REQUEST_DM_LOOT:
      if (!game.user.isGM) return;
      if (game.users.activeGM?.id !== game.user.id) return;
      await onDmLootRequest(payload);
      return;

    case OPS.PLAYER_START_LOOT:
    case OPS.CLAIM_LOOT_SESSION:
      if (!game.user.isGM) return;
      if (game.users.activeGM?.id !== game.user.id) return;
      await onPlayerStartLoot(payload);
      return;

    case OPS.REQUEST_INVESTIGATION_ROLL:
      if (payload.targetUserId && payload.targetUserId !== game.user.id) return;
      await onRequestInvestigationRoll(payload);
      return;

    case OPS.INVESTIGATION_ROLL_RESULT:
      if (!game.user.isGM) return;
      onInvestigationRollResult(payload);
      return;

    case OPS.TAKE_ITEM:
    case OPS.TAKE_ALL:
    case OPS.DONE_LOOT:
      if (!game.user.isGM) return;
      if (game.users.activeGM?.id !== game.user.id) return;
      await handleTakeRequest(payload);
      return;

    default:
      log.debug("Unhandled socket op", op);
  }
}

/**
 * @param {object} payload
 */
async function onDmLootRequest(payload) {
  const key = `${payload.tokenUuid}:${payload.fromUserId}`;
  if (dmPromptTokens.has(key)) return;
  dmPromptTokens.add(key);
  try {
    const { handleDmLootRequest } = await import("./loot-workflow.js");
    await handleDmLootRequest(payload);
  } finally {
    dmPromptTokens.delete(key);
  }
}

/**
 * @param {object} payload
 */
async function onPlayerStartLoot(payload) {
  const { handlePlayerStartLoot } = await import("./loot-workflow.js");
  const result = await handlePlayerStartLoot(payload, {
    claimOnly: Boolean(payload.claimOnly) || payload.op === OPS.CLAIM_LOOT_SESSION
  });
  if (!result?.ok && result?.error) {
    emitLootForge({
      op: OPS.STATE_UPDATED,
      tokenUuid: payload.tokenUuid,
      error: result.error,
      targetUserId: payload.fromUserId
    });
  }
}

/**
 * @param {object} payload
 */
async function handleTakeRequest(payload) {
  const tokenDoc = await fromUuid(payload.tokenUuid);
  if (!tokenDoc) {
    log.warn("Take request: token not found", payload.tokenUuid);
    return;
  }

  const actor = game.actors.get(payload.actorId);
  if (!actor && payload.op !== OPS.DONE_LOOT) {
    log.warn("Take request: actor not found", payload.actorId);
    return;
  }

  const requestingUser = game.users.get(payload.fromUserId);
  if (!requestingUser) return;

  const state = getCorpseState(tokenDoc);
  if (payload.op !== OPS.DONE_LOOT) {
    if (state.activeLooterUserId && state.activeLooterUserId !== requestingUser.id) {
      log.warn("Take request rejected: another looter", {
        tokenUuid: payload.tokenUuid,
        fromUserId: payload.fromUserId
      });
      return;
    }
    if (state.assignedActorId && state.assignedActorId !== actor.id) {
      log.warn("Take request rejected: actor not assigned", {
        tokenUuid: payload.tokenUuid,
        actorId: payload.actorId
      });
      return;
    }
    if (!canTakeLoot(tokenDoc, actor, requestingUser)) {
      log.warn("Take request rejected: permission", {
        tokenUuid: payload.tokenUuid,
        actorId: payload.actorId,
        fromUserId: payload.fromUserId
      });
      return;
    }
  } else if (
    state.activeLooterUserId
    && state.activeLooterUserId !== requestingUser.id
    && !requestingUser.isGM
  ) {
    log.warn("Done request rejected: not active looter", {
      tokenUuid: payload.tokenUuid,
      fromUserId: payload.fromUserId
    });
    return;
  }

  let result;
  if (payload.op === OPS.DONE_LOOT) {
    result = await depositRemainingToCorpse(tokenDoc, requestingUser);
  } else if (payload.op === OPS.TAKE_ALL) {
    result = await takeAllCorpseItems(tokenDoc, actor, requestingUser);
  } else {
    if (!payload.entryId || !state.items.some((i) => i.entryId === payload.entryId)) {
      log.warn("Take request rejected: invalid entryId", payload.entryId);
      return;
    }
    result = await takeCorpseItem(tokenDoc, actor, payload.entryId, {
      quantity: payload.quantity,
      user: requestingUser
    });
  }

  if (!result.ok) {
    emitLootForge({
      op: OPS.STATE_UPDATED,
      tokenUuid: tokenDoc.uuid,
      error: result.error,
      targetUserId: payload.fromUserId
    });
    return;
  }

  broadcastStateUpdated(tokenDoc.uuid);
}

/**
 * Wait briefly for a token UUID / flag sync (Foundry may deliver sockets before flags).
 * @param {string} tokenUuid
 * @param {number} [attempts]
 * @returns {Promise<TokenDocument|null>}
 */
async function resolveTokenDocSoon(tokenUuid, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    const doc = await fromUuid(tokenUuid);
    if (doc) return doc;
    await new Promise((resolve) => setTimeout(resolve, 75));
  }
  return null;
}

/**
 * @param {object} payload
 */
async function openPlayerWindowFromPayload(payload) {
  if (payload.targetUserId && payload.targetUserId !== game.user.id) {
    log.info("Socket open ignored: not target user", {
      targetUserId: payload.targetUserId,
      localUserId: game.user.id
    });
    return;
  }

  // A targeted open socket is authoritative. Do not require local corpse flags to
  // have synced yet — that race was blocking the player window after assign.
  const trustedTarget = payload.targetUserId === game.user.id;

  const tokenDoc = await resolveTokenDocSoon(payload.tokenUuid);
  if (!tokenDoc) {
    log.warn("Player window open failed: token UUID unresolved", payload.tokenUuid);
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  const state = getCorpseState(tokenDoc);
  const allowed = trustedTarget
    || game.user.isGM
    || state.activeLooterUserId === game.user.id
    || canUserAccessAssignedLoot(state, game.user)
    || canUserLootCorpse(tokenDoc, game.user);

  if (!allowed) {
    log.info("Player window open blocked", {
      reason: "not-allowed",
      assignedActorId: state.assignedActorId,
      activeLooterUserId: state.activeLooterUserId,
      localUserId: game.user.id,
      trustedTarget
    });
    return;
  }

  log.info("Player window opening", {
    tokenUuid: tokenDoc.uuid,
    assignedActorId: state.assignedActorId ?? payload.actorId ?? null,
    activeLooterUserId: state.activeLooterUserId,
    trustedTarget
  });

  const creatureName = state.creatureContext?.name ?? tokenDoc.name;
  ui.notifications.info(
    game.i18n.format("LOOTFORGE.Notify.LootAvailable", { name: creatureName })
  );

  const { openPlayerLootWindow } = await import("../applications/player-loot-window.js");
  await openPlayerLootWindow(tokenDoc);
  await refreshIndicatorsSafe(tokenDoc.uuid);
}

/**
 * Player → GM: show "start the roll" dialog.
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 */
export async function requestDmLootPrompt(tokenDoc, actor) {
  if (game.user.isGM) {
    const { handleDmLootRequest } = await import("./loot-workflow.js");
    await handleDmLootRequest({
      tokenUuid: tokenDoc.uuid,
      actorId: actor.id,
      fromUserId: game.user.id
    });
    return { ok: true };
  }

  if (!game.users.activeGM) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NeedGM"));
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NeedGM") };
  }

  emitLootForge({
    op: OPS.REQUEST_DM_LOOT,
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id
  });
  log.info("Socket event emitted", {
    op: OPS.REQUEST_DM_LOOT,
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id
  });
  return { ok: true, pending: true };
}

/**
 * Player → GM: auto-start or claim loot session.
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {{ claimOnly?: boolean, investigationRoll?: object|null }} [options]
 */
export async function requestPlayerStartLoot(tokenDoc, actor, {
  claimOnly = false,
  investigationRoll = null
} = {}) {
  const rollPayload = investigationRoll
    ? {
      investigationTotal: Number(investigationRoll.total),
      naturalDie: Number(investigationRoll.natural ?? 0),
      isNatural20: Boolean(investigationRoll.isNatural20)
    }
    : {};

  if (game.user.isGM) {
    const { handlePlayerStartLoot } = await import("./loot-workflow.js");
    return handlePlayerStartLoot({
      tokenUuid: tokenDoc.uuid,
      actorId: actor.id,
      fromUserId: game.user.id,
      claimOnly,
      ...rollPayload
    }, { claimOnly });
  }

  if (!game.users.activeGM) {
    const err = game.i18n.localize("LOOTFORGE.Notify.NeedGM");
    ui.notifications.warn(err);
    return { ok: false, error: err };
  }

  emitLootForge({
    op: claimOnly ? OPS.CLAIM_LOOT_SESSION : OPS.PLAYER_START_LOOT,
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id,
    claimOnly,
    ...rollPayload
  });
  log.info("Socket event emitted", {
    op: claimOnly ? OPS.CLAIM_LOOT_SESSION : OPS.PLAYER_START_LOOT,
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id,
    hasInvestigationRoll: Boolean(investigationRoll)
  });
  return { ok: true, pending: true };
}

/**
 * Ask a connected player to roll Investigation for looting.
 * Resolves with { total, natural, isNatural20 } or null if cancelled/timeout.
 *
 * @param {User} user
 * @param {Actor} actor
 * @param {TokenDocument} tokenDoc
 * @returns {Promise<object|null>}
 */
export function requestRemoteInvestigationRoll(user, actor, tokenDoc) {
  if (!user?.active || !actor || !tokenDoc) return Promise.resolve(null);

  // Local user (or GM rolling for themselves): roll immediately.
  if (user.id === game.user.id) {
    return import("./roll-helper.js").then(({ rollInvestigation }) => rollInvestigation(actor));
  }

  const requestId = foundry.utils.randomID();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pendingInvestigationRolls.delete(requestId);
      log.warn("Investigation roll request timed out", { requestId, userId: user.id });
      ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.InvestigationTimeout"));
      resolve(null);
    }, 120000);

    pendingInvestigationRolls.set(requestId, {
      resolve: (value) => {
        clearTimeout(timer);
        pendingInvestigationRolls.delete(requestId);
        resolve(value);
      },
      timer
    });

    emitLootForge({
      op: OPS.REQUEST_INVESTIGATION_ROLL,
      requestId,
      targetUserId: user.id,
      actorId: actor.id,
      tokenUuid: tokenDoc.uuid
    });
    log.info("Socket event emitted", {
      op: OPS.REQUEST_INVESTIGATION_ROLL,
      targetUserId: user.id,
      actorId: actor.id,
      requestId
    });
    ui.notifications.info(
      game.i18n.format("LOOTFORGE.Notify.WaitingForInvestigation", {
        name: user.name,
        creature: tokenDoc.name
      })
    );
    // Whisper so the player sees a chat ping even if the toast is missed.
    ChatMessage.create({
      content: game.i18n.format("LOOTFORGE.Notify.InvestigationWhisper", {
        name: tokenDoc.name
      }),
      whisper: [user.id],
      speaker: { alias: "LootForge" }
    }).catch(() => undefined);
  });
}

/**
 * @param {object} payload
 */
async function onRequestInvestigationRoll(payload) {
  log.info("Socket event received", {
    op: OPS.REQUEST_INVESTIGATION_ROLL,
    requestId: payload.requestId,
    actorId: payload.actorId,
    localUserId: game.user.id
  });

  const actor = game.actors.get(payload.actorId) ?? game.user.character;
  if (!actor) {
    emitLootForge({
      op: OPS.INVESTIGATION_ROLL_RESULT,
      requestId: payload.requestId,
      cancelled: true
    });
    return;
  }

  const creatureName = (await fromUuid(payload.tokenUuid))?.name ?? "the corpse";
  ui.notifications.info(
    game.i18n.format("LOOTFORGE.Notify.RollInvestigationNamed", { name: creatureName })
  );

  // Modal confirm so the player cannot miss the request behind other windows.
  const proceed = await foundry.applications.api.DialogV2.confirm({
    window: { title: game.i18n.localize("LOOTFORGE.Dialog.InvestigationTitle") },
    content: `<p>${game.i18n.format("LOOTFORGE.Dialog.InvestigationPrompt", {
      name: creatureName
    })}</p>`,
    yes: {
      label: game.i18n.localize("LOOTFORGE.Dialog.RollInvestigation"),
      icon: "fa-solid fa-magnifying-glass",
      default: true
    },
    no: { label: game.i18n.localize("LOOTFORGE.Dialog.Close") }
  });

  if (!proceed) {
    emitLootForge({
      op: OPS.INVESTIGATION_ROLL_RESULT,
      requestId: payload.requestId,
      cancelled: true
    });
    return;
  }

  const { rollInvestigation } = await import("./roll-helper.js");
  const result = await rollInvestigation(actor);

  emitLootForge({
    op: OPS.INVESTIGATION_ROLL_RESULT,
    requestId: payload.requestId,
    actorId: actor.id,
    cancelled: !result,
    investigationTotal: result?.total ?? null,
    naturalDie: result?.natural ?? null,
    isNatural20: result?.isNatural20 ?? false
  });
}

/**
 * @param {object} payload
 */
function onInvestigationRollResult(payload) {
  const pending = pendingInvestigationRolls.get(payload.requestId);
  if (!pending) return;

  if (payload.cancelled || payload.investigationTotal == null) {
    pending.resolve(null);
    return;
  }

  pending.resolve({
    total: Number(payload.investigationTotal),
    natural: Number(payload.naturalDie ?? 0),
    isNatural20: Boolean(payload.isNatural20)
  });
}

/**
 * GM assigns loot and notifies the player client(s).
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {User|null} [user]
 */
export async function assignLootToActor(tokenDoc, actor, user = null) {
  if (!game.user.isGM) {
    throw new Error("Only a GM may assign loot");
  }
  if (!canUserModifyToken(tokenDoc) && game.users.activeGM?.id !== game.user.id) {
    throw new Error("Cannot modify token loot state");
  }

  const allOwners = resolveAssignedOwnerUsers(actor, { activeOnly: false });
  const connectedOwners = resolveAssignedOwnerUsers(actor, { activeOnly: true });
  const preferred = user && !user.isGM && userOwnsActor(actor, user) ? user : null;
  const targets = preferred
    ? [
      ...connectedOwners.filter((u) => u.id === preferred.id),
      ...connectedOwners.filter((u) => u.id !== preferred.id)
    ]
    : connectedOwners;

  const uniqueTargets = [...new Map(targets.map((u) => [u.id, u])).values()];
  const assignedUser = preferred ?? uniqueTargets[0] ?? allOwners[0] ?? null;

  log.info("Assignment owner resolution", {
    assignedActorId: actor.id,
    ownerUserIds: allOwners.map((u) => u.id),
    connectedOwnerUserIds: connectedOwners.map((u) => u.id),
    assignedUserId: assignedUser?.id ?? null,
    tokenUuid: tokenDoc.uuid
  });

  if (assignedUser) {
    // Force-steal any stale "already looting" lock from a previous attempt.
    const claim = await claimLootSession(tokenDoc, assignedUser, actor, { force: true });
    if (!claim.ok) {
      await updateCorpseState(tokenDoc, {
        assignedActorId: actor.id,
        assignedUserId: assignedUser.id,
        activeLooterUserId: assignedUser.id,
        activeLooterActorId: actor.id,
        activeLooterName: actor.name
      });
    }
  } else {
    await updateCorpseState(tokenDoc, {
      assignedActorId: actor.id,
      assignedUserId: null
    });
  }

  broadcastStateUpdated(tokenDoc.uuid);

  const emitOpen = (target) => {
    const emitted = emitLootForge({
      op: OPS.OPEN_PLAYER_WINDOW,
      tokenUuid: tokenDoc.uuid,
      targetUserId: target.id,
      actorId: actor.id,
      sceneUuid: tokenDoc.parent?.uuid ?? null,
      trusted: true
    });
    log.info("Socket event emitted", {
      op: OPS.OPEN_PLAYER_WINDOW,
      targetUserId: emitted.targetUserId,
      actorId: emitted.actorId,
      tokenUuid: emitted.tokenUuid
    });
  };

  if (uniqueTargets.length) {
    for (const target of uniqueTargets) emitOpen(target);
    // Re-emit after flag sync so a lost race cannot leave the player window closed.
    setTimeout(() => {
      for (const target of uniqueTargets) emitOpen(target);
    }, 300);
  } else {
    log.warn("No connected player owners — opening locally for GM", {
      assignedActorId: actor.id
    });
    const { openPlayerLootWindow } = await import("../applications/player-loot-window.js");
    await openPlayerLootWindow(tokenDoc);
  }

  await refreshIndicatorsSafe(tokenDoc.uuid);
  log.info(`Assigned loot on ${tokenDoc.name} → ${actor.name}`);
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {string} entryId
 */
export async function requestTakeItem(tokenDoc, actor, entryId) {
  if (game.user.isGM || canUserModifyToken(tokenDoc)) {
    const result = await takeCorpseItem(tokenDoc, actor, entryId);
    if (result.ok) broadcastStateUpdated(tokenDoc.uuid);
    return result;
  }

  emitLootForge({
    op: OPS.TAKE_ITEM,
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id,
    entryId
  });
  return { ok: true, pending: true };
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 */
export async function requestTakeAll(tokenDoc, actor) {
  if (game.user.isGM || canUserModifyToken(tokenDoc)) {
    const result = await takeAllCorpseItems(tokenDoc, actor);
    if (result.ok) broadcastStateUpdated(tokenDoc.uuid);
    return result;
  }

  emitLootForge({
    op: OPS.TAKE_ALL,
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id
  });
  return { ok: true, pending: true };
}

/**
 * Close loot window and deposit remaining items onto the corpse actor inventory.
 * @param {TokenDocument} tokenDoc
 */
export async function requestDoneLoot(tokenDoc) {
  if (game.user.isGM || canUserModifyToken(tokenDoc)) {
    const result = await depositRemainingToCorpse(tokenDoc, game.user);
    if (result.ok) broadcastStateUpdated(tokenDoc.uuid);
    return result;
  }

  const state = getCorpseState(tokenDoc);
  emitLootForge({
    op: OPS.DONE_LOOT,
    tokenUuid: tokenDoc.uuid,
    actorId: state.assignedActorId ?? state.activeLooterActorId
  });
  return { ok: true, pending: true };
}
