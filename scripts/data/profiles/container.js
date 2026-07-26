/**
 * Chest / Container — multi-pool profile for placeable loot containers.
 * Matched via flags.lootforge.isContainer (not by creature name).
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const containerProfile = {
  id: "container",
  matchNames: [],
  matchTypes: [],
  // Resolved explicitly when context.isContainer is true.
  pools: {
    currency: {
      type: "currency",
      denominations: {
        cp: { min: 4, max: 30, chance: 1 },
        sp: { min: 0, max: 12, chance: 0.9 },
        gp: { min: 0, max: 6, chance: 0.45 },
        pp: { min: 0, max: 1, chance: 0.05 }
      },
      crScale: {
        cp: 2,
        sp: 1,
        gp: 0.75,
        pp: 0.1
      },
      qualityChanceBonus: {
        poor: -0.05,
        standard: 0,
        good: 0.05,
        excellent: 0.1,
        exceptional: 0.15
      }
    },

    equipment: {
      type: "equipment",
      // If the DM stocked the Chest/Container actor inventory, those can drop.
      chances: {
        weapon: 0.85,
        armor: 0.55,
        shield: 0.55,
        consumable: 1,
        tool: 0.5,
        container: 0.35,
        other: 0.45
      },
      maxDrops: 4,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.15, worn: 0.35, standard: 0.4, fine: 0.1, masterwork: 0 },
        standard: { broken: 0.05, worn: 0.2, standard: 0.5, fine: 0.2, masterwork: 0.05 },
        good: { broken: 0, worn: 0.1, standard: 0.45, fine: 0.35, masterwork: 0.1 },
        excellent: { broken: 0, worn: 0.05, standard: 0.3, fine: 0.45, masterwork: 0.2 },
        exceptional: { broken: 0, worn: 0, standard: 0.2, fine: 0.45, masterwork: 0.35 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "bent-spoon",
        "dirty-rag",
        "broken-pipe",
        "empty-bottle",
        "dice",
        "cracked-mug",
        "old-boot"
      ],
      countByQuality: {
        poor: [0, 2],
        standard: [1, 2],
        good: [1, 3],
        excellent: [1, 3],
        exceptional: [2, 3]
      },
      chanceByQuality: {
        poor: 0.7,
        standard: 0.8,
        good: 0.85,
        excellent: 0.9,
        exceptional: 0.95
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "copper-ring",
        "bone-necklace",
        "lucky-rabbit-foot",
        "small-idol",
        "decorative-feather"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [0, 1],
        excellent: [1, 1],
        exceptional: [1, 2]
      },
      chanceByQuality: {
        poor: 0.15,
        standard: 0.28,
        good: 0.4,
        excellent: 0.55,
        exceptional: 0.7
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "crude-map",
        "wanted-poster",
        "caravan-schedule",
        "bandit-orders",
        "scribbled-note",
        "goblin-journal"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [0, 1],
        excellent: [0, 1],
        exceptional: [1, 1]
      },
      chanceByQuality: {
        poor: 0.08,
        standard: 0.14,
        good: 0.22,
        excellent: 0.32,
        exceptional: 0.45
      }
    }
  }
};
