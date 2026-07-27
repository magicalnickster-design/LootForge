/**
 * Construct — multi-pool profile for flying swords, helmed horrors, golems,
 * and shield guardians.
 *
 * Animated Armor stays on its legacy salvage-only profile (matched first).
 * Quantities scale by form via `lootScale` (flying sword smaller, iron golem larger).
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const constructProfile = {
  id: "construct",
  matchNames: [
    "shield guardian",
    "helmed horror",
    "flying sword",
    "iron golem",
    "stone golem",
    "clay golem",
    "flesh golem",
    "golem",
    "construct"
  ],
  matchWholeWords: true,
  matchTypes: ["construct"],
  matchSubtypes: ["construct", "golem"],
  excludeNames: ["animated armor", "animated armour", "chest", "container"],
  lootScale: {
    // Longest token wins (see resolveLootScale).
    nameTokens: {
      "shield guardian": 1.2,
      "helmed horror": 1,
      "flying sword": 0.4,
      "iron golem": 1.65,
      "stone golem": 1.35,
      "clay golem": 1.25,
      "flesh golem": 1.05,
      golem: 1.2,
      construct: 1
    },
    bySize: {
      tiny: 0.4,
      sm: 0.55,
      med: 0.9,
      lg: 1.2,
      huge: 1.5,
      grg: 1.75
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "construct-gears",
          quantityByQuality: {
            poor: [0, 1],
            standard: [1, 1],
            good: [1, 2],
            excellent: [1, 2],
            exceptional: [2, 3]
          },
          chanceByQuality: {
            poor: 0.55,
            standard: 0.8,
            good: 0.95,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "arcane-core-shard",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 2],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.3,
            standard: 0.5,
            good: 0.7,
            excellent: 0.85,
            exceptional: 0.95
          }
        },
        {
          definitionId: "flying-sword-hilt",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.1,
            standard: 0.18,
            good: 0.28,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "helmed-horror-plume",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.25,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "helmed-horror-plate",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.06,
            standard: 0.14,
            good: 0.25,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "flesh-golem-stitch",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.25,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "clay-golem-chunk",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.06,
            standard: 0.14,
            good: 0.25,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "stone-golem-chip",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.06,
            standard: 0.14,
            good: 0.25,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "iron-golem-plate",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 0],
            good: [0, 1],
            excellent: [0, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.02,
            standard: 0.06,
            good: 0.14,
            excellent: 0.28,
            exceptional: 0.45
          }
        },
        {
          definitionId: "guardian-amulet-shard",
          rare: true,
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 0],
            good: [0, 1],
            excellent: [0, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0,
            standard: 0.04,
            good: 0.1,
            excellent: 0.22,
            exceptional: 0.4
          }
        }
      ]
    },

    currency: {
      type: "currency",
      // Constructs rarely carry coin; lairs / creators may stash some.
      denominations: {
        cp: { min: 0, max: 8, chance: 0.2 },
        sp: { min: 0, max: 10, chance: 0.4 },
        gp: { min: 0, max: 16, chance: 0.55 },
        pp: { min: 0, max: 4, chance: 0.12 }
      },
      crScale: {
        cp: 0.5,
        sp: 0.85,
        gp: 1.75,
        pp: 0.45
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
      // Weapons/armor on the sheet (flying sword, helmed horror, guardians).
      chances: {
        weapon: 0.85,
        armor: 0.7,
        shield: 0.45,
        consumable: 0.25,
        tool: 0.2,
        container: 0.2,
        other: 0.35
      },
      maxDrops: 3,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.25, worn: 0.35, standard: 0.3, fine: 0.1, masterwork: 0 },
        standard: { broken: 0.1, worn: 0.25, standard: 0.4, fine: 0.2, masterwork: 0.05 },
        good: { broken: 0.04, worn: 0.15, standard: 0.35, fine: 0.35, masterwork: 0.11 },
        excellent: { broken: 0.01, worn: 0.08, standard: 0.25, fine: 0.4, masterwork: 0.26 },
        exceptional: { broken: 0, worn: 0.04, standard: 0.18, fine: 0.38, masterwork: 0.4 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "rusted-rivet",
        "scorched-wiring",
        "bent-armor-joint",
        "rusty-nail-pouch",
        "empty-bottle",
        "ash-clump"
      ],
      countByQuality: {
        poor: [1, 2],
        standard: [1, 2],
        good: [1, 3],
        excellent: [2, 3],
        exceptional: [2, 4]
      },
      chanceByQuality: {
        poor: 0.7,
        standard: 0.8,
        good: 0.88,
        excellent: 0.95,
        exceptional: 1
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "clockwork-spring",
        "binding-rune-plate",
        "copper-ring",
        "obsidian-focus",
        "bone-necklace"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [1, 1],
        excellent: [1, 2],
        exceptional: [1, 2]
      },
      chanceByQuality: {
        poor: 0.12,
        standard: 0.22,
        good: 0.35,
        excellent: 0.5,
        exceptional: 0.7
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "creator-schematic",
        "activation-phrase",
        "golem-manual-page",
        "scribbled-note"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [0, 1],
        excellent: [1, 1],
        exceptional: [1, 1]
      },
      chanceByQuality: {
        poor: 0.08,
        standard: 0.15,
        good: 0.25,
        excellent: 0.4,
        exceptional: 0.55
      }
    }
  }
};
