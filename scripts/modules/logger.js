import { MODULE_ID } from "./constants.js";

/**
 * Prefixed logging. Detailed logs only when debug setting is enabled.
 */
export const log = {
  info(...args) {
    console.log("LootForge |", ...args);
  },
  warn(...args) {
    console.warn("LootForge |", ...args);
  },
  error(...args) {
    console.error("LootForge |", ...args);
  },
  debug(...args) {
    try {
      if (game?.settings?.get(MODULE_ID, "debugLogging")) {
        console.debug("LootForge |", ...args);
      }
    } catch {
      // Settings may not be registered yet during early init.
    }
  }
};
