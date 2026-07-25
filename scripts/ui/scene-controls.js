/**
 * Scene control tool — Loot Body for the currently targeted or selected defeated token.
 *
 * Useful when players cannot reliably open the Token HUD on an enemy corpse.
 * Foundry v13: getSceneControlButtons receives a Record keyed by control name.
 */

import { lootBody } from "../services/loot-workflow.js";

/**
 * Resolve exactly one defeated-candidate token from targets, then controlled.
 * Validation of defeated/looted state happens inside lootBody.
 * @returns {Token|null}
 */
function resolveLootTarget() {
  const targeted = [...(game.user.targets ?? [])];
  if (targeted.length === 1) return targeted[0];

  const controlled = canvas.tokens?.controlled ?? [];
  if (controlled.length === 1) return controlled[0];

  return null;
}

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
      order: Object.keys(tokenControl.tools).length,
      onChange: async () => {
        const token = resolveLootTarget();
        if (!token) {
          ui.notifications.warn("Select or target exactly one defeated creature, then click Loot Body.");
          return;
        }
        await lootBody(token);
      }
    };
  });
}
