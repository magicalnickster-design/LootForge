/**
 * Context menu + Alt+L keybinding for LootForge.
 */

import { isCreatureDead } from "../modules/creature-context.js";
import { MODULE_ID } from "../modules/constants.js";
import {
  getCorpseState,
  hasRemainingLoot,
  isLootGenerated
} from "../modules/loot-storage.js";
import { canUserAccessAssignedLoot } from "../modules/ownership.js";
import { getLootActionLabelKey, lootBody } from "../modules/loot-workflow.js";

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
export function resolveNearestAssignedCorpse() {
  const placeables = canvas.tokens?.placeables ?? [];
  const candidates = placeables.filter((token) => {
    const doc = token.document;
    if (!doc || !isCreatureDead(doc, token.actor)) return false;
    if (!isLootGenerated(doc) || !hasRemainingLoot(doc)) return false;
    const state = getCorpseState(doc);
    if (game.user.isGM) return true;
    return canUserAccessAssignedLoot(state, game.user);
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

/**
 * Targeted corpse, else nearest assigned corpse.
 * @returns {Token|null}
 */
export function resolveLootHotkeyToken() {
  const targeted = resolveLootTargetToken();
  if (targeted) {
    const doc = targeted.document;
    if (doc && isCreatureDead(doc, targeted.actor)) return targeted;
  }
  return resolveNearestAssignedCorpse();
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

export function registerTokenContext() {
  const pushEntry = (_app, menuItems) => {
    if (!Array.isArray(menuItems)) return;
    if (menuItems.some((entry) => entry?.icon?.includes("fa-sack") && String(entry.name).includes("Loot"))) {
      return;
    }

    menuItems.push({
      name: game.i18n.localize("LOOTFORGE.HUD.LootBody"),
      icon: '<i class="fa-solid fa-sack"></i>',
      condition: () => {
        const t = resolveLootTargetToken();
        if (!t?.document || !isCreatureDead(t.document, t.actor)) return false;
        if (game.user.isGM) return true;
        const state = getCorpseState(t.document);
        // Players: only when loot exists and is assigned to them (or unassigned hide).
        if (!isLootGenerated(t.document) || !hasRemainingLoot(t.document)) return false;
        return canUserAccessAssignedLoot(state, game.user);
      },
      callback: async () => {
        const t = resolveLootTargetToken();
        if (!t) {
          ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.SelectOrTarget"));
          return;
        }
        await lootBody(t);
      }
    });
  };

  Hooks.on("getTokenPlaceableContextOptions", pushEntry);
  Hooks.on("getTokenContextOptions", pushEntry);
}
