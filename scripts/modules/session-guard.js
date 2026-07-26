/**
 * Prevent overlapping loot flows for the same corpse (per client).
 */

import { log } from "./logger.js";

/** @type {Set<string>} tokenUuid currently running lootBody */
const lootInFlight = new Set();

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
