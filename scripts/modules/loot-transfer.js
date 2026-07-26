/**
 * Transfer corpse loot entries onto a player character actor.
 */

import { definitionToItemData, getLootDefinition } from "../data/loot-definitions.js";
import { log } from "./logger.js";
import {
  getCorpseState,
  hasRemainingLoot,
  updateCorpseState
} from "./loot-storage.js";

/** In-flight transfer locks keyed by tokenUuid:entryId or tokenUuid:ALL */
const transferLocks = new Set();

/**
 * @param {string} lockKey
 * @returns {boolean} true if lock acquired
 */
function acquireLock(lockKey) {
  if (transferLocks.has(lockKey)) return false;
  transferLocks.add(lockKey);
  return true;
}

function releaseLock(lockKey) {
  transferLocks.delete(lockKey);
}

/**
 * Find an existing stackable LootForge item on the actor.
 * @param {Actor} actor
 * @param {string} definitionId
 * @returns {Item|null}
 */
function findStackableItem(actor, definitionId) {
  return actor.items.find((item) => {
    const flag = item.getFlag?.("lootforge", "definitionId")
      ?? item.flags?.lootforge?.definitionId
      ?? item.flags?.lootforge?.stackingKey;
    return flag === definitionId;
  }) ?? null;
}

/**
 * Permission: assigned player/owner or GM.
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {User} [user]
 * @returns {boolean}
 */
export function canTakeLoot(tokenDoc, actor, user = game.user) {
  if (!tokenDoc || !actor) return false;
  if (user.isGM) return true;

  const state = getCorpseState(tokenDoc);
  if (state.assignedActorId && state.assignedActorId !== actor.id) return false;
  if (state.assignedUserId && state.assignedUserId !== user.id) {
    // Allow if user owns the assigned actor.
    if (!actor.testUserPermission(user, "OWNER")) return false;
  } else if (!actor.testUserPermission(user, "OWNER")) {
    return false;
  }
  return true;
}

/**
 * Create or stack items on the actor.
 * @param {Actor} actor
 * @param {import("./loot-storage.js").CorpseLootItem} entry
 * @param {string} sourceCreature
 * @returns {Promise<Item|null>}
 */
async function grantEntryToActor(actor, entry, sourceCreature) {
  const def = getLootDefinition(entry.definitionId);
  if (!def) throw new Error(`Unknown loot definition: ${entry.definitionId}`);

  const existing = findStackableItem(actor, entry.definitionId);
  if (existing) {
    const nextQty = Number(existing.system?.quantity ?? 0) + Number(entry.quantity ?? 0);
    await existing.update({ "system.quantity": nextQty });
    return existing;
  }

  const data = definitionToItemData(def, {
    quantity: entry.quantity,
    sourceCreature
  });
  const created = await actor.createEmbeddedDocuments("Item", [data]);
  return created?.[0] ?? null;
}

/**
 * Take one corpse entry (or a partial quantity).
 *
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {string} entryId
 * @param {object} [options]
 * @param {number} [options.quantity]  defaults to full stack
 * @param {User} [options.user]
 * @returns {Promise<{ ok: boolean, error?: string, state?: object }>}
 */
export async function takeCorpseItem(tokenDoc, actor, entryId, { quantity, user = game.user } = {}) {
  const lockKey = `${tokenDoc.uuid}:${entryId}`;
  if (!acquireLock(lockKey)) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.TransferBusy") };
  }

  try {
    if (!canTakeLoot(tokenDoc, actor, user)) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoTakePermission") };
    }

    const state = getCorpseState(tokenDoc);
    if (state.looted) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.AlreadyLootedEmpty") };
    }

    const entry = state.items.find((i) => i.entryId === entryId);
    if (!entry || entry.quantity <= 0) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.ItemGone") };
    }

    const takeQty = Math.min(entry.quantity, Math.max(1, Number(quantity ?? entry.quantity)));
    const grant = { ...entry, quantity: takeQty };
    const sourceCreature = state.creatureContext?.name ?? tokenDoc.name;

    await grantEntryToActor(actor, grant, sourceCreature);

    const remaining = entry.quantity - takeQty;
    const nextItems = remaining > 0
      ? state.items.map((i) => (i.entryId === entryId ? { ...i, quantity: remaining } : i))
      : state.items.filter((i) => i.entryId !== entryId);

    const empty = !nextItems.some((i) => i.quantity > 0);
    const nextState = await updateCorpseState(tokenDoc, {
      items: nextItems,
      looted: empty,
      lootedAt: empty ? Date.now() : state.lootedAt
    });

    log.info(`Transferred ${takeQty}× ${entry.name} → ${actor.name}`);
    return { ok: true, state: nextState };
  } catch (err) {
    log.error("takeCorpseItem failed", err);
    return {
      ok: false,
      error: game.i18n.localize("LOOTFORGE.Notify.TransferFailed")
    };
  } finally {
    releaseLock(lockKey);
  }
}

/**
 * Take all remaining items.
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {User} [user]
 */
export async function takeAllCorpseItems(tokenDoc, actor, user = game.user) {
  const lockKey = `${tokenDoc.uuid}:ALL`;
  if (!acquireLock(lockKey)) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.TransferBusy") };
  }

  try {
    if (!canTakeLoot(tokenDoc, actor, user)) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoTakePermission") };
    }
    if (!hasRemainingLoot(tokenDoc)) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.AlreadyLootedEmpty") };
    }

    let state = getCorpseState(tokenDoc);
    const sourceCreature = state.creatureContext?.name ?? tokenDoc.name;

    for (const entry of [...state.items]) {
      if (entry.quantity <= 0) continue;
      await grantEntryToActor(actor, entry, sourceCreature);
    }

    state = await updateCorpseState(tokenDoc, {
      items: [],
      looted: true,
      lootedAt: Date.now()
    });

    log.info(`Take All → ${actor.name} from ${tokenDoc.name}`);
    return { ok: true, state };
  } catch (err) {
    log.error("takeAllCorpseItems failed", err);
    return {
      ok: false,
      error: game.i18n.localize("LOOTFORGE.Notify.TransferFailed")
    };
  } finally {
    releaseLock(lockKey);
  }
}
