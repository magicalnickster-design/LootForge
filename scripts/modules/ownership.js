/**
 * Resolve which users own an assigned loot character / may loot a corpse.
 */

import { getSetting } from "./settings.js";
import {
  corpseHasInventoryLoot,
  getCorpseState,
  hasRemainingLoot,
  isLootSessionLocked
} from "./loot-storage.js";

/**
 * @returns {number}
 */
function ownerLevel() {
  return CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3;
}

/**
 * @param {Actor} actor
 * @param {User} user
 * @returns {boolean}
 */
export function userOwnsActor(actor, user) {
  if (!actor || !user || user.isGM) return false;

  try {
    if (typeof actor.testUserPermission === "function") {
      if (actor.testUserPermission(user, "OWNER")) return true;
      if (actor.testUserPermission(user, ownerLevel())) return true;
    }
  } catch {
    // ignore permission API quirks
  }

  const ownership = actor.ownership ?? {};
  const level = ownership[user.id];
  if (typeof level === "number" && level >= ownerLevel()) return true;
  if ((ownership.default ?? 0) >= ownerLevel()) return true;
  if (user.character?.id === actor.id) return true;

  return false;
}

/**
 * @param {Actor} actor
 * @param {{ activeOnly?: boolean }} [options]
 * @returns {User[]}
 */
export function resolveAssignedOwnerUsers(actor, { activeOnly = false } = {}) {
  if (!actor) return [];
  return game.users.filter((user) => {
    if (user.isGM) return false;
    if (!userOwnsActor(actor, user)) return false;
    if (activeOnly && !user.active) return false;
    return true;
  });
}

/**
 * Can this user open loot for an assigned corpse (classic assign mode)?
 * @param {import("./loot-storage.js").CorpseLootState} state
 * @param {User} [user]
 */
export function canUserAccessAssignedLoot(state, user = game.user) {
  if (!state || !user) return false;
  if (user.isGM) return true;
  if (!state.assignedActorId) return false;
  if (state.assignedUserId && state.assignedUserId === user.id) return true;
  const actor = game.actors.get(state.assignedActorId);
  if (!actor) return false;
  return userOwnsActor(actor, user);
}

/**
 * WoW-style access: one active looter at a time; free-for-all leftovers when unlocked.
 * @param {TokenDocument} tokenDoc
 * @param {User} [user]
 */
export function canUserLootCorpse(tokenDoc, user = game.user) {
  if (!tokenDoc || !user) return false;
  if (user.isGM) return true;
  if (!hasRemainingLoot(tokenDoc)) return false;

  const state = getCorpseState(tokenDoc);
  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id) {
    return false;
  }

  // Free-for-all mode: any player may claim when unlocked.
  if (getSetting("allowAllPlayersToLoot")) return true;

  // Currently assigned / claimed session.
  if (state.activeLooterUserId === user.id) return true;
  if (canUserAccessAssignedLoot(state, user)) return true;

  // WoW leftovers: after a looter leaves, remaining items sit on the corpse
  // inventory with no assignee — any player may claim the next session.
  if (!state.assignedActorId && !state.activeLooterUserId && corpseHasInventoryLoot(tokenDoc)) {
    return true;
  }

  return false;
}

/**
 * @param {import("./loot-storage.js").CorpseLootState} state
 * @param {User} [user]
 * @returns {string|null} localization key or null if free
 */
export function getLootBusyReasonKey(state, user = game.user) {
  if (!isLootSessionLocked(state)) return null;
  if (state.activeLooterUserId === user?.id) return null;
  return "LOOTFORGE.Notify.LootBusy";
}
