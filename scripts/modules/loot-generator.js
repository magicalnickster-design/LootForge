/**
 * Generate corpse loot entries from creature profiles + survival quality.
 */

import {
  buildItemSnapshot,
  formatDefinitionValue,
  getLootDefinition
} from "../data/loot-definitions.js";
import { resolveCreatureProfile } from "../data/creature-profiles.js";
import { getSetting } from "./settings.js";
import { log } from "./logger.js";

/**
 * Map a survival total to roll quality.
 * @param {number} total
 * @returns {string}
 */
export function qualityFromSurvivalTotal(total) {
  const n = Number(total) || 0;
  if (n >= 25) return "exceptional";
  if (n >= 20) return "excellent";
  if (n >= 15) return "good";
  if (n >= 10) return "standard";
  return "poor";
}

function randomInt(min, max) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const rand = typeof CONFIG?.Dice?.randomUniform === "function"
    ? CONFIG.Dice.randomUniform()
    : Math.random();
  return Math.floor(rand * (hi - lo + 1)) + lo;
}

function chanceSucceeds(chance) {
  if (chance >= 1) return true;
  if (chance <= 0) return false;
  const rand = typeof CONFIG?.Dice?.randomUniform === "function"
    ? CONFIG.Dice.randomUniform()
    : Math.random();
  return rand < chance;
}

function applyContextQuantityBonus(qty, context) {
  let result = qty;
  if (context?.size === "lg" || context?.size === "huge") result += 1;
  if (context?.isBoss || context?.isNamed) {
    if (chanceSucceeds(0.5)) result += 1;
  }
  return Math.max(0, result);
}

/**
 * Build a stored corpse loot entry from a definition + quantity.
 * Stores itemUuid + fallback itemData snapshot for durable transfers.
 *
 * @param {string} definitionId
 * @param {number} quantity
 * @returns {Promise<import("./loot-storage.js").CorpseLootItem|null>}
 */
export async function buildLootEntry(definitionId, quantity) {
  const def = getLootDefinition(definitionId);
  if (!def || quantity <= 0) return null;

  const itemData = await buildItemSnapshot(def);

  return {
    entryId: foundry.utils.randomID(),
    definitionId: def.id,
    itemUuid: def.itemUuid,
    quantity: Math.floor(quantity),
    name: itemData.name || def.name,
    img: itemData.img || def.img,
    rarity: def.rarity,
    valueText: formatDefinitionValue(def),
    description: def.description,
    // Fallback snapshot — never the live pack document.
    itemData
  };
}

/**
 * @param {object} options
 * @param {object} options.context
 * @param {number} options.survivalTotal
 * @param {number} [options.naturalDie=0]
 * @param {boolean} [options.isNatural20=false]
 * @returns {Promise<{ profileId: string, rollQuality: string, items: object[] }>}
 */
export async function generateCreatureLoot({
  context,
  survivalTotal,
  naturalDie = 0,
  isNatural20 = false
}) {
  const profile = resolveCreatureProfile(context);
  if (!profile) {
    throw new Error(`No LootForge profile for creature "${context?.name}"`);
  }

  let rollQuality = qualityFromSurvivalTotal(survivalTotal);
  if (context?.isBoss || (context?.isNamed && context?.isWolf)) {
    const order = ["poor", "standard", "good", "excellent", "exceptional"];
    const idx = Math.min(order.indexOf(rollQuality) + 1, order.length - 1);
    rollQuality = order[idx];
  }

  const enableRare = getSetting("enableRareDrops");
  /** @type {import("./loot-storage.js").CorpseLootItem[]} */
  const items = [];
  const fallbackDefs = [];

  for (const drop of profile.drops) {
    if (drop.rare && !enableRare) continue;

    const range = drop.quantityByQuality?.[rollQuality] ?? [0, 0];
    const chance = drop.chanceByQuality?.[rollQuality] ?? 1;
    if (drop.guaranteedFallback) fallbackDefs.push(drop.definitionId);

    if (!chanceSucceeds(chance)) continue;

    let qty = randomInt(range[0], range[1]);
    qty = applyContextQuantityBonus(qty, context);
    if (isNatural20 && qty > 0) qty += 1;

    const entry = await buildLootEntry(drop.definitionId, qty);
    if (entry) items.push(entry);
  }

  if (!items.length && fallbackDefs.length) {
    const entry = await buildLootEntry(fallbackDefs[0], 1);
    if (entry) items.push(entry);
  }

  if (isNatural20 && !items.some((i) => i.definitionId === "wolf-fang")) {
    const fang = await buildLootEntry("wolf-fang", 1);
    if (fang) items.push(fang);
  }

  log.debug("Generated loot", {
    profileId: profile.id,
    rollQuality,
    survivalTotal,
    naturalDie,
    items: items.map((i) => ({
      definitionId: i.definitionId,
      itemUuid: i.itemUuid,
      quantity: i.quantity
    }))
  });

  return {
    profileId: profile.id,
    rollQuality,
    items
  };
}

/**
 * @param {object} context
 * @param {string} rollQuality
 * @param {string} definitionId
 * @returns {Promise<import("./loot-storage.js").CorpseLootItem|null>}
 */
export async function rerollSingleEntry(context, rollQuality, definitionId) {
  const profile = resolveCreatureProfile(context);
  const drop = profile?.drops?.find((d) => d.definitionId === definitionId);
  if (!drop) return buildLootEntry(definitionId, 1);

  if (drop.rare && !getSetting("enableRareDrops")) return null;

  const range = drop.quantityByQuality?.[rollQuality] ?? [1, 1];
  const chance = drop.chanceByQuality?.[rollQuality] ?? 1;
  if (!chanceSucceeds(Math.max(chance, 0.35))) {
    const min = range[0];
    if (min <= 0) return null;
  }
  let qty = randomInt(Math.max(1, range[0]), Math.max(1, range[1]));
  qty = applyContextQuantityBonus(qty, context);
  return buildLootEntry(definitionId, qty);
}
