const windows = new Map();

export function registerLootWindow(tokenUuid, app) {
  if (!tokenUuid || !app) return;
  if (!windows.has(tokenUuid)) windows.set(tokenUuid, new Set());
  windows.get(tokenUuid).add(app);
}

export function unregisterLootWindow(tokenUuid, app) {
  windows.get(tokenUuid)?.delete(app);
}

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
