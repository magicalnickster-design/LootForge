/**
 * Prevent overlapping loot / Investigation flows for the same corpse.
 */

import { log } from "./logger.js";

/** @type {Set<string>} tokenUuid currently running lootBody / generate */
const lootInFlight = new Set();

/** @type {string|null} active Investigation dialog request on this client */
let activeInvestigationRequestId = null;

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
 * Best-effort close of leftover Investigation confirm dialogs.
 */
function closeStrayInvestigationDialogs() {
  try {
    const apps = foundry?.applications?.instances;
    if (apps?.values) {
      for (const app of apps.values()) {
        const title = String(app?.title ?? app?.window?.title ?? "");
        if (/investigation|lootforge/i.test(title)) {
          void app.close?.({ force: true });
        }
      }
    }
  } catch {
    // ignore UI close failures
  }
}

/**
 * Claim the Investigation dialog slot. Only one prompt per client.
 * Supersedes any prior prompt so stacked dialogs cannot accumulate.
 * @param {string} requestId
 * @returns {boolean} true if this client may show the Investigation UI
 */
export function beginInvestigationDialog(requestId) {
  if (!requestId) return false;
  if (activeInvestigationRequestId && activeInvestigationRequestId !== requestId) {
    log.info("Superseding Investigation prompt", {
      previous: activeInvestigationRequestId,
      next: requestId
    });
    closeStrayInvestigationDialogs();
  }
  activeInvestigationRequestId = requestId;
  return true;
}

/**
 * @param {string} [requestId]
 */
export function endInvestigationDialog(requestId = null) {
  if (!requestId || activeInvestigationRequestId === requestId) {
    activeInvestigationRequestId = null;
  }
}

/**
 * Force-clear Investigation dialog lock (e.g. remote cancel).
 * @param {string} [requestId]
 * @returns {boolean} true if the active dialog matched and was cleared
 */
export function cancelInvestigationDialog(requestId = null) {
  if (!activeInvestigationRequestId) return false;
  if (requestId && activeInvestigationRequestId !== requestId) return false;
  activeInvestigationRequestId = null;
  closeStrayInvestigationDialogs();
  return true;
}

/**
 * @returns {boolean}
 */
export function hasOpenInvestigationDialog() {
  return Boolean(activeInvestigationRequestId);
}

/**
 * @returns {string|null}
 */
export function getActiveInvestigationRequestId() {
  return activeInvestigationRequestId;
}
