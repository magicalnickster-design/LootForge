/**
 * Context menu + Alt+L keybinding for LootForge.
 */

import { isCreatureDead } from "../modules/creature-context.js";
import { MODULE_ID } from "../modules/constants.js";
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

export function registerLootKeybinding() {
  game.keybindings.register(MODULE_ID, "lootTarget", {
    name: "LOOTFORGE.HUD.GenerateLoot",
    hint: "LOOTFORGE.Keybinding.LootTargetHint",
    editable: [{ key: "KeyL", modifiers: ["Alt"] }],
    onDown: async () => {
      const token = resolveLootTargetToken();
      if (!token) {
        ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.SelectOrTarget"));
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
    if (menuItems.some((entry) => entry?.icon?.includes("fa-sack") && String(entry.name).includes("LOOTFORGE"))) {
      return;
    }
    // ContextMenuEntry.name can be string or function in some builds — use localized string.
    const token = resolveLootTargetToken();
    const labelKey = token ? getLootActionLabelKey(token.document) : "LOOTFORGE.HUD.GenerateLoot";
    menuItems.push({
      name: game.i18n.localize(labelKey),
      icon: '<i class="fa-solid fa-sack"></i>',
      condition: () => {
        const t = resolveLootTargetToken();
        return Boolean(t?.document && isCreatureDead(t.document, t.actor));
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
