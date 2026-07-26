/**
 * Resolve which users own an assigned loot character.
 * Players often have OWNER, but also may only be linked via user.character.
 */

/**
 * Ownership level helper that works across Foundry 13/14.
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

  // Primary character assignment (common player setup).
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
 * Can this user open the player loot window / loot bag for an assigned corpse?
 * Does not require ownership of the enemy token.
 *
 * @param {import("./loot-storage.js").CorpseLootState} state
 * @param {User} [user]
 * @returns {boolean}
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
