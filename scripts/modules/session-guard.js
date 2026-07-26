/**
 * Prevent overlapping loot / Investigation flows for the same corpse (per client).
 */

import { log } from "./logger.js";

/** @type {Set<string>} tokenUuid currently running lootBody */
const lootInFlight = new Set();

/**
 * Token UUIDs that already used their single Investigation attempt.
 * Cleared only on corpse loot reset.
 * @type {Set<string>}
 */
const investigationClaimed = new Set();

/**
 * @param {string} tokenUuid
 * @returns {boolean} true if lock acquired
 */
export function beginLootFlow(tokenUuid) {
  if (!tokenUuid) return false;
  if (lootInFlight.has(tokenUuid)) {
    log.info("Loot flow already in progress — ignoring duplicate", { tokenUuid });
    ui.notifications?.info?.(game.i18n.localize("LOOTFORGE.Notify.LootInProgress"));
    return false;
  }
  lootInFlight.add(tokenUuid);
  return true;
}

/**
 * @param {string} tokenUuid
 */
export function endLootFlow(tokenUuid) {
  if (tokenUuid) lootInFlight.delete(tokenUuid);
}

/**
 * @param {string} tokenUuid
 */
export function isLootFlowInProgress(tokenUuid) {
  return lootInFlight.has(tokenUuid);
}

/**
 * @param {string} tokenUuid
 * @returns {boolean}
 */
export function hasInvestigationClaim(tokenUuid) {
  return Boolean(tokenUuid) && investigationClaimed.has(tokenUuid);
}

/**
 * Reserve the single Investigation slot for this corpse on this client.
 * @param {string} tokenUuid
 * @returns {boolean} true if this client may roll
 */
export function claimInvestigationLocal(tokenUuid) {
  if (!tokenUuid) return false;
  if (investigationClaimed.has(tokenUuid)) {
    log.info("Investigation already claimed locally — blocking spam", { tokenUuid });
    return false;
  }
  investigationClaimed.add(tokenUuid);
  return true;
}

/**
 * Mark corpse as Investigation-claimed (e.g. after remote flag sync).
 * @param {string} tokenUuid
 */
export function markInvestigationClaimed(tokenUuid) {
  if (tokenUuid) investigationClaimed.add(tokenUuid);
}

/**
 * Release local Investigation claim (failed claim, or corpse reset).
 * @param {string} tokenUuid
 */
export function releaseInvestigationClaim(tokenUuid) {
  if (tokenUuid) investigationClaimed.delete(tokenUuid);
}
