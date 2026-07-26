/**
 * Alt+L keybinding for LootForge.
 * Corpse looting itself is double-left-click only (Token patch / sparkles).
 * No right-click context menu entry — that was a single-action loot path.
 */

import { isLootableTarget } from "../modules/creature-context.js";
import { MODULE_ID } from "../modules/constants.js";
import {
  getCorpseState,
  hasRemainingLoot,
  isAwaitingDmReview,
  isLootGenerated
} from "../modules/loot-storage.js";
import { canUserLootCorpse } from "../modules/ownership.js";
import { lootBody } from "../modules/loot-workflow.js";

/**
 * Prefer targeted, then hovered, then single controlled token.
 * @returns {Token|null}
 */
export function resolveLootTargetToken() {
  const targeted = [...(game.user.targets ?? [])];
  if (targeted.length === 1) return targeted[0];
  if (canvas.tokens?.hover?.actor) return canvas.tokens.hover;
  const controlled = canvas.tokens?.controlled ?? [];
  if (controlled.length === 1) return controlled[0];
  return null;
}

/**
 * Nearest corpse on the current scene that this user may loot.
 * @returns {Token|null}
 */
export function resolveNearestLootableCorpse() {
  const placeables = canvas.tokens?.placeables ?? [];
  const candidates = placeables.filter((token) => {
    const doc = token.document;
    if (!doc || !isLootableTarget(doc, token.actor)) return false;
    if (game.user.isGM) {
      return !isLootGenerated(doc) || hasRemainingLoot(doc) || isAwaitingDmReview(getCorpseState(doc));
    }
    if (!isLootGenerated(doc)) return true;
    if (!hasRemainingLoot(doc)) return false;
    return canUserLootCorpse(doc, game.user);
  });
  if (!candidates.length) return null;

  const origin = canvas.tokens.controlled[0]
    ?? game.user.character?.getActiveTokens?.(true)?.[0]
    ?? null;

  if (!origin) return candidates[0];

  let best = null;
  let bestDist = Infinity;
  for (const token of candidates) {
    const dx = token.center.x - origin.center.x;
    const dy = token.center.y - origin.center.y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = token;
    }
  }
  return best;
}

/** @deprecated Use resolveNearestLootableCorpse */
export const resolveNearestAssignedCorpse = resolveNearestLootableCorpse;

/**
 * Targeted corpse, else nearest lootable corpse.
 * @returns {Token|null}
 */
export function resolveLootHotkeyToken() {
  const targeted = resolveLootTargetToken();
  if (targeted) {
    const doc = targeted.document;
    if (doc && isLootableTarget(doc, targeted.actor)) return targeted;
  }
  return resolveNearestLootableCorpse();
}

export function registerLootKeybinding() {
  game.keybindings.register(MODULE_ID, "lootTarget", {
    name: "LOOTFORGE.HUD.LootTargetedBody",
    hint: "LOOTFORGE.Keybinding.LootTargetHint",
    editable: [{ key: "KeyL", modifiers: ["Alt"] }],
    onDown: async () => {
      const token = resolveLootHotkeyToken();
      if (!token) {
        ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoAssignedCorpse"));
        return true;
      }
      await lootBody(token);
      return true;
    }
  });
}

/**
 * No-op — right-click context loot removed (double-left-click only).
 */
export function registerTokenContext() {
  // Intentionally empty.
}
