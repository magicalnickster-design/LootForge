/**
 * Zombie — undead multi-pool profile.
 * Sheet equipment (burial goods, scavenged gear) drops when present.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const zombieProfile = {
  id: "zombie",
  matchNames: ["zombie"],
  matchWholeWords: true,
  matchTypes: ["undead"],
  matchSubtypes: ["zombie"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "rotten-flesh",
          quantityByQuality: {
            poor: [1, 2],
            standard: [1, 3],
            good: [2, 3],
            excellent: [2, 4],
            exceptional: [3, 4]
          },
          chanceByQuality: {
            poor: 0.8,
            standard: 0.95,
            good: 1,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "zombie-tooth",
          quantityByQuality: {
            poor: [0, 2],
            standard: [1, 3],
            good: [1, 4],
            excellent: [2, 4],
            exceptional: [2, 5]
          },
          chanceByQuality: {
            poor: 0.5,
            standard: 0.7,
            good: 0.85,
            excellent: 0.95,
            exceptional: 1
          }
        },
        {
          definitionId: "grave-dirt",
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
            good: 0.7,
            excellent: 0.85,
            exceptional: 0.95
          }
        },
        {
          definitionId: "zombie-hand",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.2,
            good: 0.35,
            excellent: 0.5,
            exceptional: 0.7
          }
        },
        {
          definitionId: "ectoplasm-vial",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [0, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.05,
            standard: 0.12,
            good: 0.22,
            excellent: 0.35,
            exceptional: 0.5
          }
        }
      ]
    },
    currency: {
      type: "currency",
      denominations: {
        cp: { min: 0, max: 12, chance: 0.55 },
        sp: { min: 0, max: 4, chance: 0.25 },
        gp: { min: 0, max: 1, chance: 0.05 }
      },
      crScale: { cp: 1, sp: 0.25, gp: 0.1 },
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
        weapon: 0.35,
        armor: 0.2,
        shield: 0.15,
        consumable: 0.4,
        tool: 0.15,
        container: 0.2,
        other: 0.35
      },
      maxDrops: 2,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.6, worn: 0.3, standard: 0.1, fine: 0, masterwork: 0 },
        standard: { broken: 0.4, worn: 0.4, standard: 0.2, fine: 0, masterwork: 0 },
        good: { broken: 0.25, worn: 0.4, standard: 0.3, fine: 0.05, masterwork: 0 },
        excellent: { broken: 0.15, worn: 0.35, standard: 0.4, fine: 0.1, masterwork: 0 },
        exceptional: { broken: 0.1, worn: 0.3, standard: 0.45, fine: 0.15, masterwork: 0 }
      }
    },
    junk: {
      type: "poolPick",
      definitionIds: [
        "burial-shroud-scrap",
        "coffin-nail",
        "dirty-rag",
        "old-boot",
        "empty-bottle"
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
        "burial-coin",
        "broken-holy-symbol",
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
        poor: 0.08,
        standard: 0.14,
        good: 0.22,
        excellent: 0.34,
        exceptional: 0.48
      }
    },
    story: {
      type: "poolPick",
      definitionIds: [
        "unfinished-will",
        "scribbled-note",
        "wanted-poster"
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
        standard: 0.08,
        good: 0.14,
        excellent: 0.22,
        exceptional: 0.32
      }
    }
  }
};
