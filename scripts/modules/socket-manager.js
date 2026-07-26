/**
 * GM-authoritative socket layer for shared corpse loot takes.
 */

import { CORPSE_FLAG, MODULE_ID, OPS, SOCKET_EVENT } from "./constants.js";
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

let registered = false;

/** @type {Map<string, number>} tokenUuid → last auto-open ms */
const recentAutoOpens = new Map();

/**
 * Primary connected GM who should handle authoritative socket ops.
 * Falls back when Foundry's activeGM getter is null (common on some hosts).
 * @returns {boolean}
 */
function isResponsibleGm() {
  if (!game.user?.isGM) return false;
  const activeGms = game.users.filter((u) => u.isGM && u.active);
  const elected = game.users.activeGM
    ?? activeGms.sort((a, b) => a.id.localeCompare(b.id))[0]
    ?? null;
  if (!elected) return true;
  return elected.id === game.user.id;
}

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

  // Live-sync open loot windows whenever corpse flags change (multi-client).
  Hooks.on("updateToken", (tokenDoc, changes) => {
    const flagPath = `flags.${MODULE_ID}.${CORPSE_FLAG}`;
    if (!foundry.utils.hasProperty(changes, flagPath)
      && !foundry.utils.hasProperty(changes, `flags.${MODULE_ID}`)) {
      return;
    }

    // Keep local one-roll guards in sync with authoritative corpse flags.
    const state = getCorpseState(tokenDoc);
    if (!state.generated && !state.pendingInvestigation) {
      releaseInvestigationClaim(tokenDoc.uuid);
    } else if (isInvestigationPending(state) || (state.generated && state.pendingReview)) {
      // Only lock Investigation while waiting on the DM — not after release.
      markInvestigationClaimed(tokenDoc.uuid);
    }

    refreshLootWindows(tokenDoc.uuid);
    void refreshIndicatorsSafe(tokenDoc.uuid);
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
 * Remote clients: wait briefly for flag replication, then refresh open loot UIs.
 * @param {object} payload
 */
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
      await onStateUpdated(payload);
      return;

    case OPS.LOOT_RELEASED:
      await onLootReleased(payload);
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

    case OPS.PLAYER_START_LOOT:
    case OPS.CLAIM_LOOT_SESSION:
      if (!isResponsibleGm()) return;
      await onPlayerStartLoot(payload);
      return;

    case OPS.INVESTIGATION_READY:
      if (!game.user.isGM) return;
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
      await handleTakeRequest(payload);
      return;

    default:
      log.debug("Unhandled socket op", op);
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
  const shared = Boolean(state.freeForAll || state.dmApproved);

  if (payload.op !== OPS.DONE_LOOT) {
    if (!shared && state.activeLooterUserId && state.activeLooterUserId !== requestingUser.id) {
      log.warn("Take request rejected: another looter", {
        tokenUuid: payload.tokenUuid,
        fromUserId: payload.fromUserId
      });
      return;
    }
    if (!shared && state.assignedActorId && state.assignedActorId !== actor.id) {
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
    !shared
    && state.activeLooterUserId
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

  const trustedTarget = payload.targetUserId === game.user.id;

  const tokenDoc = await resolveTokenDocSoon(payload.tokenUuid);
  if (!tokenDoc) {
    log.warn("Player window open failed: token UUID unresolved", payload.tokenUuid);
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  // Trusted opens (post-release) may arrive before flags replicate.
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

/**
 * Player → GM: claim / open shared loot session.
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

/**
 * @param {string} tokenUuid
 * @returns {boolean} true if this client should auto-open now
 */
function beginAutoOpen(tokenUuid) {
  if (!tokenUuid) return false;
  const now = Date.now();
  const last = recentAutoOpens.get(tokenUuid) ?? 0;
  if (now - last < 1500) return false;
  recentAutoOpens.set(tokenUuid, now);
  return true;
}

/**
 * Players: DM released loot — open the Items window (with a short flag-sync wait).
 * @param {object} payload
 */
async function onLootReleased(payload) {
  if (game.user.isGM) return;
  const tokenUuid = payload.tokenUuid;
  if (!tokenUuid || !beginAutoOpen(tokenUuid)) return;

  log.info("Loot released — opening player window", {
    tokenUuid,
    localUserId: game.user.id
  });

  const tokenDoc = await resolveTokenDocSoon(tokenUuid);
  if (!tokenDoc) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  // Wait briefly for dmApproved / items to replicate to this client.
  for (let i = 0; i < 12; i++) {
    const state = getCorpseState(tokenDoc);
    if ((state.dmApproved || state.freeForAll) && hasRemainingLoot(tokenDoc)) break;
    await new Promise((resolve) => setTimeout(resolve, 75));
  }

  const { openPlayerLootWindow } = await import("../applications/player-loot-window.js");
  await openPlayerLootWindow(tokenDoc);
  ui.notifications.info(
    game.i18n.format("LOOTFORGE.Notify.LootAvailable", {
      name: getCorpseState(tokenDoc).creatureContext?.name ?? tokenDoc.name
    })
  );
}

/**
 * GM finished reviewing — release corpse loot for every player (shared free-for-all).
 * Auto-opens the player Items window on connected player clients.
 * @param {TokenDocument} tokenDoc
 */
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

  // Reliable handoff: every active player should see the loot window now.
  emitLootForge({
    op: OPS.LOOT_RELEASED,
    tokenUuid: tokenDoc.uuid
  });

  const players = game.users.filter((u) => !u.isGM && u.active);
  for (const user of players) {
    emitLootForge({
      op: OPS.OPEN_PLAYER_WINDOW,
      tokenUuid: tokenDoc.uuid,
      targetUserId: user.id,
      trusted: true
    });
  }

  ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.LootOpenForAll"));
  log.info("Released loot for everyone (free-for-all)", {
    tokenUuid: tokenDoc.uuid,
    playerIds: players.map((u) => u.id)
  });
  return { ok: true, freeForAll: true };
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
