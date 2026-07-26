/**
 * Player-facing WoW-inspired loot window (modern D&D twist).
 * Double-click an item to take it. Loot All / Done.
 */

import { MODULE_ID } from "../modules/constants.js";
import { log } from "../modules/logger.js";
import {
  getCorpseState,
  hasRemainingLoot,
  isCorpseLooted
} from "../modules/loot-storage.js";
import { canUserAccessAssignedLoot, userOwnsActor } from "../modules/ownership.js";
import {
  requestDoneLoot,
  requestTakeAll,
  requestTakeItem
} from "../modules/socket-manager.js";
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
    classes: ["lootforge", "lootforge-player-loot", "lootforge-wow"],
    position: { width: 320, height: "auto" },
    window: {
      title: "LOOTFORGE.Player.Title",
      icon: "fa-solid fa-sack",
      resizable: false,
      frame: true,
      positioned: true
    },
    actions: {
      takeItem: PlayerLootWindow.#onTakeItem,
      takeAll: PlayerLootWindow.#onTakeAll,
      doneLoot: PlayerLootWindow.#onDone
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
    return game.i18n.localize("LOOTFORGE.Player.WindowTitle");
  }

  /** @returns {Actor|null} */
  #resolveActor() {
    const state = getCorpseState(this.#tokenDoc);
    if (state.assignedActorId) {
      const assigned = game.actors.get(state.assignedActorId);
      if (assigned && (game.user.isGM || userOwnsActor(assigned, game.user))) return assigned;
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
      bagIcon: `modules/${MODULE_ID}/assets/ui/loot-bag.svg`,
      creature: {
        name: ctx.name ?? this.#tokenDoc.name,
        image: ctx.image ?? this.#tokenDoc.actor?.img
      },
      items: (state.items ?? []).map((item) => ({
        ...item,
        rarityClass: `rarity-${item.rarity || "common"}`,
        qtyLabel: item.quantity > 1 ? String(item.quantity) : ""
      })),
      assignedName: state.assignedActorId
        ? game.actors.get(state.assignedActorId)?.name
        : null,
      hint: game.i18n.localize("LOOTFORGE.Player.DoubleClickHint")
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    registerLootWindow(this.#tokenDoc.uuid, this);

    const list = this.element?.querySelector?.(".lootforge-wow-list");
    list?.querySelectorAll?.(".lootforge-wow-row")?.forEach((row) => {
      row.addEventListener("dblclick", async (event) => {
        event.preventDefault();
        if (this.#busy) return;
        const entryId = row.dataset.entryId;
        if (!entryId) return;
        await this.#takeEntry(entryId);
      });
    });
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

  async #takeEntry(entryId) {
    await this.#withBusy(async () => {
      const actor = this.#resolveActor();
      if (!actor) {
        ui.notifications.error(game.i18n.localize("LOOTFORGE.Notify.NoLooter"));
        return;
      }
      const result = await requestTakeItem(this.#tokenDoc, actor, entryId);
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

  static async #onTakeItem(event, target) {
    event.preventDefault();
    const entryId = target.dataset.entryId;
    await this.#takeEntry(entryId);
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

  static async #onDone(event, _target) {
    event.preventDefault();
    const app = this;
    await app.#withBusy(async () => {
      const state = getCorpseState(app.#tokenDoc);
      if (!canUserAccessAssignedLoot(state, game.user) && !game.user.isGM) {
        ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
        return;
      }

      if (hasRemainingLoot(app.#tokenDoc)) {
        const result = await requestDoneLoot(app.#tokenDoc);
        if (!result.ok) {
          ui.notifications.warn(result.error || game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
          return;
        }
        if (result.pending) {
          ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.TransferPending"));
        } else {
          ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.LootDeposited"));
        }
      }
      await app.close();
    });
  }
}

/**
 * @param {TokenDocument} tokenDoc
 */
export async function openPlayerLootWindow(tokenDoc) {
  log.info("openPlayerLootWindow()", {
    tokenUuid: tokenDoc?.uuid,
    userId: game.user.id,
    isGM: game.user.isGM
  });

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
