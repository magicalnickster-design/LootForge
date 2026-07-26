/**
 * LootForge — module entry point.
 *
 * Initialization, hooks, controls, and public API registration only.
 */

import { MODULE_ID } from "./modules/constants.js";
import { log } from "./modules/logger.js";
import { registerLootIndicatorHooks } from "./modules/loot-indicator.js";
import { registerSettings } from "./modules/settings.js";
import { registerSocketManager } from "./modules/socket-manager.js";
import { registerSceneControls } from "./ui/scene-controls.js";
import { registerTokenDoubleClickLoot } from "./ui/token-dblclick.js";
import { registerLootKeybinding, registerTokenContext } from "./ui/token-context.js";
import { registerTokenHud } from "./ui/token-hud.js";

Hooks.once("init", async () => {
  log.info("Initializing");

  registerSettings();
  registerLootKeybinding();
  registerSceneControls();

  await foundry.applications.handlebars.loadTemplates([
    `modules/${MODULE_ID}/templates/dm-loot-review.hbs`,
    `modules/${MODULE_ID}/templates/player-loot-window.hbs`
  ]);
});

Hooks.once("ready", () => {
  if (game.system.id !== "dnd5e") {
    log.warn(`Active system is "${game.system.id}". Only dnd5e is supported.`);
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.WrongSystem"));
    return;
  }

  registerSocketManager();
  registerLootIndicatorHooks();
  registerTokenHud();
  registerTokenContext();
  registerTokenDoubleClickLoot();

  // Public API for macros / other modules.
  game.modules.get(MODULE_ID).api = {
    lootBody: async (token) => {
      const { lootBody } = await import("./modules/loot-workflow.js");
      return lootBody(token);
    },
    openDmReview: async (tokenDoc) => {
      const { openDmLootReview } = await import("./applications/dm-loot-review.js");
      return openDmLootReview(tokenDoc);
    },
    openPlayerWindow: async (tokenDoc) => {
      const { openPlayerLootWindow } = await import("./applications/player-loot-window.js");
      return openPlayerLootWindow(tokenDoc);
    }
  };

  log.info(`Ready v0.2.6 (dnd5e ${game.system.version}, Foundry ${game.version})`);
});
