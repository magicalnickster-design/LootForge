/**
 * Subtle visual feedback when a corpse has generated loot.
 * Uses token flags + CSS tint via canvas refresh; avoids inventing status effects
 * that may conflict with dnd5e.
 */

import { MODULE_ID } from "./constants.js";
import { getSetting } from "./settings.js";
import { hasRemainingLoot, isCorpseLooted, isLootGenerated } from "./loot-storage.js";
import { log } from "./logger.js";

/**
 * Sync indicator flag used by HUD/context labels and optional token effect.
 * @param {TokenDocument} tokenDoc
 */
export async function syncLootIndicator(tokenDoc) {
  if (!tokenDoc || !getSetting("showLootIndicators")) return;

  const show = isLootGenerated(tokenDoc) && hasRemainingLoot(tokenDoc) && !isCorpseLooted(tokenDoc);
  const current = Boolean(tokenDoc.getFlag(MODULE_ID, "hasLoot"));

  if (show === current) return;

  try {
    if (tokenDoc.canUserModify?.(game.user, "update") || game.user.isGM) {
      if (show) await tokenDoc.setFlag(MODULE_ID, "hasLoot", true);
      else await tokenDoc.unsetFlag(MODULE_ID, "hasLoot");
    }
  } catch (err) {
    log.debug("Could not sync loot indicator flag", err);
  }
}

/**
 * CSS class helper for placeable tokens (called from hooks).
 * @param {Token} token
 */
export function applyTokenLootClass(token) {
  if (!token?.document || !getSetting("showLootIndicators")) return;
  const el = token.element ?? token.mesh?.parent;
  // Token DOM wrappers vary by Foundry version; toggle a documented flag for HUD instead.
  const has = Boolean(token.document.getFlag(MODULE_ID, "hasLoot"));
  token.document.flags ??= {};
  // No-op beyond flag; HUD/context read hasLoot / corpse state.
  return has;
}
