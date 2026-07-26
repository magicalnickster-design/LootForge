/**
 * Scene control tool — Loot Body for the currently targeted or selected defeated token.
 *
 * This is the most reliable player path: target the corpse, then click the sack tool
 * on the Token controls (left toolbar).
 *
 * Foundry v13: getSceneControlButtons receives a Record keyed by control name.
 */

import { lootBody } from "../services/loot-workflow.js";
import { resolveLootTargetToken } from "./token-context.js";

/**
 * Register the token toolbar tool.
 */
export function registerSceneControls() {
  Hooks.on("getSceneControlButtons", (controls) => {
    // v13 object map; fall back if an older array shape is ever encountered.
    const tokenControl = controls.tokens ?? controls.token;
    if (!tokenControl?.tools) {
      console.warn("LootForge | Token scene controls not found; scene tool skipped.");
      return;
    }

    tokenControl.tools.lootforgeLootBody = {
      name: "lootforgeLootBody",
      title: "LOOTFORGE.HUD.LootBody",
      icon: "fa-solid fa-sack",
      button: true,
      visible: true,
      order: Object.keys(tokenControl.tools).length,
      onChange: async () => {
        const token = resolveLootTargetToken();
        if (!token) {
          ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.SelectOrTarget"));
          return;
        }
        await lootBody(token);
      }
    };
  });
}
