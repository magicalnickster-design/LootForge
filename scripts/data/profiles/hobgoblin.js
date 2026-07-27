/**
 * Hobgoblin — goblinoid multi-pool profile (distinct from goblin / bugbear).
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const hobgoblinProfile = {
  id: "hobgoblin",
  matchNames: ["hobgoblin"],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  matchSubtypes: ["hobgoblin"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "hobgoblin-ear",
          quantityByQuality: {
            poor: [0, 1],
            standard: [1, 1],
            good: [1, 2],
            excellent: [1, 2],
            exceptional: [2, 2]
          },
          chanceByQuality: {
            poor: 0.55,
            standard: 0.8,
            good: 0.9,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "hobgoblin-tooth",
          quantityByQuality: {
            poor: [0, 2],
            standard: [1, 2],
            good: [1, 3],
            excellent: [2, 3],
            exceptional: [2, 4]
          },
          chanceByQuality: {
            poor: 0.5,
            standard: 0.75,
            good: 0.9,
            excellent: 1,
            exceptional: 1
          }
        },
        {
          definitionId: "hobgoblin-blood-vial",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.15,
            standard: 0.3,
            good: 0.5,
            excellent: 0.7,
            exceptional: 0.85
          }
        },
        {
          definitionId: "hobgoblin-banner-scrap",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.18,
            good: 0.32,
            excellent: 0.5,
            exceptional: 0.7
          }
        }
      ]
    },

    currency: {
      type: "currency",
      denominations: {
        cp: { min: 4, max: 24, chance: 1 },
        sp: { min: 1, max: 12, chance: 0.95 },
        gp: { min: 0, max: 6, chance: 0.35 }
      },
      crScale: {
        cp: 1.5,
        sp: 1,
        gp: 0.6
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
      chances: {
        weapon: 0.9,
        armor: 0.75,
        shield: 0.7,
        consumable: 0.45,
        tool: 0.2,
        container: 0.25,
        other: 0.35
      },
      maxDrops: 4,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.15, worn: 0.35, standard: 0.4, fine: 0.1, masterwork: 0 },
        standard: { broken: 0.05, worn: 0.25, standard: 0.45, fine: 0.2, masterwork: 0.05 },
        good: { broken: 0.02, worn: 0.12, standard: 0.4, fine: 0.35, masterwork: 0.11 },
        excellent: { broken: 0, worn: 0.06, standard: 0.3, fine: 0.4, masterwork: 0.24 },
        exceptional: { broken: 0, worn: 0.03, standard: 0.2, fine: 0.42, masterwork: 0.35 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "hobgoblin-ration-tin",
        "hobgoblin-boot-nail",
        "dirty-rag",
        "empty-bottle",
        "bent-spoon",
        "rusty-nail-pouch"
      ],
      countByQuality: {
        poor: [1, 2],
        standard: [1, 2],
        good: [1, 3],
        excellent: [2, 3],
        exceptional: [2, 3]
      },
      chanceByQuality: {
        poor: 0.75,
        standard: 0.85,
        good: 0.92,
        excellent: 1,
        exceptional: 1
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "hobgoblin-legion-badge",
        "iron-nose-ring",
        "copper-ring",
        "worn-insignia",
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
        poor: 0.15,
        standard: 0.28,
        good: 0.42,
        excellent: 0.58,
        exceptional: 0.75
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "hobgoblin-marching-orders",
        "bandit-orders",
        "caravan-schedule",
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
        good: 0.28,
        excellent: 0.42,
        exceptional: 0.58
      }
    }
  }
};
