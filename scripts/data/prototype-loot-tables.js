/**
 * Prototype loot tables for LootForge.
 *
 * Replace these static tables with Foundry compendium lookups later.
 * Each entry uses quantity: [min, max] inclusive.
 *
 * Optional maxCR on a table clamps which tiers are available for that creature.
 * Optional maxCR on a tier entry is reserved for future item-level gating.
 */

/** @typedef {"poor"|"common"|"good"|"rare"|"best"|"legendary"} LootTier */

/** Ordered from worst to best. */
export const TIER_ORDER = Object.freeze([
  "poor",
  "common",
  "good",
  "rare",
  "best",
  "legendary"
]);

/**
 * Map a final skill-check total to a loot tier key.
 * @param {number} total
 * @returns {LootTier}
 */
export function tierFromRollTotal(total) {
  if (total >= 25) return "best";
  if (total >= 20) return "rare";
  if (total >= 15) return "good";
  if (total >= 10) return "common";
  return "poor";
}

/**
 * Highest loot tier allowed for a creature challenge rating.
 * Prevents low-CR creatures from accessing legendary results.
 * @param {number} cr
 * @returns {LootTier}
 */
export function maxTierForCR(cr) {
  const value = Number(cr);
  if (!Number.isFinite(value) || value < 5) return "best";
  if (value < 10) return "best";
  return "legendary";
}

/**
 * @typedef {object} LootEntry
 * @property {string} name
 * @property {[number, number]} quantity
 * @property {string} [type]        dnd5e Item type; defaults to "loot"
 * @property {string} [description]
 */

/**
 * @typedef {object} CreatureLootTable
 * @property {number} [maxCR]
 * @property {Partial<Record<LootTier, LootEntry[]>>} tiers
 * @property {LootEntry[]} [bonusNatural20]
 */

/** @type {Record<string, CreatureLootTable>} */
export const LOOT_TABLES = {
  wolf: {
    maxCR: 1,
    tiers: {
      poor: [
        { name: "Raw Meat", quantity: [1, 1], description: "Tough meat harvested from a wolf." }
      ],
      common: [
        { name: "Raw Meat", quantity: [1, 2], description: "Tough meat harvested from a wolf." },
        { name: "Wolf Fang", quantity: [1, 1], description: "A sharp fang pried from a wolf's jaw." }
      ],
      good: [
        { name: "Wolf Pelt", quantity: [1, 1], description: "A serviceable wolf hide." },
        { name: "Wolf Fang", quantity: [1, 2], description: "A sharp fang pried from a wolf's jaw." },
        { name: "Raw Meat", quantity: [1, 3], description: "Tough meat harvested from a wolf." }
      ],
      rare: [
        { name: "Pristine Wolf Pelt", quantity: [1, 1], description: "An unusually fine wolf hide." },
        { name: "Large Wolf Fang", quantity: [1, 2], description: "An especially large wolf fang." },
        { name: "Raw Meat", quantity: [2, 3], description: "Tough meat harvested from a wolf." }
      ],
      best: [
        { name: "Pristine Wolf Pelt", quantity: [1, 1], description: "An unusually fine wolf hide." },
        { name: "Alpha Wolf Fang", quantity: [1, 1], description: "A rare fang from a dominant wolf." },
        { name: "Raw Meat", quantity: [2, 4], description: "Tough meat harvested from a wolf." }
      ]
    },
    bonusNatural20: [
      { name: "Wolf Heart", quantity: [1, 1], description: "A carefully excised wolf heart. Natural 20 bonus." }
    ]
  }
};

/**
 * Resolve a loot table key from an actor name.
 * @param {string} name
 * @returns {string|null}
 */
export function resolveLootTableKey(name) {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();
  if (LOOT_TABLES[normalized]) return normalized;

  // Allow names like "Wolf Pack Leader" to resolve to "wolf".
  for (const key of Object.keys(LOOT_TABLES)) {
    if (normalized === key || normalized.includes(key)) return key;
  }
  return null;
}
