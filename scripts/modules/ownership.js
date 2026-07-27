import { getSetting } from "./settings.js";
import {
  corpseHasInventoryLoot,
  getCorpseState,
  hasRemainingLoot,
  isAwaitingDmReview,
  isLootSessionLocked
} from "./loot-storage.js";

function ownerLevel() {
  return CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3;
}

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

export function resolveAssignedOwnerUsers(actor, { activeOnly = false } = {}) {
  if (!actor) return [];
  return game.users.filter((user) => {
    if (user.isGM) return false;
    if (!userOwnsActor(actor, user)) return false;
    if (activeOnly && !user.active) return false;
    return true;
  });
}

export function canUserAccessAssignedLoot(state, user = game.user) {
  if (!state || !user) return false;
  if (user.isGM) return true;
  if (!state.assignedActorId) return false;
  if (state.assignedUserId && state.assignedUserId === user.id) return true;
  const actor = game.actors.get(state.assignedActorId);
  if (!actor) return false;
  return userOwnsActor(actor, user);
}

export function canUserReceiveLootAs(actor, user = game.user) {
  if (!actor || !user) return false;
  if (user.isGM) return true;
  if (user.character?.id === actor.id) return true;
  if (userOwnsActor(actor, user)) return true;
  try {
    if (typeof actor.testUserPermission === "function") {
      if (actor.testUserPermission(user, "OWNER")) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function canUserLootCorpse(tokenDoc, user = game.user) {
  if (!tokenDoc || !user) return false;
  if (user.isGM) return true;
  if (!hasRemainingLoot(tokenDoc)) return false;

  const state = getCorpseState(tokenDoc);

  if (isAwaitingDmReview(state)) return false;

  if (state.freeForAll || state.dmApproved) return true;

  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id) {
    return false;
  }

  if (getSetting("allowAllPlayersToLoot") && state.dmApproved) return true;

  if (state.activeLooterUserId === user.id) return true;
  if (canUserAccessAssignedLoot(state, user)) return true;

  if (!state.assignedActorId && !state.activeLooterUserId && corpseHasInventoryLoot(tokenDoc)) {
    return true;
  }

  return false;
}

export function getLootBusyReasonKey(state, user = game.user) {
  if (isAwaitingDmReview(state)) return "LOOTFORGE.Notify.WaitingForGM";
  if (state?.freeForAll) return null;
  if (!isLootSessionLocked(state)) return null;
  if (state.activeLooterUserId === user?.id) return null;
  return "LOOTFORGE.Notify.LootBusy";
}
