/**
 * Authoritative corpse loot state on TokenDocument flags.lootforge.corpse
 */

import { CORPSE_FLAG, LEGACY_LOOTED_FLAG, MODULE_ID } from "./constants.js";
import { log } from "./logger.js";

/**
 * @typedef {object} CorpseLootItem
 * @property {string} entryId
 * @property {string} definitionId
 * @property {string} [itemUuid]
 * @property {object} [itemData]
 * @property {string} name
 * @property {number} quantity
 * @property {string} img
 * @property {string} rarity
 * @property {string} valueText
 * @property {string} description
 */

/**
 * @typedef {object} CorpseLootState
 * @property {boolean} generated
 * @property {number|null} generatedAt
 * @property {string|null} generatedBy
 * @property {object|null} creatureContext
 * @property {number|null} survivalTotal
 * @property {number|null} naturalDie
 * @property {string|null} rollQuality
 * @property {string|null} assignedActorId
 * @property {string|null} assignedUserId
 * @property {string|null} activeLooterUserId
 * @property {string|null} activeLooterActorId
 * @property {string|null} activeLooterName
 * @property {CorpseLootItem[]} items
 * @property {object} currency
 * @property {boolean} looted
 * @property {number|null} lootedAt
 * @property {string|null} profileId
 */

/** @returns {CorpseLootState} */
export function emptyCorpseState() {
  return {
    generated: false,
    generatedAt: null,
    generatedBy: null,
    creatureContext: null,
    survivalTotal: null,
    naturalDie: null,
    rollQuality: null,
    assignedActorId: null,
    assignedUserId: null,
    activeLooterUserId: null,
    activeLooterActorId: null,
    activeLooterName: null,
    items: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    looted: false,
    lootedAt: null,
    profileId: null
  };
}

/**
 * @param {TokenDocument} tokenDoc
 * @returns {CorpseLootState}
 */
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

/**
 * @param {Item} item
 * @returns {boolean}
 */
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

/**
 * Leftover loot sitting on the dead creature's actor inventory (WoW-style).
 * @param {TokenDocument} tokenDoc
 * @returns {Item[]}
 */
export function getCorpseInventoryLootItems(tokenDoc) {
  const actor = tokenDoc?.actor;
  if (!actor?.items) return [];
  return actor.items.filter((item) => isLootForgeItem(item));
}

/**
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function corpseHasInventoryLoot(tokenDoc) {
  return getCorpseInventoryLootItems(tokenDoc).length > 0;
}

/**
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function isLootGenerated(tokenDoc) {
  const state = getCorpseState(tokenDoc);
  return Boolean(state.generated) || corpseHasInventoryLoot(tokenDoc);
}

/**
 * True when there is nothing left in the loot window pool or corpse inventory.
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function isCorpseLooted(tokenDoc) {
  if (hasRemainingLoot(tokenDoc)) return false;
  const state = getCorpseState(tokenDoc);
  if (state.looted) return true;
  if (tokenDoc.getFlag(MODULE_ID, LEGACY_LOOTED_FLAG)) return true;
  return false;
}

/**
 * Loot still available in the active window pool and/or corpse inventory.
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function hasRemainingLoot(tokenDoc) {
  const state = getCorpseState(tokenDoc);
  if (state.items?.some((i) => Number(i.quantity) > 0)) return true;
  return corpseHasInventoryLoot(tokenDoc);
}

/**
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function hasActiveLootWindowItems(tokenDoc) {
  const state = getCorpseState(tokenDoc);
  return state.items?.some((i) => Number(i.quantity) > 0) ?? false;
}

/**
 * @param {CorpseLootState} state
 * @returns {User|null}
 */
export function getActiveLooterUser(state) {
  if (!state?.activeLooterUserId) return null;
  return game.users.get(state.activeLooterUserId) ?? null;
}

/**
 * Active looter lock is held by a still-connected user.
 * @param {CorpseLootState} state
 * @returns {boolean}
 */
export function isLootSessionLocked(state) {
  const user = getActiveLooterUser(state);
  return Boolean(user?.active);
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {Partial<CorpseLootState>} patch
 * @returns {Promise<CorpseLootState>}
 */
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

/**
 * @param {CorpseLootState} state
 * @param {TokenDocument} tokenDoc
 */
function hasRemainingLootItems(state, tokenDoc) {
  if (state.items?.some((i) => Number(i.quantity) > 0)) return true;
  // Inventory loot checked after update may still be mid-flight; ignore here.
  return false;
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {CorpseLootState} state
 */
export async function setCorpseState(tokenDoc, state) {
  return updateCorpseState(tokenDoc, foundry.utils.mergeObject(emptyCorpseState(), state, { inplace: false }));
}

/**
 * @param {TokenDocument} tokenDoc
 */
export async function clearCorpseState(tokenDoc) {
  await tokenDoc.unsetFlag(MODULE_ID, CORPSE_FLAG);
  await tokenDoc.unsetFlag(MODULE_ID, LEGACY_LOOTED_FLAG);
  await tokenDoc.unsetFlag(MODULE_ID, "hasLoot");
  log.info("Corpse loot reset", tokenDoc.uuid);
  return emptyCorpseState();
}

/**
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function canUserModifyToken(tokenDoc) {
  if (!tokenDoc) return false;
  if (game.user.isGM) return true;
  if (typeof tokenDoc.canUserModify === "function") {
    return tokenDoc.canUserModify(game.user, "update");
  }
  return false;
}
