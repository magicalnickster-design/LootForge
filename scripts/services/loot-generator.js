/**
 * Generate loot entries from prototype tables using roll tier + CR caps.
 */

import {
  LOOT_TABLES,
  TIER_ORDER,
  maxTierForCR,
  resolveLootTableKey,
  tierFromRollTotal
} from "../data/prototype-loot-tables.js";

/**
 * @typedef {object} GeneratedLootItem
 * @property {string} name
 * @property {number} quantity
 * @property {string} type
 * @property {string} [description]
 * @property {boolean} [bonus]
 */

/**
 * @typedef {object} GeneratedLoot
 * @property {string} tableKey
 * @property {string} tier
 * @property {string} requestedTier
 * @property {GeneratedLootItem[]} items
 */

/**
 * Inclusive random integer.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/**
 * Clamp a tier to the highest allowed by CR / table configuration.
 * @param {string} tier
 * @param {number} cr
 * @param {import("../data/prototype-loot-tables.js").CreatureLootTable} table
 * @returns {string}
 */
function clampTier(tier, cr, table) {
  const crCap = maxTierForCR(cr);
  const tableCap = table.maxCR !== undefined ? maxTierForCR(table.maxCR) : "legendary";
  const allowedIdx = Math.min(TIER_ORDER.indexOf(crCap), TIER_ORDER.indexOf(tableCap));

  // Walk down until we find a configured tier at or below the cap.
  let idx = Math.min(TIER_ORDER.indexOf(tier), allowedIdx);
  while (idx >= 0) {
    const key = TIER_ORDER[idx];
    if (table.tiers?.[key]?.length) return key;
    idx -= 1;
  }
  return "poor";
}

/**
 * Expand table entries into concrete quantity rolls.
 * @param {import("../data/prototype-loot-tables.js").LootEntry[]} entries
 * @param {boolean} [bonus=false]
 * @returns {GeneratedLootItem[]}
 */
function materializeEntries(entries, bonus = false) {
  return (entries ?? []).map((entry) => {
    const [min, max] = entry.quantity ?? [1, 1];
    return {
      name: entry.name,
      quantity: randomInt(min, max),
      type: entry.type ?? "loot",
      description: entry.description ?? "",
      bonus
    };
  });
}

/**
 * @param {object} options
 * @param {Actor} options.creature
 * @param {number} options.rollTotal
 * @param {boolean} [options.isNatural20=false]
 * @returns {GeneratedLoot|null}
 */
export function generateLoot({ creature, rollTotal, isNatural20 = false }) {
  const tableKey = resolveLootTableKey(creature?.name);
  if (!tableKey) {
    console.warn(`LootForge | No loot table for creature "${creature?.name}"`);
    return null;
  }

  const table = LOOT_TABLES[tableKey];
  const cr = Number(creature?.system?.details?.cr ?? table.maxCR ?? 0);
  const requestedTier = tierFromRollTotal(rollTotal);
  const tier = clampTier(requestedTier, cr, table);
  const items = materializeEntries(table.tiers[tier] ?? []);

  if (isNatural20) {
    if (table.bonusNatural20?.length) {
      items.push(...materializeEntries(table.bonusNatural20, true));
    } else if (items.length) {
      // Fallback: bump the first item to its max-ish quantity.
      items[0].quantity += 1;
      items[0].bonus = true;
    }
  }

  return {
    tableKey,
    tier,
    requestedTier,
    items
  };
}
