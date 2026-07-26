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

  const tokenDoc = await fromUuid(payload.tokenUuid);
  if (!tokenDoc) {
    log.warn("Player window open failed: token UUID unresolved", payload.tokenUuid);
    return;
  }

  const state = getCorpseState(tokenDoc);
  const allowed = game.user.isGM
    || state.activeLooterUserId === game.user.id
    || canUserAccessAssignedLoot(state, game.user)
    || canUserLootCorpse(tokenDoc, game.user);

  if (!allowed) {
    log.info("Player window open blocked", {
      reason: "not-allowed",
      assignedActorId: state.assignedActorId,
      activeLooterUserId: state.activeLooterUserId,
      localUserId: game.user.id
    });
    return;
  }

  log.info("Player window opening", {
    tokenUuid: tokenDoc.uuid,
    assignedActorId: state.assignedActorId,
    activeLooterUserId: state.activeLooterUserId
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
 * @param {{ claimOnly?: boolean }} [options]
 */
export async function requestPlayerStartLoot(tokenDoc, actor, { claimOnly = false } = {}) {
  if (game.user.isGM) {
    const { handlePlayerStartLoot } = await import("./loot-workflow.js");
    return handlePlayerStartLoot({
      tokenUuid: tokenDoc.uuid,
      actorId: actor.id,
      fromUserId: game.user.id,
      claimOnly
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
    claimOnly
  });
  log.info("Socket event emitted", {
    op: claimOnly ? OPS.CLAIM_LOOT_SESSION : OPS.PLAYER_START_LOOT,
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id
  });
  return { ok: true, pending: true };
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
    const claim = await claimLootSession(tokenDoc, assignedUser, actor);
    if (!claim.ok) {
      // Still assign ownership flags if claim failed due to empty — update manually.
      await updateCorpseState(tokenDoc, {
        assignedActorId: actor.id,
        assignedUserId: assignedUser.id
      });
    }
  } else {
    await updateCorpseState(tokenDoc, {
      assignedActorId: actor.id,
      assignedUserId: null
    });
  }

  broadcastStateUpdated(tokenDoc.uuid);

  if (uniqueTargets.length) {
    for (const target of uniqueTargets) {
      const emitted = emitLootForge({
        op: OPS.OPEN_PLAYER_WINDOW,
        tokenUuid: tokenDoc.uuid,
        targetUserId: target.id,
        actorId: actor.id,
        sceneUuid: tokenDoc.parent?.uuid ?? null
      });
      log.info("Socket event emitted", {
        op: OPS.OPEN_PLAYER_WINDOW,
        targetUserId: emitted.targetUserId,
        actorId: emitted.actorId,
        tokenUuid: emitted.tokenUuid
      });
    }
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
