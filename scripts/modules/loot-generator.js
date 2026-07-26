/**
 * Generate corpse loot entries from creature profiles + survival/investigation quality.
 */

import {
  buildItemSnapshot,
  formatDefinitionValue,
  getLootDefinition
} from "../data/loot-definitions.js";
import { resolveCreatureProfile } from "../data/creature-profiles.js";
import { getSetting } from "./settings.js";
import { log } from "./logger.js";

const QUALITY_ORDER = ["poor", "standard", "good", "excellent", "exceptional"];

/**
 * Map a skill total to roll quality.
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

/**
 * @param {string} quality
 * @param {number} [steps=1]
 * @returns {string}
 */
function bumpQuality(quality, steps = 1) {
  const idx = QUALITY_ORDER.indexOf(quality);
  if (idx < 0) return quality;
  return QUALITY_ORDER[Math.min(idx + steps, QUALITY_ORDER.length - 1)];
}

/**
 * Resolve which definition a drop uses for a given quality.
 * @param {object} drop
 * @param {string} rollQuality
 * @returns {string|null}
 */
function resolveDropDefinitionId(drop, rollQuality) {
  if (drop?.definitionByQuality) {
    return drop.definitionByQuality[rollQuality]
      ?? drop.definitionByQuality.standard
      ?? Object.values(drop.definitionByQuality)[0]
      ?? null;
  }
  return drop?.definitionId ?? null;
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

function applyContextQuantityBonus(qty, context, { allowBonus = true } = {}) {
  if (!allowBonus) return Math.max(0, qty);
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
    rollQuality = bumpQuality(rollQuality, 1);
  }
  // Nat 20 Investigation on quality-tiered salvage (e.g. animated armor) bumps the tier.
  if (isNatural20 && profile.drops?.some((d) => d.definitionByQuality)) {
    rollQuality = bumpQuality(rollQuality, 1);
  }

  const enableRare = getSetting("enableRareDrops");
  /** @type {import("./loot-storage.js").CorpseLootItem[]} */
  const items = [];
  const fallbackDefs = [];

  for (const drop of profile.drops) {
    if (drop.rare && !enableRare) continue;

    const definitionId = resolveDropDefinitionId(drop, rollQuality);
    if (!definitionId) continue;

    const range = drop.quantityByQuality?.[rollQuality] ?? [0, 0];
    const chance = drop.chanceByQuality?.[rollQuality] ?? 1;
    if (drop.guaranteedFallback) fallbackDefs.push(definitionId);

    if (!chanceSucceeds(chance)) continue;

    const fixedSingle = Boolean(drop.definitionByQuality)
      || (range[0] === 1 && range[1] === 1);
    let qty = randomInt(range[0], range[1]);
    qty = applyContextQuantityBonus(qty, context, { allowBonus: !fixedSingle });
    if (isNatural20 && qty > 0 && !drop.definitionByQuality) qty += 1;
    if (drop.definitionByQuality) qty = Math.min(1, Math.max(0, qty));

    const entry = await buildLootEntry(definitionId, qty);
    if (entry) items.push(entry);
  }

  if (!items.length && fallbackDefs.length) {
    const entry = await buildLootEntry(fallbackDefs[0], 1);
    if (entry) items.push(entry);
  }

  const nat20BonusId = profile.nat20BonusDefinitionId;
  if (isNatural20 && nat20BonusId && !items.some((i) => i.definitionId === nat20BonusId)) {
    const bonus = await buildLootEntry(nat20BonusId, 1);
    if (bonus) items.push(bonus);
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
  const drop = profile?.drops?.find((d) => {
    if (d.definitionId === definitionId) return true;
    if (d.definitionByQuality) {
      return Object.values(d.definitionByQuality).includes(definitionId);
    }
    return false;
  });
  if (!drop) return buildLootEntry(definitionId, 1);

  if (drop.rare && !getSetting("enableRareDrops")) return null;

  const resolvedId = resolveDropDefinitionId(drop, rollQuality) ?? definitionId;
  const range = drop.quantityByQuality?.[rollQuality] ?? [1, 1];
  const chance = drop.chanceByQuality?.[rollQuality] ?? 1;
  if (!chanceSucceeds(Math.max(chance, 0.35))) {
    const min = range[0];
    if (min <= 0) return null;
  }
  const fixedSingle = Boolean(drop.definitionByQuality)
    || (range[0] === 1 && range[1] === 1);
  let qty = randomInt(Math.max(1, range[0]), Math.max(1, range[1]));
  qty = applyContextQuantityBonus(qty, context, { allowBonus: !fixedSingle });
  if (drop.definitionByQuality) qty = 1;
  return buildLootEntry(resolvedId, qty);
}
