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
  #tokenDoc;

  #busy = false;

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

    for (const token of canvas.tokens?.controlled ?? []) {
      const actor = token.actor;
      if (actor?.type === "character" && (game.user.isGM || userOwnsActor(actor, game.user))) {
        return actor;
      }
    }
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
    await this.#releaseSession();
    return super._onClose(options);
  }

  onCorpseStateChanged() {
    if (!hasActiveLootWindowItems(this.#tokenDoc)) {
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

    if (state.freeForAll) return;

    const isActive = game.user.isGM
      || state.activeLooterUserId === game.user.id
      || state.assignedUserId === game.user.id;
    if (!isActive) return;

    if (!hasActiveLootWindowItems(this.#tokenDoc) && !state.activeLooterUserId) return;

    try {
      const result = await requestDoneLoot(this.#tokenDoc);
      if (result?.ok && !result.pending && result.freeForAll && result.deposited > 0) {
        ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.LootOpenForAll"));
      } else if (result?.ok && !result.pending && result.deposited > 0) {
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
      log.info("Player took item", entryId, { pending: Boolean(result.pending) });
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
      // Pending GM handoff still claimed client-side — close so this player
      // cannot spam Loot All while other party windows sync.
      app.#sessionReleased = true;
      await app.close();
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

export async function openPlayerLootWindow(tokenDoc) {
  const { requireAccess } = await import("../auth/access.js");
  if (!(await requireAccess({ openWindow: true }))) return null;

  log.info("openPlayerLootWindow()", {
    tokenUuid: tokenDoc?.uuid,
    userId: game.user.id,
    isGM: game.user.isGM
  });

  for (const app of foundry.applications.instances.values()) {
    if (app instanceof PlayerLootWindow && app.tokenDoc?.uuid === tokenDoc.uuid) {
      await app.render({ force: true });
      app.bringToFront?.();
      return app;
    }
  }
  const app = new PlayerLootWindow(tokenDoc);
  await app.render({ force: true });
  app.bringToFront?.();
  return app;
}
