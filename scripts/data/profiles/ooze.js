/**
 * Ooze — multi-pool profile for gray ooze, gelatinous cube, black pudding,
 * and ochre jelly.
 *
 * Quantities scale by creature name via `lootScale` (gray ooze smaller,
 * black pudding larger). Equipment is undigested prey gear from the sheet.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const oozeProfile = {
  id: "ooze",
  matchNames: [
    "gelatinous cube",
    "black pudding",
    "ochre jelly",
    "gray ooze",
    "grey ooze",
    "ooze",
    "jelly",
    "pudding",
    "cube"
  ],
  matchWholeWords: true,
  matchTypes: ["ooze"],
  matchSubtypes: ["ooze"],
  // Avoid matching food/dessert names or unrelated cubes if possible.
  excludeNames: ["ice cube", "rubik", "sugar cube"],
  lootScale: {
    // Longest token wins (see resolveLootScale).
    nameTokens: {
      "gelatinous cube": 0.85,
      "black pudding": 1.25,
      "ochre jelly": 0.8,
      "gray ooze": 0.45,
      "grey ooze": 0.45,
      pudding: 1.15,
      jelly: 0.75,
      ooze: 0.7,
      cube: 0.85
    },
    bySize: {
      sm: 0.5,
      med: 0.75,
      lg: 1.05,
      huge: 1.35,
      grg: 1.6
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "ooze-residue",
          quantityByQuality: {
            poor: [1, 1],
            standard: [1, 2],
            good: [1, 2],
            excellent: [2, 3],
            exceptional: [2, 4]
          },
          chanceByQuality: {
            poor: 0.7,
            standard: 0.9,
            good: 1,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "corrosive-enzyme",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 2],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.35,
            standard: 0.55,
            good: 0.75,
            excellent: 0.9,
            exceptional: 1
          }
        },
        {
          definitionId: "gray-ooze-sample",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.12,
            standard: 0.22,
            good: 0.35,
            excellent: 0.5,
            exceptional: 0.65
          }
        },
        {
          definitionId: "cube-jelly",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.12,
            standard: 0.22,
            good: 0.35,
            excellent: 0.5,
            exceptional: 0.65
          }
        },
        {
          definitionId: "black-pudding-blob",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.18,
            good: 0.3,
            excellent: 0.45,
            exceptional: 0.6
          }
        },
        {
          definitionId: "ochre-jelly-blob",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.1,
            standard: 0.2,
            good: 0.32,
            excellent: 0.48,
            exceptional: 0.65
          }
        },
        {
          definitionId: "protoplasm-core",
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
      // Undigested purses and coins floating inside.
      denominations: {
        cp: { min: 0, max: 20, chance: 0.55 },
        sp: { min: 0, max: 16, chance: 0.7 },
        gp: { min: 0, max: 14, chance: 0.6 },
        pp: { min: 0, max: 2, chance: 0.1 }
      },
      crScale: {
        cp: 1.25,
        sp: 1.25,
        gp: 1.75,
        pp: 0.35
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
      // Classic cube/pudding gullet loot from the sheet.
      chances: {
        weapon: 0.65,
        armor: 0.4,
        shield: 0.25,
        consumable: 0.45,
        tool: 0.25,
        container: 0.4,
        other: 0.5
      },
      maxDrops: 4,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.45, worn: 0.35, standard: 0.18, fine: 0.02, masterwork: 0 },
        standard: { broken: 0.3, worn: 0.35, standard: 0.28, fine: 0.06, masterwork: 0.01 },
        good: { broken: 0.18, worn: 0.3, standard: 0.35, fine: 0.14, masterwork: 0.03 },
        excellent: { broken: 0.1, worn: 0.22, standard: 0.38, fine: 0.24, masterwork: 0.06 },
        exceptional: { broken: 0.05, worn: 0.15, standard: 0.35, fine: 0.35, masterwork: 0.1 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "dissolved-boot",
        "etched-metal-scrap",
        "sticky-film",
        "acid-scarred-coin",
        "empty-bottle",
        "old-boot",
        "dirty-rag"
      ],
      countByQuality: {
        poor: [1, 2],
        standard: [1, 2],
        good: [1, 3],
        excellent: [2, 3],
        exceptional: [2, 4]
      },
      chanceByQuality: {
        poor: 0.75,
        standard: 0.85,
        good: 0.92,
        excellent: 0.97,
        exceptional: 1
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "undigested-ring",
        "slime-coated-gem",
        "acid-scarred-coin",
        "copper-ring",
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
        "partially-digested-note",
        "dungeon-warning-scrap",
        "ooze-lair-map",
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
        poor: 0.06,
        standard: 0.12,
        good: 0.22,
        excellent: 0.35,
        exceptional: 0.5
      }
    }
  }
};
