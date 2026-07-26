/**
 * DM Loot Review — ApplicationV2 window for editing corpse loot before release.
 */

import { listLootDefinitions } from "../data/loot-definitions.js";
import { MODULE_ID } from "../modules/constants.js";
import { generateCreatureLoot, rerollSingleEntry } from "../modules/loot-generator.js";
import { log } from "../modules/logger.js";
import { broadcastStateUpdated, releaseLootForEveryone } from "../modules/socket-manager.js";
import {
  getCorpseState,
  setCorpseState,
  updateCorpseState
} from "../modules/loot-storage.js";
import { syncLootIndicator } from "../modules/loot-indicator.js";
import { lootSkillLabel, resolveLootSkill } from "../modules/roll-helper.js";
import { resetCorpseLoot } from "../modules/loot-workflow.js";
import { registerLootWindow, unregisterLootWindow } from "./window-registry.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class DmLootReview extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @type {TokenDocument} */
  #tokenDoc;

  /** @type {boolean} */
  #busy = false;

  /** @type {boolean} */
  #pendingRefresh = false;

  /** Monotonic token so a slow busy=true render cannot overwrite a later idle UI. */
  #renderGeneration = 0;

  constructor(tokenDoc, options = {}) {
    super(options);
    this.#tokenDoc = tokenDoc;
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
      assign: DmLootReview.#onSaveAndClose,
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
    const rollerId = state.pendingLooterActorId ?? null;
    const rollerName = rollerId ? game.actors.get(rollerId)?.name : null;

    return {
      busy: this.#busy,
      renderGeneration: this.#renderGeneration,
      creature: {
        name: ctx.name ?? this.#tokenDoc.name,
        image: ctx.image ?? this.#tokenDoc.actor?.img,
        creatureType: ctx.creatureType ?? "—",
        cr: ctx.challengeRating ?? 0,
        size: ctx.size ?? "—"
      },
      survivalTotal: state.survivalTotal ?? "—",
      naturalDie: state.naturalDie ?? "—",
      lootSkillLabel: lootSkillLabel(state.lootSkill ?? resolveLootSkill(ctx)),
      rollQuality: state.rollQuality
        ? game.i18n.localize(`LOOTFORGE.Quality.${state.rollQuality}`)
        : "—",
      rollQualityKey: state.rollQuality ?? "poor",
      items: state.items ?? [],
      definitions: listLootDefinitions(),
      rollerName,
      hasItems: (state.items?.length ?? 0) > 0
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    registerLootWindow(this.#tokenDoc.uuid, this);

    // If a newer render was requested while this frame was painting, correct it.
    if (context?.renderGeneration != null && context.renderGeneration < this.#renderGeneration) {
      void this.render({ force: true });
    }
  }

  async _onClose(options) {
    unregisterLootWindow(this.#tokenDoc.uuid, this);

    // Close / Save & Close release loot. Do not release if we were mid-edit.
    if (game.user.isGM && !this.#busy) {
      const state = getCorpseState(this.#tokenDoc);
      if (state.generated && !state.dmApproved && (state.items?.length || state.pendingReview)) {
        try {
          await releaseLootForEveryone(this.#tokenDoc);
        } catch (err) {
          log.warn("Failed to release loot on DM Review close", err);
        }
      }
    }

    return super._onClose(options);
  }

  onCorpseStateChanged() {
    // Flag updates from our own edits already re-render via #withBusy.
    // A second render mid-edit races and can leave every button disabled.
    if (this.#busy) {
      this.#pendingRefresh = true;
      return;
    }
    if (this.rendered) void this.#safeRender();
  }

  /**
   * Disable/enable action controls without a full re-render (avoids busy-frame races).
   * @param {boolean} disabled
   */
  #setActionsDisabled(disabled) {
    const root = this.element;
    if (!root) return;
    for (const el of root.querySelectorAll("[data-action]")) {
      if (el.dataset.action === "cancel") continue;
      el.disabled = disabled;
    }
  }

  async #safeRender() {
    this.#renderGeneration += 1;
    try {
      await this.render({ force: true });
    } catch (err) {
      log.warn("DM Review render failed", err);
    }
  }

  async #withBusy(fn) {
    if (this.#busy) return;
    this.#busy = true;
    this.#pendingRefresh = false;
    // Do NOT full-re-render with busy=true — that paint can finish after unlock
    // and permanently disable every control except Close.
    this.#setActionsDisabled(true);
    try {
      await fn();
    } finally {
      this.#busy = false;
      this.#pendingRefresh = false;
      if (this.rendered) await this.#safeRender();
      else this.#setActionsDisabled(false);
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
        isNatural20: state.naturalDie === 20,
        actor: app.#tokenDoc.actor
      });

      await setCorpseState(app.#tokenDoc, {
        ...state,
        rollQuality: generated.rollQuality,
        profileId: generated.profileId,
        items: generated.items,
        currency: generated.currency ?? state.currency
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
      const next = await rerollSingleEntry(
        state.creatureContext,
        state.rollQuality,
        entry.definitionId,
        entry
      );
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

  static async #onSaveAndClose(event, _target) {
    event.preventDefault();
    const app = this;
    await app.#withBusy(async () => {
      const state = getCorpseState(app.#tokenDoc);
      if (!state.items?.length) {
        ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoItemsToAssign"));
        return;
      }

      await releaseLootForEveryone(app.#tokenDoc);
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
      await app.render({ force: true });
      app.bringToFront?.();
      return app;
    }
  }
  const app = new DmLootReview(tokenDoc, options);
  await app.render({ force: true });
  app.bringToFront?.();
  log.info("Opened DM Loot Review", { tokenUuid: tokenDoc.uuid });
  return app;
}
