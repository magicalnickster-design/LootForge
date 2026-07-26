/**
 * Authoritative corpse loot state on TokenDocument flags.lootforge.corpse
 */

import { CORPSE_FLAG, LEGACY_LOOTED_FLAG, MODULE_ID } from "./constants.js";
import { log } from "./logger.js";

/**
 * @typedef {object} CorpseLootItem
 * @property {string} entryId
 * @property {string} definitionId
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

  // Legacy v0.1.x: only a boolean looted flag.
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
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function isLootGenerated(tokenDoc) {
  return Boolean(getCorpseState(tokenDoc).generated);
}

/**
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function isCorpseLooted(tokenDoc) {
  const state = getCorpseState(tokenDoc);
  if (state.looted) return true;
  if (tokenDoc.getFlag(MODULE_ID, LEGACY_LOOTED_FLAG)) return true;
  return false;
}

/**
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function hasRemainingLoot(tokenDoc) {
  const state = getCorpseState(tokenDoc);
  return state.generated && !state.looted && (state.items?.some((i) => i.quantity > 0) ?? false);
}

/**
 * Persist corpse state. Prefer direct update when permitted; callers that need
 * GM relay should go through socket-manager.
 *
 * @param {TokenDocument} tokenDoc
 * @param {Partial<CorpseLootState>} patch
 * @returns {Promise<CorpseLootState>}
 */
export async function updateCorpseState(tokenDoc, patch) {
  if (!tokenDoc) throw new Error("Missing TokenDocument");

  const current = getCorpseState(tokenDoc);
  const next = foundry.utils.mergeObject(current, patch, { inplace: false });

  // Normalize items array when provided.
  if (Array.isArray(patch.items)) next.items = patch.items;

  await tokenDoc.update({
    [`flags.${MODULE_ID}.${CORPSE_FLAG}`]: next,
    [`flags.${MODULE_ID}.${LEGACY_LOOTED_FLAG}`]: Boolean(next.looted)
  });

  log.debug("Corpse state updated", tokenDoc.uuid, next);
  return next;
}

/**
 * Replace the entire corpse state (used by reset / fresh generation).
 * @param {TokenDocument} tokenDoc
 * @param {CorpseLootState} state
 */
export async function setCorpseState(tokenDoc, state) {
  return updateCorpseState(tokenDoc, foundry.utils.mergeObject(emptyCorpseState(), state, { inplace: false }));
}

/**
 * Clear generated loot (GM reset).
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
