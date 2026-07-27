import { MODULE_ID } from "./modules/constants.js";
import { log } from "./modules/logger.js";
import { registerLootIndicatorHooks } from "./modules/loot-indicator.js";
import { registerInvestigationReadyHook } from "./modules/loot-workflow.js";
import { registerSettings } from "./modules/settings.js";
import { registerSocketManager } from "./modules/socket-manager.js";
import { ensureWorldLootActors, registerContainerTokenHooks } from "./modules/world-actors.js";
import { registerSceneControls } from "./ui/scene-controls.js";
import { registerTokenDoubleClickLoot } from "./ui/token-dblclick.js";
import { registerLootKeybinding, registerTokenContext } from "./ui/token-context.js";
import { registerTokenHud } from "./ui/token-hud.js";
import { LootForgeAccess, publishWorldAccess } from "./auth/access.js";
import { restoreSessionOnStartup } from "./auth/entitlement-service.js";

Hooks.once("init", async () => {
  log.info("Initializing");

  registerSettings();
  registerLootKeybinding();
  registerSceneControls();

  await foundry.applications.handlebars.loadTemplates([
    `modules/${MODULE_ID}/templates/dm-loot-review.hbs`,
    `modules/${MODULE_ID}/templates/player-loot-window.hbs`,
    `modules/${MODULE_ID}/templates/access-window.hbs`,
    `modules/${MODULE_ID}/templates/auth-settings.hbs`
  ]);
});

Hooks.once("ready", () => {
  if (game.system.id !== "dnd5e") {
    log.warn(`Active system is "${game.system.id}". Only dnd5e is supported.`);
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.WrongSystem"));
    return;
  }

  registerSocketManager();
  registerInvestigationReadyHook();
  registerLootIndicatorHooks();
  registerTokenHud();
  registerTokenContext();
  registerTokenDoubleClickLoot();
  registerContainerTokenHooks();

  void ensureWorldLootActors();

  void (async () => {
    try {
      await restoreSessionOnStartup({ notify: false });
      if (game.user?.isGM) await publishWorldAccess();
    } catch (err) {
      log.warn("Auth startup failed safely", err?.message ?? err);
    }
  })();

  game.modules.get(MODULE_ID).api = {
    access: LootForgeAccess,
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
    },
    ensureWorldLootActors
  };

  log.info(`Ready v0.6.1 (dnd5e ${game.system.version}, Foundry ${game.version})`);
});
