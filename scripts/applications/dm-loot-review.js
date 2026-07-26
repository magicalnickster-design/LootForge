/**
 * DM Loot Review — ApplicationV2 window for editing and assigning corpse loot.
 */

import { listLootDefinitions } from "../data/loot-definitions.js";
import { MODULE_ID } from "../modules/constants.js";
import { generateCreatureLoot, rerollSingleEntry } from "../modules/loot-generator.js";
import { log } from "../modules/logger.js";
import { getLooterCandidates } from "../modules/looter-selection.js";
import { assignLootToActor, broadcastStateUpdated } from "../modules/socket-manager.js";
import {
  getCorpseState,
  setCorpseState,
  updateCorpseState
} from "../modules/loot-storage.js";
import { syncLootIndicator } from "../modules/loot-indicator.js";
import { resetCorpseLoot } from "../modules/loot-workflow.js";
import { registerLootWindow, unregisterLootWindow } from "./window-registry.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class DmLootReview extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @type {TokenDocument} */
  #tokenDoc;

  /** @type {string|null} */
  #selectedActorId;

  /** @type {boolean} */
  #busy = false;

  constructor(tokenDoc, options = {}) {
    super(options);
    this.#tokenDoc = tokenDoc;
    this.#selectedActorId = options.initialRollerId
      ?? getCorpseState(tokenDoc).assignedActorId
      ?? null;
  }

  static DEFAULT_OPTIONS = {
    id: "lootforge-dm-review",
    classes: ["lootforge", "lootforge-dm-review"],
    tag: "form",
    position: { width: 620, height: "auto" },
    window: {
      title: "LOOTFORGE.DM.Title",
      icon: "fa-solid fa-scroll",
      resizable: true,
      contentClasses: ["standard-form"]
    },
    actions: {
      rerollAll: DmLootReview.#onRerollAll,
      rerollItem: DmLootReview.#onRerollItem,
      incQty: DmLootReview.#onIncQty,
      decQty: DmLootReview.#onDecQty,
      removeItem: DmLootReview.#onRemoveItem,
      addItem: DmLootReview.#onAddItem,
      assign: DmLootReview.#onAssign,
      resetLoot: DmLootReview.#onReset,
      cancel: DmLootReview.#onCancel
    }
  };

  static PARTS = {
    body: {
      template: `modules/${MODULE_ID}/templates/dm-loot-review.hbs`,
      scrollable: [".lootforge-dm-body"]
    }
  };

  get tokenDoc() {
    return this.#tokenDoc;
  }

  get title() {
    const name = getCorpseState(this.#tokenDoc).creatureContext?.name ?? this.#tokenDoc.name;
    return game.i18n.format("LOOTFORGE.DM.TitleNamed", { name });
  }

  async _prepareContext(_options) {
    const state = getCorpseState(this.#tokenDoc);
    const ctx = state.creatureContext ?? {};
    const candidates = getLooterCandidates();
    if (!this.#selectedActorId && candidates[0]) this.#selectedActorId = candidates[0].id;

    return {
      busy: this.#busy,
      creature: {
        name: ctx.name ?? this.#tokenDoc.name,
        image: ctx.image ?? this.#tokenDoc.actor?.img,
        creatureType: ctx.creatureType ?? "—",
        cr: ctx.challengeRating ?? 0,
        size: ctx.size ?? "—"
      },
      survivalTotal: state.survivalTotal ?? "—",
      naturalDie: state.naturalDie ?? "—",
      rollQuality: state.rollQuality
        ? game.i18n.localize(`LOOTFORGE.Quality.${state.rollQuality}`)
        : "—",
      rollQualityKey: state.rollQuality ?? "poor",
      items: state.items ?? [],
      definitions: listLootDefinitions(),
      candidates: candidates.map((a) => ({
        id: a.id,
        name: a.name,
        selected: a.id === this.#selectedActorId
      })),
      assignedActorId: state.assignedActorId,
      assignedName: state.assignedActorId
        ? game.actors.get(state.assignedActorId)?.name
        : null,
      hasItems: (state.items?.length ?? 0) > 0
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    registerLootWindow(this.#tokenDoc.uuid, this);

    const select = this.element?.querySelector?.('[name="looterId"]');
    select?.addEventListener("change", (event) => {
      this.#selectedActorId = event.currentTarget.value;
    });
  }

  async _onClose(options) {
    unregisterLootWindow(this.#tokenDoc.uuid, this);
    return super._onClose(options);
  }

  onCorpseStateChanged() {
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

  static async #onRerollAll(event, _target) {
    event.preventDefault();
    const app = this;
    await app.#withBusy(async () => {
      const state = getCorpseState(app.#tokenDoc);
      const context = state.creatureContext;
      if (!context) return;

      const generated = await generateCreatureLoot({
        context,
        survivalTotal: state.survivalTotal ?? 10,
        naturalDie: state.naturalDie ?? 0,
        isNatural20: state.naturalDie === 20
      });

      await setCorpseState(app.#tokenDoc, {
        ...state,
        rollQuality: generated.rollQuality,
        profileId: generated.profileId,
        items: generated.items,
        // Preserve assignment / selected looter.
        assignedActorId: state.assignedActorId,
        assignedUserId: state.assignedUserId
      });
      await syncLootIndicator(app.#tokenDoc);
      broadcastStateUpdated(app.#tokenDoc.uuid);
      log.info("DM rerolled all loot", app.#tokenDoc.name);
    });
  }

  static async #onRerollItem(event, target) {
    event.preventDefault();
    const entryId = target.dataset.entryId;
    const app = this;
    await app.#withBusy(async () => {
      const state = getCorpseState(app.#tokenDoc);
      const entry = state.items.find((i) => i.entryId === entryId);
      if (!entry) return;
      const next = await rerollSingleEntry(state.creatureContext, state.rollQuality, entry.definitionId);
      let items;
      if (!next) {
        items = state.items.filter((i) => i.entryId !== entryId);
      } else {
        items = state.items.map((i) => (
          i.entryId === entryId
            ? { ...next, entryId: i.entryId }
            : i
        ));
      }
      await updateCorpseState(app.#tokenDoc, { items });
      broadcastStateUpdated(app.#tokenDoc.uuid);
    });
  }

  static async #onIncQty(event, target) {
    event.preventDefault();
    /** @type {DmLootReview} */
    const app = this;
    const entryId = target.dataset.entryId;
    await app.#withBusy(async () => {
      const state = getCorpseState(app.#tokenDoc);
      const items = state.items
        .map((i) => (i.entryId === entryId ? { ...i, quantity: i.quantity + 1 } : i))
        .filter((i) => i.quantity > 0);
      await updateCorpseState(app.#tokenDoc, { items });
      broadcastStateUpdated(app.#tokenDoc.uuid);
    });
  }

  static async #onDecQty(event, target) {
    event.preventDefault();
    /** @type {DmLootReview} */
    const app = this;
    const entryId = target.dataset.entryId;
    await app.#withBusy(async () => {
      const state = getCorpseState(app.#tokenDoc);
      const items = state.items
        .map((i) => (i.entryId === entryId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i))
        .filter((i) => i.quantity > 0);
      await updateCorpseState(app.#tokenDoc, { items });
      broadcastStateUpdated(app.#tokenDoc.uuid);
    });
  }

  static async #onRemoveItem(event, target) {
    event.preventDefault();
    const entryId = target.dataset.entryId;
    const app = this;
    await app.#withBusy(async () => {
      const state = getCorpseState(app.#tokenDoc);
      const items = state.items.filter((i) => i.entryId !== entryId);
      await updateCorpseState(app.#tokenDoc, { items });
      broadcastStateUpdated(app.#tokenDoc.uuid);
    });
  }

  static async #onAddItem(event, _target) {
    event.preventDefault();
    const app = this;
    const select = app.element.querySelector('[name="addDefinitionId"]');
    const definitionId = select?.value;
    if (!definitionId) return;

    await app.#withBusy(async () => {
      const { buildLootEntry } = await import("../modules/loot-generator.js");
      const state = getCorpseState(app.#tokenDoc);
      const existing = state.items.find((i) => i.definitionId === definitionId);
      let items;
      if (existing) {
        items = state.items.map((i) => (
          i.definitionId === definitionId ? { ...i, quantity: i.quantity + 1 } : i
        ));
      } else {
        const entry = await buildLootEntry(definitionId, 1);
        items = entry ? [...state.items, entry] : state.items;
      }
      await updateCorpseState(app.#tokenDoc, { items });
      broadcastStateUpdated(app.#tokenDoc.uuid);
    });
  }

  static async #onAssign(event, _target) {
    event.preventDefault();
    const app = this;
    await app.#withBusy(async () => {
      const select = app.element.querySelector('[name="looterId"]');
      const actorId = select?.value || app.#selectedActorId;
      const actor = game.actors.get(actorId);
      if (!actor) {
        ui.notifications.error(game.i18n.localize("LOOTFORGE.Notify.CharacterMissing"));
        return;
      }
      const state = getCorpseState(app.#tokenDoc);
      if (!state.items?.length) {
        ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoItemsToAssign"));
        return;
      }

      await assignLootToActor(app.#tokenDoc, actor);
      ui.notifications.info(
        game.i18n.format("LOOTFORGE.Notify.Assigned", { name: actor.name })
      );
      await app.close();
    });
  }

  static async #onReset(event, _target) {
    event.preventDefault();
    const app = this;
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("LOOTFORGE.HUD.ResetLoot") },
      content: `<p>${game.i18n.localize("LOOTFORGE.Notify.ResetConfirm")}</p>`
    });
    if (!confirmed) return;
    await resetCorpseLoot(app.#tokenDoc);
    broadcastStateUpdated(app.#tokenDoc.uuid);
    await app.close();
  }

  static async #onCancel(event, _target) {
    event.preventDefault();
    await this.close();
  }
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {object} [options]
 */
export async function openDmLootReview(tokenDoc, options = {}) {
  // Single instance per token.
  for (const app of foundry.applications.instances.values()) {
    if (app instanceof DmLootReview && app.tokenDoc?.uuid === tokenDoc.uuid) {
      app.render({ force: true });
      return app;
    }
  }
  const app = new DmLootReview(tokenDoc, options);
  await app.render({ force: true });
  return app;
}
