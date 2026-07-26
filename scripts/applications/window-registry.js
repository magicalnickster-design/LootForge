/**
 * Track open LootForge windows so socket updates can refresh them.
 */

/** @type {Map<string, Set<object>>} tokenUuid → application instances */
const windows = new Map();

/**
 * @param {string} tokenUuid
 * @param {object} app
 */
export function registerLootWindow(tokenUuid, app) {
  if (!tokenUuid || !app) return;
  if (!windows.has(tokenUuid)) windows.set(tokenUuid, new Set());
  windows.get(tokenUuid).add(app);
}

/**
 * @param {string} tokenUuid
 * @param {object} app
 */
export function unregisterLootWindow(tokenUuid, app) {
  windows.get(tokenUuid)?.delete(app);
}

/**
 * Re-render (or close if empty/looted) all windows for a token.
 * @param {string} tokenUuid
 */
export function refreshLootWindows(tokenUuid) {
  const set = windows.get(tokenUuid);
  if (!set?.size) return;
  for (const app of [...set]) {
    try {
      if (typeof app.onCorpseStateChanged === "function") app.onCorpseStateChanged();
      else if (app.rendered) app.render({ force: true });
    } catch (err) {
      console.error("LootForge | Failed to refresh window", err);
    }
  }
}
