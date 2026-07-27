import { CORPSE_FLAG, LEGACY_LOOTED_FLAG, MODULE_ID } from "./constants.js";
import { isLootableTarget } from "./creature-context.js";
import { log } from "./logger.js";

export function emptyCorpseState() {
  return {
    generated: false,
    generatedAt: null,
    generatedBy: null,
    creatureContext: null,
    survivalTotal: null,
    naturalDie: null,
    lootSkill: null,
    rollQuality: null,
    assignedActorId: null,
    assignedUserId: null,
    activeLooterUserId: null,
    activeLooterActorId: null,
    activeLooterName: null,
    pendingReview: false,
    dmApproved: false,
    freeForAll: false,
    pendingLooterActorId: null,
    pendingLooterUserId: null,
    pendingInvestigation: null,
    items: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    looted: false,
    lootedAt: null,
    profileId: null
  };
}

export function isInvestigationPending(state) {
  const pending = state?.pendingInvestigation;
  if (!pending || typeof pending !== "object") return false;
  if (Number.isFinite(Number(pending.total))) return true;
  if (pending.claiming) {
    const age = Date.now() - Number(pending.at || 0);
    return Number.isFinite(age) && age >= 0 && age < 20000;
  }
  return false;
}

export function getCorpseState(tokenDoc) {
  if (!tokenDoc) return emptyCorpseState();

  const stored = tokenDoc.getFlag(MODULE_ID, CORPSE_FLAG);
  if (stored && typeof stored === "object") {
    return foundry.utils.mergeObject(emptyCorpseState(), stored, { inplace: false });
  }

  if (tokenDoc.getFlag(MODULE_ID, LEGACY_LOOTED_FLAG)) {
    const legacy = emptyCorpseState();
    legacy.generated = true;
    legacy.looted = true;
    legacy.lootedAt = Date.now();
    return legacy;
  }

  return emptyCorpseState();
}

export function isLootForgeItem(item) {
  if (!item) return false;
  const flags = item.flags?.lootforge ?? {};
  if (flags.generatedByLootForge) return true;
  if (flags.definitionId || flags.stackingKey) return true;
  try {
    if (item.getFlag?.(MODULE_ID, "generatedByLootForge")) return true;
    if (item.getFlag?.(MODULE_ID, "definitionId")) return true;
  } catch {
    // ignore
  }
  return false;
}

export function getCorpseInventoryLootItems(tokenDoc) {
  const actor = tokenDoc?.actor;
  if (!actor?.items) return [];
  return actor.items.filter((item) => isLootForgeItem(item));
}

export function corpseHasInventoryLoot(tokenDoc) {
  return getCorpseInventoryLootItems(tokenDoc).length > 0;
}

export function isLootGenerated(tokenDoc) {
  const state = getCorpseState(tokenDoc);
  if (state.generated) return true;
  if (!isLootableTarget(tokenDoc, tokenDoc?.actor)) return false;
  return corpseHasInventoryLoot(tokenDoc);
}

export function isCorpseLooted(tokenDoc) {
  if (hasRemainingLoot(tokenDoc)) return false;
  const state = getCorpseState(tokenDoc);
  if (state.looted) return true;
  if (tokenDoc.getFlag(MODULE_ID, LEGACY_LOOTED_FLAG)) return true;
  return false;
}

export function hasRemainingLoot(tokenDoc) {
  const state = getCorpseState(tokenDoc);
  if (state.items?.some((i) => Number(i.quantity) > 0)) return true;
  if (!isLootableTarget(tokenDoc, tokenDoc?.actor)) return false;
  return corpseHasInventoryLoot(tokenDoc);
}

export function hasActiveLootWindowItems(tokenDoc) {
  const state = getCorpseState(tokenDoc);
  return state.items?.some((i) => Number(i.quantity) > 0) ?? false;
}

export function getActiveLooterUser(state) {
  if (!state?.activeLooterUserId) return null;
  return game.users.get(state.activeLooterUserId) ?? null;
}

export function isLootSessionLocked(state) {
  if (state?.freeForAll) return false;
  if (state?.pendingReview && !state?.dmApproved) return false;
  const user = getActiveLooterUser(state);
  return Boolean(user?.active);
}

export function isAwaitingDmReview(state) {
  return Boolean(state?.pendingReview && !state?.dmApproved);
}

export async function updateCorpseState(tokenDoc, patch) {
  if (!tokenDoc) throw new Error("Missing TokenDocument");

  const current = getCorpseState(tokenDoc);
  const next = foundry.utils.mergeObject(current, patch, { inplace: false });
  if (Array.isArray(patch.items)) next.items = patch.items;

  await tokenDoc.update({
    [`flags.${MODULE_ID}.${CORPSE_FLAG}`]: next,
    [`flags.${MODULE_ID}.${LEGACY_LOOTED_FLAG}`]: Boolean(next.looted && !hasRemainingLootItems(next, tokenDoc))
  });

  log.debug("Corpse state updated", tokenDoc.uuid, next);
  return next;
}

function hasRemainingLootItems(state, tokenDoc) {
  if (state.items?.some((i) => Number(i.quantity) > 0)) return true;
  return false;
}

export async function setCorpseState(tokenDoc, state) {
  return updateCorpseState(tokenDoc, foundry.utils.mergeObject(emptyCorpseState(), state, { inplace: false }));
}

export async function clearCorpseState(tokenDoc) {
  await tokenDoc.unsetFlag(MODULE_ID, CORPSE_FLAG);
  await tokenDoc.unsetFlag(MODULE_ID, LEGACY_LOOTED_FLAG);
  await tokenDoc.unsetFlag(MODULE_ID, "hasLoot");
  log.info("Corpse loot reset", tokenDoc.uuid);
  return emptyCorpseState();
}

export function canUserModifyToken(tokenDoc) {
  if (!tokenDoc) return false;
  if (game.user.isGM) return true;
  if (typeof tokenDoc.canUserModify === "function") {
    return tokenDoc.canUserModify(game.user, "update");
  }
  return false;
}
