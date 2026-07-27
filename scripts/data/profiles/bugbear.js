/**
 * Bugbear — goblinoid multi-pool profile (humanoid).
 * Equipment comes from the NPC inventory when present.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const bugbearProfile = {
  id: "bugbear",
  matchNames: ["bugbear"],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  matchSubtypes: ["bugbear"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "bugbear-ear",
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
            good: 0.92,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "bugbear-fang",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 3]
          },
          chanceByQuality: {
            poor: 0.45,
            standard: 0.7,
            good: 0.85,
            excellent: 0.95,
            exceptional: 1
          }
        },
        {
          definitionId: "bugbear-hide-scrap",
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
          definitionId: "bugbear-heart",
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
            excellent: 0.2,
            exceptional: 0.35
          }
        }
      ]
    },
    currency: {
      type: "currency",
      denominations: {
        cp: { min: 4, max: 28, chance: 1 },
        sp: { min: 0, max: 12, chance: 0.9 },
        gp: { min: 0, max: 6, chance: 0.28 }
      },
      crScale: { cp: 3, sp: 1, gp: 0.6 },
      qualityChanceBonus: {
        poor: -0.08,
        standard: 0,
        good: 0.05,
        excellent: 0.1,
        exceptional: 0.15
      }
    },
    equipment: {
      type: "equipment",
      chances: {
        weapon: 0.85,
        armor: 0.4,
        shield: 0.35,
        consumable: 0.9,
        tool: 0.2,
        container: 0.15,
        other: 0.3
      },
      maxDrops: 4,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.35, worn: 0.4, standard: 0.25, fine: 0, masterwork: 0 },
        standard: { broken: 0.12, worn: 0.35, standard: 0.4, fine: 0.13, masterwork: 0 },
        good: { broken: 0.05, worn: 0.2, standard: 0.45, fine: 0.25, masterwork: 0.05 },
        excellent: { broken: 0.02, worn: 0.12, standard: 0.38, fine: 0.35, masterwork: 0.13 },
        exceptional: { broken: 0, worn: 0.08, standard: 0.3, fine: 0.4, masterwork: 0.22 }
      }
    },
    junk: {
      type: "poolPick",
      definitionIds: [
        "mangy-fur-tuft",
        "greasy-strap",
        "dirty-rag",
        "broken-pipe",
        "old-boot",
        "cracked-mug"
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
        "bone-earring",
        "crude-nose-bone",
        "bone-necklace",
        "copper-ring"
      ],
      countByQuality: {
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
    story: {
      type: "poolPick",
      definitionIds: [
        "bugbear-orders",
        "raid-tally",
        "wanted-poster",
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
        poor: 0.05,
        standard: 0.1,
        good: 0.16,
        excellent: 0.24,
        exceptional: 0.35
      }
    }
  }
};
