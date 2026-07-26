/**
 * Player-friendly Loot Body entry points:
 * - Token placeable right-click context menu
 * - Keyboard binding for the currently targeted/selected defeated token
 *
 * Left-click alone does nothing by design (Foundry selection). Players usually
 * cannot open the Token HUD on enemy corpses, so these paths matter.
 */

import { isDefeated } from "../services/creature-classifier.js";
import { lootBody } from "../services/loot-workflow.js";

const MODULE_ID = "lootforge";

/**
 * Prefer a targeted token, then hovered, then a single controlled token.
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
 * @param {Token|null} token
 * @returns {boolean}
 */
function canShowLootOption(token) {
  return Boolean(token?.document && isDefeated(token.document));
}

/**
 * Shared menu entry factory.
 * @returns {object}
 */
function buildLootMenuEntry() {
  return {
    name: "LOOTFORGE.HUD.LootBody",
    icon: '<i class="fa-solid fa-sack"></i>',
    condition: () => canShowLootOption(resolveLootTargetToken()),
    callback: async () => {
      const token = resolveLootTargetToken();
      if (!token) {
        ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.SelectOrTarget"));
        return;
      }
      await lootBody(token);
    }
  };
}

/**
 * Register keybinding during init.
 */
export function registerLootKeybinding() {
  game.keybindings.register(MODULE_ID, "lootTarget", {
    name: "LOOTFORGE.HUD.LootBody",
    hint: "LOOTFORGE.Keybinding.LootTargetHint",
    editable: [{ key: "KeyL", modifiers: ["Alt"] }],
    onDown: async () => {
      const token = resolveLootTargetToken();
      if (!token) {
        ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.SelectOrTarget"));
        return true;
      }
      if (!isDefeated(token.document)) {
        ui.notifications.warn(
          game.i18n.format("LOOTFORGE.Notify.NotDefeated", { name: token.name })
        );
        return true;
      }
      await lootBody(token);
      return true;
    }
  });
}

/**
 * Register context menu hooks during ready.
 */
export function registerTokenContext() {
  Hooks.on("getTokenPlaceableContextOptions", (_app, menuItems) => {
    menuItems.push(buildLootMenuEntry());
  });

  // Older / alternate hook name still seen in some builds.
  Hooks.on("getTokenContextOptions", (_app, menuItems) => {
    if (!Array.isArray(menuItems)) return;
    if (menuItems.some((entry) => entry?.name === "LOOTFORGE.HUD.LootBody")) return;
    menuItems.push(buildLootMenuEntry());
  });
}
