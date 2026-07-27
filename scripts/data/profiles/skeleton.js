export const skeletonProfile = {
  id: "skeleton",
  matchNames: ["skeleton"],
  matchWholeWords: true,
  matchTypes: ["undead"],
  matchSubtypes: ["skeleton"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "bone-shard",
          quantityByQuality: {
            poor: [1, 3],
            standard: [2, 4],
            good: [2, 5],
            excellent: [3, 6],
            exceptional: [4, 7]
          },
          chanceByQuality: {
            poor: 0.85,
            standard: 1,
            good: 1,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "yellowed-rib",
          quantityByQuality: {
            poor: [0, 2],
            standard: [1, 2],
            good: [1, 3],
            excellent: [2, 3],
            exceptional: [2, 4]
          },
          chanceByQuality: {
            poor: 0.55,
            standard: 0.75,
            good: 0.9,
            excellent: 1,
            exceptional: 1
          }
        },
        {
          definitionId: "skeleton-finger",
          quantityByQuality: {
            poor: [0, 2],
            standard: [1, 3],
            good: [1, 4],
            excellent: [2, 4],
            exceptional: [2, 5]
          },
          chanceByQuality: {
            poor: 0.45,
            standard: 0.65,
            good: 0.8,
            excellent: 0.9,
            exceptional: 1
          }
        },
        {
          definitionId: "grave-dirt",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
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
          definitionId: "ectoplasm-vial",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [0, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.04,
            standard: 0.1,
            good: 0.2,
            excellent: 0.32,
            exceptional: 0.48
          }
        }
      ]
    },
    currency: {
      type: "currency",
      denominations: {
        cp: { min: 0, max: 18, chance: 0.6 },
        sp: { min: 0, max: 8, chance: 0.4 },
        gp: { min: 0, max: 3, chance: 0.12 }
      },
      crScale: { cp: 1.5, sp: 0.5, gp: 0.25 },
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
        weapon: 0.75,
        armor: 0.45,
        shield: 0.4,
        consumable: 0.35,
        tool: 0.15,
        container: 0.15,
        other: 0.3
      },
      maxDrops: 3,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.55, worn: 0.35, standard: 0.1, fine: 0, masterwork: 0 },
        standard: { broken: 0.3, worn: 0.4, standard: 0.25, fine: 0.05, masterwork: 0 },
        good: { broken: 0.15, worn: 0.35, standard: 0.35, fine: 0.15, masterwork: 0 },
        excellent: { broken: 0.08, worn: 0.25, standard: 0.4, fine: 0.22, masterwork: 0.05 },
        exceptional: { broken: 0.04, worn: 0.18, standard: 0.4, fine: 0.28, masterwork: 0.1 }
      }
    },
    junk: {
      type: "poolPick",
      definitionIds: [
        "rusted-mail-link",
        "coffin-nail",
        "dirty-rag",
        "broken-pipe",
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
        poor: 0.8,
        standard: 0.88,
        good: 0.94,
        excellent: 1,
        exceptional: 1
      }
    },
    trinkets: {
      type: "poolPick",
      definitionIds: [
        "polished-knuckle",
        "burial-coin",
        "broken-holy-symbol",
        "bone-necklace"
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
        standard: 0.16,
        good: 0.26,
        excellent: 0.38,
        exceptional: 0.52
      }
    },
    story: {
      type: "poolPick",
      definitionIds: [
        "ancient-epitaph",
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
        poor: 0.05,
        standard: 0.1,
        good: 0.16,
        excellent: 0.25,
        exceptional: 0.38
      }
    }
  }
};
