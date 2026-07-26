/**
 * Goblin — first humanoid multi-pool profile.
 *
 * Generation is driven entirely by `pools`; the loot generator stays generic.
 * Future humanoids (orc, bandit, etc.) should follow this shape.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const goblinProfile = {
  id: "goblin",
  matchNames: ["goblin"],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  matchSubtypes: ["goblin", "goblinoid"],
  excludeNames: ["hobgoblin"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "goblin-ear",
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
          definitionId: "goblin-tooth",
          quantityByQuality: {
            poor: [0, 2],
            standard: [1, 3],
            good: [1, 4],
            excellent: [2, 4],
            exceptional: [2, 5]
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
          definitionId: "goblin-finger-bone",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 2],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.25,
            standard: 0.4,
            good: 0.55,
            excellent: 0.7,
            exceptional: 0.85
          }
        },
        {
          definitionId: "goblin-blood-vial",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.1,
            standard: 0.25,
            good: 0.4,
            excellent: 0.55,
            exceptional: 0.75
          }
        }
      ]
    },

    currency: {
      type: "currency",
      // Believable pocket change; CR nudges the upper end slightly.
      denominations: {
        cp: { min: 2, max: 18, chance: 1 },
        sp: { min: 0, max: 5, chance: 0.85 },
        gp: { min: 0, max: 2, chance: 0.12 }
      },
      crScale: {
        // Per CR point above 0, add this many to the max (floored).
        cp: 2,
        sp: 0.5,
        gp: 0.25
      },
      qualityChanceBonus: {
        poor: -0.1,
        standard: 0,
        good: 0.05,
        excellent: 0.1,
        exceptional: 0.15
      }
    },

    equipment: {
      type: "equipment",
      chances: {
        weapon: 0.7,
        armor: 0.35,
        shield: 0.4,
        consumable: 1,
        tool: 0.25,
        container: 0.15,
        other: 0.2
      },
      maxDrops: 3,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.5, worn: 0.35, standard: 0.15, fine: 0, masterwork: 0 },
        standard: { broken: 0.2, worn: 0.35, standard: 0.35, fine: 0.1, masterwork: 0 },
        good: { broken: 0.08, worn: 0.22, standard: 0.45, fine: 0.22, masterwork: 0.03 },
        excellent: { broken: 0.02, worn: 0.13, standard: 0.4, fine: 0.35, masterwork: 0.1 },
        exceptional: { broken: 0, worn: 0.08, standard: 0.32, fine: 0.4, masterwork: 0.2 }
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
        poor: [1, 2],
        standard: [1, 2],
        good: [1, 3],
        excellent: [2, 3],
        exceptional: [2, 3]
      },
      chanceByQuality: {
        poor: 0.85,
        standard: 0.9,
        good: 0.95,
        excellent: 1,
        exceptional: 1
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
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "goblin-journal",
        "crude-map",
        "wanted-poster",
        "caravan-schedule",
        "bandit-orders",
        "scribbled-note"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [0, 1],
        excellent: [0, 1],
        exceptional: [0, 1]
      },
      chanceByQuality: {
        poor: 0.04,
        standard: 0.07,
        good: 0.12,
        excellent: 0.18,
        exceptional: 0.28
      }
    }
  }
};
