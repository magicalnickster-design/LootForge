import { CORPSE_FLAG, LOOT_RANGE_FEET, MODULE_ID, OPS, SOCKET_EVENT } from "./constants.js";
import { log } from "./logger.js";
import { canUserLootCorpse } from "./ownership.js";
import {
  canUserModifyToken,
  getCorpseState,
  hasRemainingLoot,
  isInvestigationPending,
  updateCorpseState
} from "./loot-storage.js";
import {
  markInvestigationClaimed,
  releaseInvestigationClaim
} from "./session-guard.js";
import {
  canTakeLoot,
  depositRemainingToCorpse,
  takeAllCorpseItems,
  takeCorpseItem
} from "./loot-transfer.js";
import { refreshLootWindows } from "../applications/window-registry.js";
import { canHandleAuthoritativeLoot, canUse } from "../auth/access.js";
import { assertPlayerLootRange, findLooterTokenForActor } from "./loot-range.js";

let registered = false;

const recentAutoOpens = new Map();

const processedTakeKeys = new Set();

function isResponsibleGm() {
  if (!game.user?.isGM) return false;
  const activeGms = game.users.filter((u) => u.isGM && u.active);
  const elected = game.users.activeGM
    ?? activeGms.sort((a, b) => a.id.localeCompare(b.id))[0]
    ?? game.user;
  return elected.id === game.user.id;
}

function emitGmHandoff(payload) {
  const full = emitLootForge(payload);
  const gmIds = game.users.filter((u) => u.isGM).map((u) => u.id);
  if (!gmIds.length) return full;

  ChatMessage.create({
    speaker: { alias: "LootForge" },
    whisper: gmIds,
    content: `<p class="lootforge-handoff" data-lootforge-op="${payload.op}">LootForge</p>`,
    flags: {
      [MODULE_ID]: {
        ...payload,
        fromUserId: game.user.id,
        handoff: true
      }
    }
  }).catch((err) => log.warn("GM handoff chat failed", err));

  return full;
}

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

  Hooks.on("updateToken", (tokenDoc, changes) => {
    const flagPath = `flags.${MODULE_ID}.${CORPSE_FLAG}`;
    if (!foundry.utils.hasProperty(changes, flagPath)
      && !foundry.utils.hasProperty(changes, `flags.${MODULE_ID}`)) {
      return;
    }

    const state = getCorpseState(tokenDoc);
    if (!state.generated && !state.pendingInvestigation) {
      releaseInvestigationClaim(tokenDoc.uuid);
    } else if (isInvestigationPending(state) || (state.generated && state.pendingReview)) {
      markInvestigationClaimed(tokenDoc.uuid);
    }

    refreshLootWindows(tokenDoc.uuid);
    void refreshIndicatorsSafe(tokenDoc.uuid);
  });

  Hooks.on("createChatMessage", async (message) => {
    if (!game.user.isGM) return;
    const flag = message.flags?.[MODULE_ID];
    if (!flag?.handoff || !flag.op) return;
    if (!isResponsibleGm()) return;
    if (!canHandleAuthoritativeLoot()) return;

    const op = flag.op;
    if (op !== OPS.TAKE_ITEM && op !== OPS.TAKE_ALL && op !== OPS.DONE_LOOT) return;

    log.info("Take handoff via chat", { op, tokenUuid: flag.tokenUuid, entryId: flag.entryId });
    await handleTakeRequest({
      ...flag,
      fromUserId: flag.fromUserId ?? message.author?.id ?? message.user
    });
    try {
      if (message.id) await message.delete();
    } catch {
      // ignore delete races
    }
  });

  log.debug("Socket manager registered");
}

export function emitLootForge(payload) {
  const full = {
    ...payload,
    moduleId: MODULE_ID,
    fromUserId: game.user.id
  };
  game.socket.emit(SOCKET_EVENT, full);
  return full;
}

export function broadcastStateUpdated(tokenUuid) {
  emitLootForge({ op: OPS.STATE_UPDATED, tokenUuid });
  refreshLootWindows(tokenUuid);
  void refreshIndicatorsSafe(tokenUuid);
}

async function onStateUpdated(payload) {
  if (payload.error && payload.targetUserId === game.user.id) {
    ui.notifications.warn(payload.error);
  }
  const tokenUuid = payload.tokenUuid;
  if (!tokenUuid) return;

  refreshLootWindows(tokenUuid);

  await new Promise((resolve) => setTimeout(resolve, 100));
  try {
    await fromUuid(tokenUuid);
  } catch {
    // ignore
  }
  refreshLootWindows(tokenUuid);
  await new Promise((resolve) => setTimeout(resolve, 200));
  refreshLootWindows(tokenUuid);
  await refreshIndicatorsSafe(tokenUuid);
}

async function refreshIndicatorsSafe(tokenUuid) {
  try {
    const { refreshLootIndicators } = await import("./loot-indicator.js");
    await refreshLootIndicators(tokenUuid ? { tokenUuid } : undefined);
  } catch (err) {
    log.debug("Indicator refresh skipped", err);
  }
}

async function handleSocketPayload(payload) {
  if (!payload || payload.moduleId !== MODULE_ID) return;
  const op = payload.op;

  switch (op) {
    case OPS.STATE_UPDATED:
      await onStateUpdated(payload);
      return;

    case OPS.LOOT_RELEASED:
      await onLootReleased(payload);
      return;

    case OPS.WORLD_ACCESS:
      return;

    case OPS.OPEN_PLAYER_WINDOW:
      if (!canUse()) return;
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

    case OPS.PLAYER_START_LOOT:
    case OPS.CLAIM_LOOT_SESSION:
      if (!isResponsibleGm()) return;
      if (!canHandleAuthoritativeLoot()) {
        rejectTake(payload, "LOOTFORGE.Access.Required");
        return;
      }
      await onPlayerStartLoot(payload);
      return;

    case OPS.INVESTIGATION_READY:
      if (!game.user.isGM) return;
      if (!canHandleAuthoritativeLoot()) return;
      {
        log.info("Socket event received", {
          op: OPS.INVESTIGATION_READY,
          fromUserId: payload.fromUserId,
          tokenUuid: payload.tokenUuid,
          total: payload.investigationTotal,
          localUserId: game.user.id,
          activeGM: game.users.activeGM?.id ?? null,
          responsible: isResponsibleGm()
        });
        const { handleInvestigationReady } = await import("./loot-workflow.js");
        await handleInvestigationReady(payload);
      }
      return;

    case OPS.TAKE_ITEM:
    case OPS.TAKE_ALL:
    case OPS.DONE_LOOT:
      if (!isResponsibleGm()) return;
      if (!canHandleAuthoritativeLoot()) {
        rejectTake(payload, "LOOTFORGE.Access.NoEntitledGM");
        return;
      }
      await handleTakeRequest(payload);
      return;

    default:
      log.debug("Unhandled socket op", op);
  }
}

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

function rejectTake(payload, error) {
  log.warn("Take request rejected", { op: payload.op, error, tokenUuid: payload.tokenUuid });
  if (payload.fromUserId) {
    emitLootForge({
      op: OPS.STATE_UPDATED,
      tokenUuid: payload.tokenUuid,
      error,
      targetUserId: payload.fromUserId
    });
  }
}

async function handleTakeRequest(payload) {
  // Dedupe identical handoffs (socket + whisper chat for the same click).
  const dedupeKey = [
    payload.op,
    payload.tokenUuid,
    payload.entryId ?? "ALL",
    payload.fromUserId,
    payload.actorId
  ].join(":");
  if (processedTakeKeys.has(dedupeKey)) {
    log.info("Ignoring duplicate take handoff", { dedupeKey });
    return;
  }
  processedTakeKeys.add(dedupeKey);
  setTimeout(() => processedTakeKeys.delete(dedupeKey), 4000);

  // Only the first Loot All for a corpse wins — later clicks from other players
  // are rejected while that claim is open (prevents free-for-all duplicates).
  if (payload.op === OPS.TAKE_ALL) {
    const takeAllKey = `TAKE_ALL:${payload.tokenUuid}`;
    if (processedTakeKeys.has(takeAllKey)) {
      log.info("Ignoring concurrent Loot All", {
        tokenUuid: payload.tokenUuid,
        fromUserId: payload.fromUserId
      });
      rejectTake(payload, game.i18n.localize("LOOTFORGE.Notify.TransferBusy"));
      return;
    }
    processedTakeKeys.add(takeAllKey);
    setTimeout(() => processedTakeKeys.delete(takeAllKey), 8000);
  }

  const tokenDoc = await fromUuid(payload.tokenUuid);
  if (!tokenDoc) {
    rejectTake(payload, game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  const actor = game.actors.get(payload.actorId);
  if (!actor && payload.op !== OPS.DONE_LOOT) {
    rejectTake(payload, game.i18n.localize("LOOTFORGE.Notify.NoLooter"));
    return;
  }

  const requestingUser = game.users.get(payload.fromUserId);
  if (!requestingUser) {
    rejectTake(payload, game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  const state = getCorpseState(tokenDoc);
  const shared = Boolean(state.freeForAll || state.dmApproved);

  if (payload.op !== OPS.DONE_LOOT) {
    if (!shared && state.activeLooterUserId && state.activeLooterUserId !== requestingUser.id) {
      rejectTake(
        payload,
        game.i18n.format("LOOTFORGE.Notify.LootBusy", {
          name: state.activeLooterName
            || game.users.get(state.activeLooterUserId)?.name
            || "Another player"
        })
      );
      return;
    }
    if (!shared && state.assignedActorId && state.assignedActorId !== actor.id) {
      rejectTake(payload, game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
      return;
    }
    if (!canTakeLoot(tokenDoc, actor, requestingUser)) {
      rejectTake(payload, game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
      return;
    }
    if (!requestingUser.isGM) {
      const looterToken = findLooterTokenForActor(actor, requestingUser);
      const rangeCheck = assertPlayerLootRange(tokenDoc, {
        user: requestingUser,
        looterToken,
        rangeFeet: LOOT_RANGE_FEET
      });
      if (!rangeCheck.ok) {
        rejectTake(payload, rangeCheck.error);
        return;
      }
    }
  } else if (
    !shared
    && state.activeLooterUserId
    && state.activeLooterUserId !== requestingUser.id
    && !requestingUser.isGM
  ) {
    rejectTake(payload, game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
    return;
  }

  let result;
  if (payload.op === OPS.DONE_LOOT) {
    result = await depositRemainingToCorpse(tokenDoc, requestingUser);
  } else if (payload.op === OPS.TAKE_ALL) {
    result = await takeAllCorpseItems(tokenDoc, actor, requestingUser);
  } else {
    if (!payload.entryId || !state.items.some((i) => i.entryId === payload.entryId)) {
      rejectTake(payload, game.i18n.localize("LOOTFORGE.Notify.ItemGone"));
      return;
    }
    result = await takeCorpseItem(tokenDoc, actor, payload.entryId, {
      quantity: payload.quantity,
      user: requestingUser
    });
  }

  if (!result.ok) {
    rejectTake(payload, result.error || game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  log.info("Take request completed", {
    op: payload.op,
    tokenUuid: tokenDoc.uuid,
    actorId: actor?.id,
    userId: requestingUser.id
  });
  broadcastStateUpdated(tokenDoc.uuid);
}

async function resolveTokenDocSoon(tokenUuid, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    const doc = await fromUuid(tokenUuid);
    if (doc) return doc;
    await new Promise((resolve) => setTimeout(resolve, 75));
  }
  return null;
}

async function openPlayerWindowFromPayload(payload) {
  if (payload.targetUserId && payload.targetUserId !== game.user.id) {
    log.info("Socket open ignored: not target user", {
      targetUserId: payload.targetUserId,
      localUserId: game.user.id
    });
    return;
  }

  const trustedTarget = payload.targetUserId === game.user.id;

  const tokenDoc = await resolveTokenDocSoon(payload.tokenUuid);
  if (!tokenDoc) {
    log.warn("Player window open failed: token UUID unresolved", payload.tokenUuid);
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  if (trustedTarget) {
    for (let i = 0; i < 12; i++) {
      const state = getCorpseState(tokenDoc);
      if ((state.dmApproved || state.freeForAll || state.activeLooterUserId) && hasRemainingLoot(tokenDoc)) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 75));
    }
  }

  const state = getCorpseState(tokenDoc);
  const allowed = trustedTarget
    || game.user.isGM
    || state.activeLooterUserId === game.user.id
    || state.freeForAll
    || state.dmApproved
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

  if (!beginAutoOpen(tokenDoc.uuid)) {
    const { openPlayerLootWindow } = await import("../applications/player-loot-window.js");
    await openPlayerLootWindow(tokenDoc);
    return;
  }

  log.info("Player window opening", {
    tokenUuid: tokenDoc.uuid,
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

  if (!game.users.activeGM && !game.users.some((u) => u.isGM && u.active)) {
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
    actorId: actor.id
  });
  return { ok: true, pending: true };
}

function beginAutoOpen(tokenUuid) {
  if (!tokenUuid) return false;
  const now = Date.now();
  const last = recentAutoOpens.get(tokenUuid) ?? 0;
  if (now - last < 1500) return false;
  recentAutoOpens.set(tokenUuid, now);
  return true;
}

async function onLootReleased(payload) {
  if (game.user.isGM) return;
  const tokenUuid = payload.tokenUuid;
  if (!tokenUuid) return;

  // Do not auto-open from across the map — players must approach and interact.
  const tokenDoc = await resolveTokenDocSoon(tokenUuid);
  const name = tokenDoc
    ? (getCorpseState(tokenDoc).creatureContext?.name ?? tokenDoc.name)
    : "the corpse";
  ui.notifications.info(
    game.i18n.format("LOOTFORGE.Notify.LootReadyApproach", {
      name,
      range: LOOT_RANGE_FEET
    })
  );
}

export async function releaseLootForEveryone(tokenDoc) {
  if (!game.user.isGM) {
    throw new Error("Only a GM may release loot");
  }

  if (!hasRemainingLoot(tokenDoc)) {
    await updateCorpseState(tokenDoc, {
      pendingReview: false,
      dmApproved: true,
      freeForAll: false,
      pendingInvestigation: null
    });
    broadcastStateUpdated(tokenDoc.uuid);
    return { ok: true, empty: true };
  }

  await updateCorpseState(tokenDoc, {
    pendingReview: false,
    dmApproved: true,
    freeForAll: true,
    activeLooterUserId: null,
    activeLooterActorId: null,
    activeLooterName: null,
    assignedActorId: null,
    assignedUserId: null,
    pendingInvestigation: null,
    looted: false
  });

  broadcastStateUpdated(tokenDoc.uuid);

  emitLootForge({
    op: OPS.LOOT_RELEASED,
    tokenUuid: tokenDoc.uuid
  });

  ui.notifications.info(
    game.i18n.format("LOOTFORGE.Notify.LootReadyApproach", {
      name: getCorpseState(tokenDoc).creatureContext?.name ?? tokenDoc.name,
      range: LOOT_RANGE_FEET
    })
  );
  log.info("Released loot for everyone (free-for-all, approach to loot)", {
    tokenUuid: tokenDoc.uuid
  });
  return { ok: true, freeForAll: true };
}

export async function requestTakeItem(tokenDoc, actor, entryId) {
  if (!game.user.isGM) {
    const rangeCheck = assertPlayerLootRange(tokenDoc, {
      looterToken: findLooterTokenForActor(actor, game.user)
    });
    if (!rangeCheck.ok) {
      return { ok: false, error: rangeCheck.error };
    }
  }

  if (game.user.isGM || canUserModifyToken(tokenDoc)) {
    const result = await takeCorpseItem(tokenDoc, actor, entryId);
    if (result.ok) broadcastStateUpdated(tokenDoc.uuid);
    return result;
  }

  emitGmHandoff({
    op: OPS.TAKE_ITEM,
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id,
    entryId
  });
  return { ok: true, pending: true };
}

export async function requestTakeAll(tokenDoc, actor) {
  if (!game.user.isGM) {
    const rangeCheck = assertPlayerLootRange(tokenDoc, {
      looterToken: findLooterTokenForActor(actor, game.user)
    });
    if (!rangeCheck.ok) {
      return { ok: false, error: rangeCheck.error };
    }
  }

  if (game.user.isGM || canUserModifyToken(tokenDoc)) {
    const result = await takeAllCorpseItems(tokenDoc, actor);
    if (result.ok) broadcastStateUpdated(tokenDoc.uuid);
    return result;
  }

  emitGmHandoff({
    op: OPS.TAKE_ALL,
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id
  });
  return { ok: true, pending: true };
}

export async function requestDoneLoot(tokenDoc) {
  if (game.user.isGM || canUserModifyToken(tokenDoc)) {
    const result = await depositRemainingToCorpse(tokenDoc, game.user);
    if (result.ok) broadcastStateUpdated(tokenDoc.uuid);
    return result;
  }

  const state = getCorpseState(tokenDoc);
  emitGmHandoff({
    op: OPS.DONE_LOOT,
    tokenUuid: tokenDoc.uuid,
    actorId: state.assignedActorId ?? state.activeLooterActorId ?? game.user.character?.id
  });
  return { ok: true, pending: true };
}
