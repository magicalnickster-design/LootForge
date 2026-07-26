/**
 * Transfer corpse loot entries onto a player character actor.
 *
 * Prefer cloning from the module Item compendium via fromUuid.
 * Fall back to the stored itemData snapshot, then definition fallback.
 * Never mutates the compendium source Item.
 */

import {
  formatDefinitionValue,
  getLootDefinition,
  resolveItemDataForTransfer
} from "../data/loot-definitions.js";
import { log } from "./logger.js";
import { canUserLootCorpse, userOwnsActor } from "./ownership.js";
import { getSetting } from "./settings.js";
import {
  corpseHasInventoryLoot,
  getCorpseInventoryLootItems,
  getCorpseState,
  hasRemainingLoot,
  isLootSessionLocked,
  updateCorpseState
} from "./loot-storage.js";

/** In-flight transfer locks keyed by tokenUuid:entryId or tokenUuid:ALL */
const transferLocks = new Set();

function acquireLock(lockKey) {
  if (transferLocks.has(lockKey)) return false;
  transferLocks.add(lockKey);
  return true;
}

function releaseLock(lockKey) {
  transferLocks.delete(lockKey);
}

/**
 * @param {Actor} actor
 * @param {string} definitionId
 * @returns {Item|null}
 */
function findStackableItem(actor, definitionId) {
  const stackingKey = getLootDefinition(definitionId)?.id ?? definitionId;
  return actor.items.find((item) => {
    const key = item.getFlag?.("lootforge", "stackingKey")
      ?? item.flags?.lootforge?.stackingKey
      ?? item.getFlag?.("lootforge", "definitionId")
      ?? item.flags?.lootforge?.definitionId;
    return key === stackingKey || key === definitionId;
  }) ?? null;
}

/**
 * @param {import("./loot-storage.js").CorpseLootItem} entry
 * @returns {import("./loot-storage.js").CorpseLootItem}
 */
function normalizeLegacyEntry(entry) {
  if (!entry) return entry;
  const def = getLootDefinition(entry.definitionId);
  if (!def) return entry;
  return {
    ...entry,
    itemUuid: entry.itemUuid || def.itemUuid,
    name: entry.name || def.name,
    img: entry.img || def.img,
    rarity: entry.rarity || def.rarity,
    description: entry.description || def.description
  };
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {User} [user]
 * @returns {boolean}
 */
export function canTakeLoot(tokenDoc, actor, user = game.user) {
  if (!tokenDoc || !actor) return false;
  if (user.isGM) return true;

  const state = getCorpseState(tokenDoc);
  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id) {
    return false;
  }
  if (state.activeLooterActorId && state.activeLooterActorId !== actor.id) {
    return false;
  }
  if (state.assignedActorId && state.assignedActorId !== actor.id) {
    // During an open session the claim sets assignment to the looter.
    if (!(getSetting("allowAllPlayersToLoot") && state.activeLooterUserId === user.id)) {
      return false;
    }
  }
  if (!canUserLootCorpse(tokenDoc, user)) return false;
  return userOwnsActor(actor, user) || state.assignedUserId === user.id || state.activeLooterUserId === user.id;
}

/**
 * Pull LootForge items from the corpse actor inventory into the loot window pool.
 * @param {TokenDocument} tokenDoc
 * @returns {Promise<object>}
 */
export async function materializeCorpseInventoryLoot(tokenDoc) {
  const state = getCorpseState(tokenDoc);
  if (state.items?.some((i) => Number(i.quantity) > 0)) return state;
  if (!corpseHasInventoryLoot(tokenDoc)) return state;

  const actorItems = getCorpseInventoryLootItems(tokenDoc);
  const entries = [];
  const deleteIds = [];

  for (const item of actorItems) {
    const flags = item.flags?.lootforge ?? {};
    const definitionId = flags.definitionId || flags.stackingKey || null;
    const def = definitionId ? getLootDefinition(definitionId) : null;
    const qty = Math.max(1, Number(item.system?.quantity ?? 1));
    const data = typeof item.toObject === "function" ? item.toObject() : foundry.utils.duplicate(item);
    delete data._id;

    entries.push({
      entryId: foundry.utils.randomID(),
      definitionId: definitionId || `inv-${item.id}`,
      itemUuid: flags.itemUuid || def?.itemUuid || null,
      itemData: data,
      name: item.name,
      quantity: qty,
      img: item.img || def?.img,
      rarity: flags.rarity || def?.rarity || item.system?.rarity || "common",
      valueText: def ? formatDefinitionValue(def) : "—",
      description: def?.description
        || item.system?.description?.chat
        || ""
    });
    deleteIds.push(item.id);
  }

  if (deleteIds.length) {
    await tokenDoc.actor.deleteEmbeddedDocuments("Item", deleteIds);
  }

  const next = await updateCorpseState(tokenDoc, {
    generated: true,
    items: entries,
    looted: false,
    lootedAt: null
  });
  log.info(`Materialized ${entries.length} corpse inventory item(s) into loot window`, tokenDoc.uuid);
  return next;
}

/**
 * Claim exclusive loot session (one player at a time).
 * @param {TokenDocument} tokenDoc
 * @param {User} user
 * @param {Actor} actor
 */
export async function claimLootSession(tokenDoc, user, actor) {
  if (!tokenDoc || !user || !actor) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoLooter") };
  }

  await materializeCorpseInventoryLoot(tokenDoc);
  let state = getCorpseState(tokenDoc);

  if (!hasRemainingLoot(tokenDoc)) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.AlreadyLootedEmpty") };
  }

  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id) {
    const name = state.activeLooterName
      || game.users.get(state.activeLooterUserId)?.name
      || "Another player";
    return {
      ok: false,
      error: game.i18n.format("LOOTFORGE.Notify.LootBusy", { name })
    };
  }

  state = await updateCorpseState(tokenDoc, {
    activeLooterUserId: user.id,
    activeLooterActorId: actor.id,
    activeLooterName: actor.name,
    assignedActorId: actor.id,
    assignedUserId: user.id,
    looted: false
  });

  log.info("Loot session claimed", {
    tokenUuid: tokenDoc.uuid,
    userId: user.id,
    actorId: actor.id
  });
  return { ok: true, state };
}

/**
 * Clear exclusive looter lock without depositing.
 * @param {TokenDocument} tokenDoc
 */
export async function clearLootSession(tokenDoc) {
  return updateCorpseState(tokenDoc, {
    activeLooterUserId: null,
    activeLooterActorId: null,
    activeLooterName: null,
    assignedActorId: null,
    assignedUserId: null
  });
}

/**
 * @param {Actor} actor
 * @param {import("./loot-storage.js").CorpseLootItem} entry
 * @param {string} sourceCreature
 * @returns {Promise<Item|null>}
 */
async function grantEntryToActor(actor, entry, sourceCreature) {
  const normalized = normalizeLegacyEntry(entry);
  const definitionId = normalized.definitionId;

  const existing = findStackableItem(actor, definitionId);
  if (existing) {
    const nextQty = Number(existing.system?.quantity ?? 0) + Number(normalized.quantity ?? 0);
    await existing.update({ "system.quantity": nextQty });
    return existing;
  }

  const data = await resolveItemDataForTransfer(normalized, {
    quantity: normalized.quantity,
    sourceCreature
  });
  delete data._id;

  const created = await actor.createEmbeddedDocuments("Item", [data]);
  return created?.[0] ?? null;
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {string} entryId
 * @param {object} [options]
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
      lootedAt: empty ? Date.now() : state.lootedAt,
      ...(empty
        ? {
          activeLooterUserId: null,
          activeLooterActorId: null,
          activeLooterName: null,
          assignedActorId: null,
          assignedUserId: null
        }
        : {})
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

    await materializeCorpseInventoryLoot(tokenDoc);
    let state = getCorpseState(tokenDoc);
    const sourceCreature = state.creatureContext?.name ?? tokenDoc.name;

    for (const entry of [...state.items]) {
      if (entry.quantity <= 0) continue;
      await grantEntryToActor(actor, entry, sourceCreature);
    }

    state = await updateCorpseState(tokenDoc, {
      items: [],
      looted: true,
      lootedAt: Date.now(),
      activeLooterUserId: null,
      activeLooterActorId: null,
      activeLooterName: null,
      assignedActorId: null,
      assignedUserId: null
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

/**
 * Leave loot window: deposit leftovers onto the corpse actor and free the session
 * so another player can loot (WoW-style).
 *
 * @param {TokenDocument} tokenDoc
 * @param {User} [user]
 */
export async function depositRemainingToCorpse(tokenDoc, user = game.user) {
  const lockKey = `${tokenDoc.uuid}:DONE`;
  if (!acquireLock(lockKey)) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.TransferBusy") };
  }

  try {
    const state = getCorpseState(tokenDoc);
    if (!user.isGM) {
      if (state.activeLooterUserId && state.activeLooterUserId !== user.id) {
        return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoTakePermission") };
      }
      if (!canUserLootCorpse(tokenDoc, user) && state.activeLooterUserId !== user.id) {
        // Still allow release if they held the session.
        if (state.activeLooterUserId !== user.id) {
          return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoTakePermission") };
        }
      }
    }

    const corpseActor = tokenDoc.actor;
    if (!corpseActor) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.TransferFailed") };
    }

    let deposited = 0;
    const sourceCreature = state.creatureContext?.name ?? tokenDoc.name;
    for (const entry of [...(state.items ?? [])]) {
      if (entry.quantity <= 0) continue;
      await grantEntryToActor(corpseActor, entry, sourceCreature);
      deposited += 1;
    }

    const stillHasInventory = deposited > 0 || corpseHasInventoryLoot(tokenDoc);
    const nextState = await updateCorpseState(tokenDoc, {
      items: [],
      looted: !stillHasInventory,
      lootedAt: stillHasInventory ? null : Date.now(),
      activeLooterUserId: null,
      activeLooterActorId: null,
      activeLooterName: null,
      // Free the corpse for the next player (WoW free-for-all leftovers).
      assignedActorId: null,
      assignedUserId: null
    });

    log.info(`Loot session closed: deposited ${deposited} → ${corpseActor.name}`, tokenDoc.uuid);
    return { ok: true, state: nextState, deposited };
  } catch (err) {
    log.error("depositRemainingToCorpse failed", err);
    return {
      ok: false,
      error: game.i18n.localize("LOOTFORGE.Notify.TransferFailed")
    };
  } finally {
    releaseLock(lockKey);
  }
}
