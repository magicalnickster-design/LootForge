/**
 * Loot protection flags.
 *
 * Stored on the TokenDocument so each placed creature can be looted once,
 * even when multiple tokens share a linked Actor.
 *
 * Flag path: flags.lootforge.looted
 */

export const MODULE_ID = "lootforge";
export const LOOTED_FLAG = "looted";

/**
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function isLooted(tokenDoc) {
  return Boolean(tokenDoc?.getFlag?.(MODULE_ID, LOOTED_FLAG));
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {boolean} value
 * @returns {Promise<TokenDocument|undefined>}
 */
export async function setLooted(tokenDoc, value = true) {
  if (!tokenDoc) {
    console.error("LootForge | setLooted called without a TokenDocument");
    return undefined;
  }
  return tokenDoc.setFlag(MODULE_ID, LOOTED_FLAG, Boolean(value));
}

/**
 * GM helper to clear the looted flag for retesting.
 * @param {TokenDocument} tokenDoc
 * @returns {Promise<TokenDocument|undefined>}
 */
export async function resetLooted(tokenDoc) {
  if (!tokenDoc) return undefined;
  if (!game.user.isGM) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.PermissionDenied").replace("{name}", tokenDoc.name));
    return undefined;
  }
  // unsetFlag removes the key entirely rather than leaving false clutter.
  await tokenDoc.unsetFlag(MODULE_ID, LOOTED_FLAG);
  ui.notifications.info(game.i18n.format("LOOTFORGE.Notify.FlagReset", { name: tokenDoc.name }));
  return tokenDoc;
}
