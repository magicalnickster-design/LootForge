/**
 * Shared pool fragments for Tier 5 unique boss profiles.
 * Rich currency, high-quality sheet gear, and boss collectible poolPicks.
 */

/** @type {object} */
export const BOSS_CURRENCY = {
  type: "currency",
  denominations: {
    cp: { min: 0, max: 20, chance: 0.2 },
    sp: { min: 10, max: 80, chance: 0.55 },
    gp: { min: 80, max: 400, chance: 1 },
    pp: { min: 10, max: 80, chance: 0.85 }
  },
  crScale: {
    cp: 0.2,
    sp: 1,
    gp: 4,
    pp: 2.5
  },
  qualityChanceBonus: {
    poor: 0,
    standard: 0.05,
    good: 0.1,
    excellent: 0.15,
    exceptional: 0.2
  }
};

/** @type {object} */
export const BOSS_EQUIPMENT = {
  type: "equipment",
  chances: {
    weapon: 0.9,
    armor: 0.75,
    shield: 0.4,
    consumable: 0.7,
    tool: 0.35,
    container: 0.45,
    other: 0.55
  },
  maxDrops: 6,
  qualityWeightsByRollQuality: {
    poor: { broken: 0.02, worn: 0.1, standard: 0.3, fine: 0.4, masterwork: 0.18 },
    standard: { broken: 0, worn: 0.05, standard: 0.2, fine: 0.4, masterwork: 0.35 },
    good: { broken: 0, worn: 0.02, standard: 0.12, fine: 0.36, masterwork: 0.5 },
    excellent: { broken: 0, worn: 0, standard: 0.08, fine: 0.3, masterwork: 0.62 },
    exceptional: { broken: 0, worn: 0, standard: 0.04, fine: 0.24, masterwork: 0.72 }
  }
};

/**
 * Guaranteed-style definition drop: always attempts; min qty usually ≥ 1.
 * @param {string} definitionId
 * @param {[number, number]} qty
 * @param {object} [opts]
 */
export function bossGuaranteed(definitionId, qty = [1, 1], opts = {}) {
  return {
    definitionId,
    quantityByQuality: {
      poor: qty,
      standard: qty,
      good: qty,
      excellent: [qty[0], Math.max(qty[1], qty[0] + (opts.extraExcellent ? 1 : 0))],
      exceptional: [qty[0], Math.max(qty[1] + 1, qty[0] + 1)]
    },
    chanceByQuality: {
      poor: 1,
      standard: 1,
      good: 1,
      excellent: 1,
      exceptional: 1
    },
    guaranteedFallback: Boolean(opts.fallback),
    rare: Boolean(opts.rare)
  };
}

/**
 * High-chance boss drop (not fully guaranteed at poor quality).
 * @param {string} definitionId
 * @param {object} [opts]
 */
export function bossLikely(definitionId, opts = {}) {
  const qty = opts.qty ?? [1, 1];
  return {
    definitionId,
    quantityByQuality: {
      poor: [0, 1],
      standard: qty,
      good: qty,
      excellent: [qty[0], qty[1] + (opts.bump ? 1 : 0)],
      exceptional: [qty[0], qty[1] + 1]
    },
    chanceByQuality: {
      poor: opts.poorChance ?? 0.75,
      standard: 0.95,
      good: 1,
      excellent: 1,
      exceptional: 1
    },
    rare: Boolean(opts.rare)
  };
}

/**
 * @param {string[]} definitionIds
 * @param {object} [overrides]
 */
export function bossPoolPick(definitionIds, overrides = {}) {
  return {
    type: "poolPick",
    definitionIds,
    countByQuality: {
      poor: [1, 1],
      standard: [1, 2],
      good: [1, 2],
      excellent: [2, 3],
      exceptional: [2, 3]
    },
    chanceByQuality: {
      poor: 0.85,
      standard: 0.95,
      good: 1,
      excellent: 1,
      exceptional: 1
    },
    ...overrides
  };
}
