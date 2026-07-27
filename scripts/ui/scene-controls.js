import { lootBody } from "../modules/loot-workflow.js";
import { resolveLootTargetToken } from "./token-context.js";

export function registerSceneControls() {
  Hooks.on("getSceneControlButtons", (controls) => {
    const tokenControl = controls.tokens ?? controls.token;
    if (!tokenControl?.tools) {
      console.warn("LootForge | Token scene controls not found; scene tool skipped.");
      return;
    }

    tokenControl.tools.lootforgeLootBody = {
      name: "lootforgeLootBody",
      title: "LOOTFORGE.HUD.LootTargetedBody",
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
