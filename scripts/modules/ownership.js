/**
 * Resolve which users own an assigned loot character / may loot a corpse.
 */

import { getSetting } from "./settings.js";
import {
  corpseHasInventoryLoot,
  getCorpseState,
  hasRemainingLoot,
  isAwaitingDmReview,
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
 * WoW-style access: exclusive first looter, then free-for-all leftovers.
 * @param {TokenDocument} tokenDoc
 * @param {User} [user]
 */
export function canUserLootCorpse(tokenDoc, user = game.user) {
  if (!tokenDoc || !user) return false;
  if (user.isGM) return true;
  if (!hasRemainingLoot(tokenDoc)) return false;

  const state = getCorpseState(tokenDoc);

  // DM still editing / approving loot.
  if (isAwaitingDmReview(state)) return false;

  // Shared loot after DM review — any player may open/take.
  if (state.freeForAll || state.dmApproved) return true;

  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id) {
    return false;
  }

  // Allow-all worlds: after DM approval, any player may open when unlocked.
  if (getSetting("allowAllPlayersToLoot") && state.dmApproved) return true;

  // Currently assigned / claimed session.
  if (state.activeLooterUserId === user.id) return true;
  if (canUserAccessAssignedLoot(state, user)) return true;

  // Leftovers on corpse inventory with no exclusive lock.
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
  if (isAwaitingDmReview(state)) return "LOOTFORGE.Notify.WaitingForGM";
  if (state?.freeForAll) return null;
  if (!isLootSessionLocked(state)) return null;
  if (state.activeLooterUserId === user?.id) return null;
  return "LOOTFORGE.Notify.LootBusy";
}
