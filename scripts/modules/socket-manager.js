/**
 * GM-authoritative socket layer for corpse loot assignment and takes.
 */

import { MODULE_ID, OPS, SOCKET_EVENT } from "./constants.js";
import { log } from "./logger.js";
import { canUserModifyToken, getCorpseState, updateCorpseState } from "./loot-storage.js";
import { canTakeLoot, takeAllCorpseItems, takeCorpseItem } from "./loot-transfer.js";
import { refreshLootWindows } from "../applications/window-registry.js";

let registered = false;

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
 * Emit to other clients.
 * @param {object} payload
 */
export function emitLootForge(payload) {
  game.socket.emit(SOCKET_EVENT, {
    ...payload,
    moduleId: MODULE_ID,
    fromUserId: game.user.id
  });
}

/**
 * Broadcast state update so open windows refresh.
 * @param {string} tokenUuid
 */
export function broadcastStateUpdated(tokenUuid) {
  emitLootForge({ op: OPS.STATE_UPDATED, tokenUuid });
  refreshLootWindows(tokenUuid);
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
      return;

    case OPS.OPEN_PLAYER_WINDOW:
      // Only the assigned user (or owners) open the window.
      if (game.user.isGM && payload.fromUserId !== game.user.id) return;
      await openPlayerWindowFromPayload(payload);
      return;

    case OPS.TAKE_ITEM:
    case OPS.TAKE_ALL:
      // Only an active GM processes takes from players.
      if (!game.user.isGM) return;
      // Prefer a single active GM to avoid duplicate ops.
      if (game.users.activeGM?.id !== game.user.id) return;
      await handleTakeRequest(payload);
      return;

    case OPS.ASSIGN_LOOT:
      // Non-GM clients ignore; assignment is performed locally by GM.
      return;

    default:
      log.debug("Unhandled socket op", op);
  }
}

/**
 * Player requests a take; GM executes authoritatively.
 * @param {object} payload
 */
async function handleTakeRequest(payload) {
  const tokenDoc = await fromUuid(payload.tokenUuid);
  if (!tokenDoc) {
    log.warn("Take request: token not found", payload.tokenUuid);
    return;
  }

  const actor = game.actors.get(payload.actorId);
  if (!actor) {
    log.warn("Take request: actor not found", payload.actorId);
    return;
  }

  const requestingUser = game.users.get(payload.fromUserId);
  if (!requestingUser) return;

  // Validate against stored assignment — ignore client-supplied mismatches.
  const state = getCorpseState(tokenDoc);
  if (state.assignedActorId && state.assignedActorId !== actor.id) {
    log.warn("Take request rejected: actor not assigned", payload);
    return;
  }
  if (!canTakeLoot(tokenDoc, actor, requestingUser)) {
    log.warn("Take request rejected: permission", payload);
    return;
  }

  let result;
  if (payload.op === OPS.TAKE_ALL) {
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
    // Notify requesting user via whisper-style socket ack.
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
  if (payload.targetUserId && payload.targetUserId !== game.user.id && !game.user.isGM) {
    return;
  }
  // Assigned user check against corpse state.
  const tokenDoc = await fromUuid(payload.tokenUuid);
  if (!tokenDoc) return;
  const state = getCorpseState(tokenDoc);
  const allowed = game.user.isGM
    || state.assignedUserId === game.user.id
    || (state.assignedActorId && game.actors.get(state.assignedActorId)?.isOwner);
  if (!allowed) return;

  const { openPlayerLootWindow } = await import("../applications/player-loot-window.js");
  await openPlayerLootWindow(tokenDoc);
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

  const owners = game.users.filter(
    (u) => !u.isGM && actor.testUserPermission(u, "OWNER") && u.active
  );
  const assignedUser = user ?? owners[0] ?? null;

  await updateCorpseState(tokenDoc, {
    assignedActorId: actor.id,
    assignedUserId: assignedUser?.id ?? null
  });

  broadcastStateUpdated(tokenDoc.uuid);

  const targets = assignedUser ? [assignedUser] : owners;
  for (const target of targets) {
    emitLootForge({
      op: OPS.OPEN_PLAYER_WINDOW,
      tokenUuid: tokenDoc.uuid,
      targetUserId: target.id,
      actorId: actor.id
    });
  }

  // If GM is testing alone with no active player owner, open locally.
  if (!targets.length) {
    const { openPlayerLootWindow } = await import("../applications/player-loot-window.js");
    await openPlayerLootWindow(tokenDoc);
  }

  log.info(`Assigned loot on ${tokenDoc.name} → ${actor.name}`);
}

/**
 * Player-side request to take an item (relayed to active GM when needed).
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
