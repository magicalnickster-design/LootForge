/**
 * LootForge — module entry point.
 *
 * Prototype scope: D&D 5e wolf harvesting via Token HUD → Survival roll → loot dialog.
 */

import { registerSceneControls } from "./ui/scene-controls.js";
import { registerTokenHud } from "./ui/token-hud.js";

const MODULE_ID = "lootforge";

Hooks.once("init", async () => {
  console.log("LootForge | Initializing");

  await foundry.applications.handlebars.loadTemplates([
    `modules/${MODULE_ID}/templates/loot-dialog.hbs`
  ]);

  // Scene controls are collected during init/setup; register early.
  registerSceneControls();
});

Hooks.once("ready", () => {
  if (game.system.id !== "dnd5e") {
    console.warn(`LootForge | Active system is "${game.system.id}". Only dnd5e is supported in this prototype.`);
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.WrongSystem"));
    return;
  }

  registerTokenHud();
  console.log(`LootForge | Ready (dnd5e ${game.system.version}, Foundry ${game.version})`);
});
