import { MODULE_ID } from "../modules/constants.js";
import { getAccessStatus, refreshAccessAndPublish } from "../auth/access.js";
import {
  logoutLootForge,
  openAccountPage,
  openLoginWindow
} from "../auth/login-window.js";
import { checkSubscription } from "../auth/entitlement-service.js";
import * as SessionStore from "../auth/session-store.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class LootForgeAccessWindow extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "lootforge-access-window",
    classes: ["lootforge", "lootforge-access-window"],
    tag: "div",
    position: { width: 460, height: "auto" },
    window: {
      title: "LOOTFORGE.Access.Title",
      icon: "fa-solid fa-lock",
      resizable: false,
      contentClasses: ["standard-form"]
    },
    actions: {
      signIn: LootForgeAccessWindow.#onSignIn,
      checkSubscription: LootForgeAccessWindow.#onCheck,
      openWebsite: LootForgeAccessWindow.#onWebsite,
      logout: LootForgeAccessWindow.#onLogout
    }
  };

  static PARTS = {
    body: {
      template: `modules/${MODULE_ID}/templates/access-window.hbs`
    }
  };

  async _prepareContext() {
    const status = getAccessStatus();
    const signedIn = Boolean(SessionStore.getAccessToken() || SessionStore.getRefreshToken() || status.accountEmail);
    return {
      brand: game.i18n.localize("LOOTFORGE.Title"),
      message: status.message || game.i18n.localize("LOOTFORGE.Access.Required"),
      accountEmail: status.accountEmail || game.i18n.localize("LOOTFORGE.Access.NoAccount"),
      plan: status.plan || "—",
      expiresAt: status.expiresAt || "—",
      signedIn,
      isGM: Boolean(game.user?.isGM)
    };
  }

  static async #onSignIn() {
    await openLoginWindow();
    const app = foundry.applications.instances.get("lootforge-access-window");
    if (app?.rendered) await app.render({ force: true });
  }

  static async #onCheck() {
    await checkSubscription({ notify: true });
    await refreshAccessAndPublish({ notify: false });
    const app = foundry.applications.instances.get("lootforge-access-window");
    if (app?.rendered) await app.render({ force: true });
  }

  static async #onWebsite() {
    openAccountPage();
  }

  static async #onLogout() {
    await logoutLootForge();
    const app = foundry.applications.instances.get("lootforge-access-window");
    if (app?.rendered) await app.render({ force: true });
  }
}

let accessWindow = null;

export async function openAccessWindow() {
  accessWindow ??= new LootForgeAccessWindow();
  await accessWindow.render({ force: true });
  return accessWindow;
}
