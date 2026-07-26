/**
 * Player-facing WoW-inspired loot window (modern D&D twist).
 * Double-click an item to take it. Loot All / Done.
 * Closing the window deposits leftovers onto the corpse for the next looter.
 */

import { MODULE_ID } from "../modules/constants.js";
import { log } from "../modules/logger.js";
import {
  getCorpseState,
  hasActiveLootWindowItems
} from "../modules/loot-storage.js";
import { userOwnsActor } from "../modules/ownership.js";
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

  /** @type {boolean} */
  #sessionReleased = false;

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
    if (state.activeLooterActorId) {
      const active = game.actors.get(state.activeLooterActorId);
      if (active && (game.user.isGM || userOwnsActor(active, game.user))) return active;
    }
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
    const empty = !hasActiveLootWindowItems(this.#tokenDoc);

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
      assignedName: state.activeLooterName
        ?? (state.assignedActorId ? game.actors.get(state.assignedActorId)?.name : null),
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
    // WoW: leaving the loot page drops leftovers onto the corpse for others.
    await this.#releaseSession();
    return super._onClose(options);
  }

  onCorpseStateChanged() {
    if (!hasActiveLootWindowItems(this.#tokenDoc)) {
      // Either fully taken or deposited — close quietly.
      this.#sessionReleased = true;
      this.close({ animate: false });
      return;
    }
    if (this.rendered) this.render({ force: true });
  }

  async #releaseSession() {
    if (this.#sessionReleased) return;
    this.#sessionReleased = true;

    const state = getCorpseState(this.#tokenDoc);
    const isActive = game.user.isGM
      || state.activeLooterUserId === game.user.id
      || state.assignedUserId === game.user.id;
    if (!isActive) return;

    if (!hasActiveLootWindowItems(this.#tokenDoc) && !state.activeLooterUserId) return;

    try {
      const result = await requestDoneLoot(this.#tokenDoc);
      if (result?.ok && !result.pending && result.deposited > 0) {
        ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.LootDeposited"));
      }
    } catch (err) {
      log.warn("Failed to release loot session on close", err);
    }
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
    await this.#takeEntry(target.dataset.entryId);
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
      } else {
        app.#sessionReleased = true;
        await app.close();
      }
    });
  }

  static async #onDone(event, _target) {
    event.preventDefault();
    const app = this;
    await app.#withBusy(async () => {
      await app.#releaseSession();
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
