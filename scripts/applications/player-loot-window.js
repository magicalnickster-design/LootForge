/**
 * Player-facing MMO-style loot window.
 */

import { MODULE_ID } from "../modules/constants.js";
import { log } from "../modules/logger.js";
import {
  getCorpseState,
  hasRemainingLoot,
  isCorpseLooted
} from "../modules/loot-storage.js";
import { requestTakeAll, requestTakeItem } from "../modules/socket-manager.js";
import { registerLootWindow, unregisterLootWindow } from "./window-registry.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class PlayerLootWindow extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @type {TokenDocument} */
  #tokenDoc;

  /** @type {boolean} */
  #busy = false;

  constructor(tokenDoc, options = {}) {
    super(options);
    this.#tokenDoc = tokenDoc;
  }

  static DEFAULT_OPTIONS = {
    id: "lootforge-player-loot",
    classes: ["lootforge", "lootforge-player-loot"],
    position: { width: 480, height: "auto" },
    window: {
      title: "LOOTFORGE.Player.Title",
      icon: "fa-solid fa-sack",
      resizable: true
    },
    actions: {
      takeItem: PlayerLootWindow.#onTakeItem,
      takeAll: PlayerLootWindow.#onTakeAll,
      closeWindow: PlayerLootWindow.#onClose
    }
  };

  static PARTS = {
    body: {
      template: `modules/${MODULE_ID}/templates/player-loot-window.hbs`
    }
  };

  get tokenDoc() {
    return this.#tokenDoc;
  }

  get title() {
    const name = getCorpseState(this.#tokenDoc).creatureContext?.name ?? this.#tokenDoc.name;
    return game.i18n.format("LOOTFORGE.Player.TitleNamed", { name });
  }

  /** @returns {Actor|null} */
  #resolveActor() {
    const state = getCorpseState(this.#tokenDoc);
    if (state.assignedActorId) {
      const assigned = game.actors.get(state.assignedActorId);
      if (assigned && (assigned.isOwner || game.user.isGM)) return assigned;
    }
    if (game.user.character) return game.user.character;
    return null;
  }

  async _prepareContext(_options) {
    const state = getCorpseState(this.#tokenDoc);
    const ctx = state.creatureContext ?? {};
    const empty = isCorpseLooted(this.#tokenDoc) || !hasRemainingLoot(this.#tokenDoc);

    return {
      busy: this.#busy,
      empty,
      creature: {
        name: ctx.name ?? this.#tokenDoc.name,
        image: ctx.image ?? this.#tokenDoc.actor?.img
      },
      items: (state.items ?? []).map((item) => ({
        ...item,
        rarityClass: `rarity-${item.rarity || "common"}`
      })),
      assignedName: state.assignedActorId
        ? game.actors.get(state.assignedActorId)?.name
        : null
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    registerLootWindow(this.#tokenDoc.uuid, this);
  }

  async _onClose(options) {
    unregisterLootWindow(this.#tokenDoc.uuid, this);
    return super._onClose(options);
  }

  onCorpseStateChanged() {
    const state = getCorpseState(this.#tokenDoc);
    if (state.looted || !hasRemainingLoot(this.#tokenDoc)) {
      ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.CorpseEmpty"));
      this.close();
      return;
    }
    if (this.rendered) this.render({ force: true });
  }

  async #withBusy(fn) {
    if (this.#busy) return;
    this.#busy = true;
    this.render({ force: true });
    try {
      await fn();
    } finally {
      this.#busy = false;
      if (this.rendered) this.render({ force: true });
    }
  }

  static async #onTakeItem(event, target) {
    event.preventDefault();
    const app = this;
    const entryId = target.dataset.entryId;
    await app.#withBusy(async () => {
      const actor = app.#resolveActor();
      if (!actor) {
        ui.notifications.error(game.i18n.localize("LOOTFORGE.Notify.NoLooter"));
        return;
      }
      const result = await requestTakeItem(app.#tokenDoc, actor, entryId);
      if (!result.ok) {
        ui.notifications.warn(result.error || game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
        return;
      }
      if (result.pending) {
        ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.TransferPending"));
      }
      log.info("Player took item", entryId);
    });
  }

  static async #onTakeAll(event, _target) {
    event.preventDefault();
    const app = this;
    await app.#withBusy(async () => {
      const actor = app.#resolveActor();
      if (!actor) {
        ui.notifications.error(game.i18n.localize("LOOTFORGE.Notify.NoLooter"));
        return;
      }
      const result = await requestTakeAll(app.#tokenDoc, actor);
      if (!result.ok) {
        ui.notifications.warn(result.error || game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
        return;
      }
      if (result.pending) {
        ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.TransferPending"));
      }
    });
  }

  static async #onClose(event, _target) {
    event.preventDefault();
    await this.close();
  }
}

/**
 * @param {TokenDocument} tokenDoc
 */
export async function openPlayerLootWindow(tokenDoc) {
  for (const app of foundry.applications.instances.values()) {
    if (app instanceof PlayerLootWindow && app.tokenDoc?.uuid === tokenDoc.uuid) {
      app.render({ force: true });
      return app;
    }
  }
  const app = new PlayerLootWindow(tokenDoc);
  await app.render({ force: true });
  return app;
}
