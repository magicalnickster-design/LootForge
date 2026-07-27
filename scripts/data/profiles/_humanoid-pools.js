/**
 * Shared pool fragments for civilized humanoid profiles.
 * Keeps human / elf / dwarf / halfling profiles consistent without generator branching.
 */

/** @type {import("../creature-profiles.js").CreatureProfile["pools"]["equipment"]} */
export const CIVILIZED_EQUIPMENT = {
  type: "equipment",
  chances: {
    weapon: 0.75,
    armor: 0.45,
    shield: 0.35,
    consumable: 0.85,
    tool: 0.3,
    container: 0.2,
    other: 0.3
  },
  maxDrops: 4,
  qualityWeightsByRollQuality: {
    poor: { broken: 0.2, worn: 0.35, standard: 0.35, fine: 0.1, masterwork: 0 },
    standard: { broken: 0.08, worn: 0.28, standard: 0.4, fine: 0.2, masterwork: 0.04 },
    good: { broken: 0.03, worn: 0.15, standard: 0.42, fine: 0.3, masterwork: 0.1 },
    excellent: { broken: 0.01, worn: 0.08, standard: 0.35, fine: 0.38, masterwork: 0.18 },
    exceptional: { broken: 0, worn: 0.05, standard: 0.28, fine: 0.4, masterwork: 0.27 }
  }
};

/**
 * @param {object} denominations
 * @param {object} [crScale]
 * @returns {object}
 */
export function civilizedCurrency(denominations, crScale = { cp: 2, sp: 0.75, gp: 0.35 }) {
  return {
    type: "currency",
    denominations,
    crScale,
    qualityChanceBonus: {
      poor: -0.08,
      standard: 0,
      good: 0.05,
      excellent: 0.1,
      exceptional: 0.15
    }
  };
}

/**
 * @param {string[]} definitionIds
 * @param {object} [overrides]
 */
export function junkPool(definitionIds, overrides = {}) {
  return {
    type: "poolPick",
    definitionIds,
    countByQuality: overrides.countByQuality ?? {
      poor: [1, 2],
      standard: [1, 2],
      good: [1, 3],
      excellent: [2, 3],
      exceptional: [2, 3]
    },
    chanceByQuality: overrides.chanceByQuality ?? {
      poor: 0.8,
      standard: 0.88,
      good: 0.94,
      excellent: 1,
      exceptional: 1
    }
  };
}

/**
 * @param {string[]} definitionIds
 * @param {object} [overrides]
 */
export function trinketPool(definitionIds, overrides = {}) {
  return {
    type: "poolPick",
    definitionIds,
    countByQuality: overrides.countByQuality ?? {
      poor: [0, 1],
      standard: [0, 1],
      good: [0, 1],
      excellent: [1, 1],
      exceptional: [1, 1]
    },
    chanceByQuality: overrides.chanceByQuality ?? {
      poor: 0.1,
      standard: 0.18,
      good: 0.28,
      excellent: 0.4,
      exceptional: 0.55
    }
  };
}

/**
 * @param {string[]} definitionIds
 * @param {object} [overrides]
 */
export function storyPool(definitionIds, overrides = {}) {
  return {
    type: "poolPick",
    definitionIds,
    countByQuality: overrides.countByQuality ?? {
      poor: [0, 1],
      standard: [0, 1],
      good: [0, 1],
      excellent: [0, 1],
      exceptional: [0, 1]
    },
    chanceByQuality: overrides.chanceByQuality ?? {
      poor: 0.05,
      standard: 0.1,
      good: 0.16,
      excellent: 0.24,
      exceptional: 0.35
    }
  };
}
