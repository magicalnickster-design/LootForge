import {
  formatDefinitionValue,
  getLootDefinition,
  resolveItemDataForTransfer
} from "../data/loot-definitions.js";
import { log } from "./logger.js";
import { canUserLootCorpse, canUserReceiveLootAs, userOwnsActor } from "./ownership.js";
import { getSetting } from "./settings.js";
import { aggregateCurrencyFromItems } from "./loot-generator.js";
import {
  corpseHasInventoryLoot,
  getCorpseInventoryLootItems,
  getCorpseState,
  hasRemainingLoot,
  isLootSessionLocked,
  updateCorpseState
} from "./loot-storage.js";

/** One in-flight transfer per corpse — shared by take-one and take-all. */
const transferLocks = new Set();

function corpseTransferLockKey(tokenDoc) {
  return `${tokenDoc?.uuid ?? "unknown"}:TRANSFER`;
}

function acquireLock(lockKey) {
  if (transferLocks.has(lockKey)) return false;
  transferLocks.add(lockKey);
  return true;
}

function releaseLock(lockKey) {
  transferLocks.delete(lockKey);
}

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

export function canTakeLoot(tokenDoc, actor, user = game.user) {
  if (!tokenDoc || !actor) return false;
  if (user.isGM) return true;

  const state = getCorpseState(tokenDoc);
  if (state.pendingReview && !state.dmApproved) return false;

  if (state.freeForAll || state.dmApproved) {
    return canUserReceiveLootAs(actor, user);
  }

  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id) {
    return false;
  }
  if (state.activeLooterActorId && state.activeLooterActorId !== actor.id) {
    return false;
  }
  if (state.assignedActorId && state.assignedActorId !== actor.id) {
    if (!(getSetting("allowAllPlayersToLoot") && state.activeLooterUserId === user.id)) {
      return false;
    }
  }
  if (!canUserLootCorpse(tokenDoc, user)) return false;
  return userOwnsActor(actor, user) || state.assignedUserId === user.id || state.activeLooterUserId === user.id;
}

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

export async function claimLootSession(tokenDoc, user, actor, { force = false } = {}) {
  if (!tokenDoc || !user || !actor) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoLooter") };
  }

  await materializeCorpseInventoryLoot(tokenDoc);
  let state = getCorpseState(tokenDoc);

  if (!hasRemainingLoot(tokenDoc)) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.AlreadyLootedEmpty") };
  }

  if (state.pendingReview && !state.dmApproved && !force) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.WaitingForGM") };
  }

  if ((state.freeForAll || state.dmApproved) && !force) {
    log.info("Joined shared loot session", {
      tokenUuid: tokenDoc.uuid,
      userId: user.id,
      actorId: actor.id,
      freeForAll: Boolean(state.freeForAll),
      dmApproved: Boolean(state.dmApproved)
    });
    return { ok: true, state, shared: true };
  }

  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id && !force) {
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
    pendingReview: false,
    dmApproved: true,
    freeForAll: false,
    looted: false
  });

  log.info("Loot session claimed", {
    tokenUuid: tokenDoc.uuid,
    userId: user.id,
    actorId: actor.id,
    force
  });
  return { ok: true, state };
}

export async function clearLootSession(tokenDoc) {
  return updateCorpseState(tokenDoc, {
    activeLooterUserId: null,
    activeLooterActorId: null,
    activeLooterName: null,
    assignedActorId: null,
    assignedUserId: null
  });
}

async function grantCurrencyToActor(actor, currency) {
  const patch = {};
  for (const [denom, amount] of Object.entries(currency ?? {})) {
    const add = Math.floor(Number(amount) || 0);
    if (add <= 0) continue;
    const current = Number(actor.system?.currency?.[denom] ?? 0);
    patch[`system.currency.${denom}`] = current + add;
  }
  if (Object.keys(patch).length) {
    await actor.update(patch);
  }
}

async function grantEntryToActor(actor, entry, sourceCreature) {
  const normalized = normalizeLegacyEntry(entry);

  if (normalized.kind === "currency" || normalized.definitionId?.startsWith?.("currency-")) {
    await grantCurrencyToActor(actor, normalized.currency);
    return null;
  }

  const definitionId = normalized.definitionId;

  if (normalized.kind !== "equipment") {
    const existing = findStackableItem(actor, definitionId);
    if (existing) {
      const nextQty = Number(existing.system?.quantity ?? 0) + Number(normalized.quantity ?? 0);
      await existing.update({ "system.quantity": nextQty });
      return existing;
    }
  }

  const data = await resolveItemDataForTransfer(normalized, {
    quantity: normalized.quantity,
    sourceCreature
  });
  delete data._id;

  const created = await actor.createEmbeddedDocuments("Item", [data]);
  return created?.[0] ?? null;
}

export async function takeCorpseItem(tokenDoc, actor, entryId, { quantity, user = game.user } = {}) {
  const lockKey = corpseTransferLockKey(tokenDoc);
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

    // Claim on the corpse first so concurrent Take / Loot All cannot re-grant.
    const remaining = entry.quantity - takeQty;
    const nextItems = remaining > 0
      ? state.items.map((i) => (i.entryId === entryId ? { ...i, quantity: remaining } : i))
      : state.items.filter((i) => i.entryId !== entryId);

    const empty = !nextItems.some((i) => i.quantity > 0);
    const nextState = await updateCorpseState(tokenDoc, {
      items: nextItems,
      currency: aggregateCurrencyFromItems(nextItems),
      looted: empty,
      lootedAt: empty ? Date.now() : state.lootedAt,
      ...(empty
        ? {
          activeLooterUserId: null,
          activeLooterActorId: null,
          activeLooterName: null,
          assignedActorId: null,
          assignedUserId: null,
          freeForAll: false
        }
        : {})
    });

    try {
      await grantEntryToActor(actor, grant, sourceCreature);
    } catch (grantErr) {
      log.error("grant after claim failed; restoring item to corpse", grantErr);
      await updateCorpseState(tokenDoc, {
        items: state.items,
        currency: aggregateCurrencyFromItems(state.items),
        looted: false,
        lootedAt: state.lootedAt,
        freeForAll: state.freeForAll,
        activeLooterUserId: state.activeLooterUserId,
        activeLooterActorId: state.activeLooterActorId,
        activeLooterName: state.activeLooterName,
        assignedActorId: state.assignedActorId,
        assignedUserId: state.assignedUserId
      });
      throw grantErr;
    }

    if (empty) {
      const { syncLootedCorpseVisibility } = await import("./loot-indicator.js");
      await syncLootedCorpseVisibility(tokenDoc);
    }

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

export async function takeAllCorpseItems(tokenDoc, actor, user = game.user) {
  const lockKey = corpseTransferLockKey(tokenDoc);
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
    const state = getCorpseState(tokenDoc);
    const claimed = (state.items ?? []).filter((entry) => Number(entry.quantity) > 0);
    if (!claimed.length) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.AlreadyLootedEmpty") };
    }

    const sourceCreature = state.creatureContext?.name ?? tokenDoc.name;

    // Clear the corpse before granting so a second Loot All cannot copy the same pile.
    const nextState = await updateCorpseState(tokenDoc, {
      items: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      looted: true,
      lootedAt: Date.now(),
      activeLooterUserId: null,
      activeLooterActorId: null,
      activeLooterName: null,
      assignedActorId: null,
      assignedUserId: null,
      freeForAll: false
    });

    try {
      for (const entry of claimed) {
        await grantEntryToActor(actor, entry, sourceCreature);
      }
    } catch (grantErr) {
      log.error("Take All grant failed after claim; restoring corpse loot", grantErr);
      await updateCorpseState(tokenDoc, {
        items: claimed,
        currency: aggregateCurrencyFromItems(claimed),
        looted: false,
        lootedAt: null,
        freeForAll: state.freeForAll,
        activeLooterUserId: state.activeLooterUserId,
        activeLooterActorId: state.activeLooterActorId,
        activeLooterName: state.activeLooterName,
        assignedActorId: state.assignedActorId,
        assignedUserId: state.assignedUserId
      });
      throw grantErr;
    }

    const { syncLootedCorpseVisibility } = await import("./loot-indicator.js");
    await syncLootedCorpseVisibility(tokenDoc);

    log.info(`Take All → ${actor.name} from ${tokenDoc.name} (${claimed.length} entries)`);
    return { ok: true, state: nextState };
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

export async function depositRemainingToCorpse(tokenDoc, user = game.user) {
  const lockKey = corpseTransferLockKey(tokenDoc);
  if (!acquireLock(lockKey)) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.TransferBusy") };
  }

  try {
    const state = getCorpseState(tokenDoc);
    if (!user.isGM) {
      if (state.freeForAll) {
        return { ok: true, state, deposited: 0, freeForAll: true, noop: true };
      }
      if (state.activeLooterUserId && state.activeLooterUserId !== user.id) {
        return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoTakePermission") };
      }
      if (!canUserLootCorpse(tokenDoc, user) && state.activeLooterUserId !== user.id) {
        if (state.activeLooterUserId !== user.id) {
          return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoTakePermission") };
        }
      }
    }

    const remaining = (state.items ?? []).filter((i) => Number(i.quantity) > 0);
    const stillHas = remaining.length > 0 || corpseHasInventoryLoot(tokenDoc);

    const nextState = await updateCorpseState(tokenDoc, {
      activeLooterUserId: null,
      activeLooterActorId: null,
      activeLooterName: null,
      assignedActorId: null,
      assignedUserId: null,
      pendingReview: false,
      dmApproved: true,
      freeForAll: stillHas,
      looted: !stillHas,
      lootedAt: stillHas ? null : Date.now()
    });

    if (!stillHas) {
      const { syncLootedCorpseVisibility } = await import("./loot-indicator.js");
      await syncLootedCorpseVisibility(tokenDoc);
    }

    log.info(`Loot session closed: free-for-all=${stillHas}, remaining=${remaining.length}`, tokenDoc.uuid);
    return {
      ok: true,
      state: nextState,
      deposited: remaining.length,
      freeForAll: stillHas
    };
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
