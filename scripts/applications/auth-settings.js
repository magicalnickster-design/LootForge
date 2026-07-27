import { MODULE_ID } from "../modules/constants.js";
import { getAccessStatus, refreshAccessAndPublish } from "../auth/access.js";
import {
  checkSubscription
} from "../auth/entitlement-service.js";
import {
  logoutLootForge,
  openAccountPage,
  openLoginWindow
} from "../auth/login-window.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class LootForgeAuthSettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "lootforge-auth-settings",
    classes: ["lootforge", "lootforge-auth-settings"],
    tag: "div",
    position: { width: 520, height: "auto" },
    window: {
      title: "LOOTFORGE.Settings.Auth.MenuName",
      icon: "fa-solid fa-user-shield",
      resizable: true,
      contentClasses: ["standard-form"]
    },
    actions: {
      signIn: LootForgeAuthSettings.#onSignIn,
      logout: LootForgeAuthSettings.#onLogout,
      checkSubscription: LootForgeAuthSettings.#onCheck,
      openAccount: LootForgeAuthSettings.#onAccount
    }
  };

  static PARTS = {
    body: {
      template: `modules/${MODULE_ID}/templates/auth-settings.hbs`
    }
  };

  async _prepareContext() {
    const status = getAccessStatus();
    return {
      signedIn: status.signedIn,
      accountEmail: status.accountLabel || game.i18n.localize("LOOTFORGE.Access.NoAccount"),
      plan: status.plan || "—",
      accessLabel: status.canUse
        ? game.i18n.localize("LOOTFORGE.Settings.Auth.AccessGranted")
        : game.i18n.localize("LOOTFORGE.Settings.Auth.AccessLocked"),
      expiresAt: status.expiresAt || "—",
      authState: status.authState,
      worldActive: status.worldActive,
      message: status.message
    };
  }

  static async #onSignIn() {
    await openLoginWindow();
    const app = foundry.applications.instances.get("lootforge-auth-settings");
    if (app?.rendered) await app.render({ force: true });
  }

  static async #onLogout() {
    await logoutLootForge();
    const app = foundry.applications.instances.get("lootforge-auth-settings");
    if (app?.rendered) await app.render({ force: true });
  }

  static async #onCheck() {
    await checkSubscription({ notify: true });
    await refreshAccessAndPublish({ notify: false });
    const app = foundry.applications.instances.get("lootforge-auth-settings");
    if (app?.rendered) await app.render({ force: true });
  }

  static async #onAccount() {
    openAccountPage();
  }
}

export function openAuthSettings() {
  const existing = foundry.applications.instances.get("lootforge-auth-settings");
  if (existing) {
    existing.render({ force: true });
    return existing;
  }
  const app = new LootForgeAuthSettings();
  app.render({ force: true });
  return app;
}
