export const mummyProfile = {
  id: "mummy",
  matchNames: ["mummy", "mummy lord"],
  matchWholeWords: true,
  matchTypes: ["undead"],
  matchSubtypes: ["mummy"],
  lootScale: {
    nameTokens: {
      "mummy lord": 1.45,
      mummy: 1
    },
    bySize: {
      med: 1,
      lg: 1.25,
      huge: 1.45
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "mummy-bandage",
          quantityByQuality: {
            poor: [1, 2],
            standard: [2, 3],
            good: [2, 4],
            excellent: [3, 5],
            exceptional: [4, 6]
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
          definitionId: "withered-flesh",
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
          definitionId: "canopic-dust",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.1,
            standard: 0.25,
            good: 0.4,
            excellent: 0.6,
            exceptional: 0.8
          }
        },
        {
          definitionId: "ectoplasm-vial",
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
            good: 0.3,
            excellent: 0.45,
            exceptional: 0.65
          }
        },
        {
          definitionId: "mummy-heart",
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
      denominations: {
        cp: { min: 0, max: 20, chance: 0.4 },
        sp: { min: 2, max: 20, chance: 0.75 },
        gp: { min: 1, max: 25, chance: 0.85 },
        pp: { min: 0, max: 4, chance: 0.2 }
      },
      crScale: { cp: 1, sp: 1, gp: 1.5, pp: 0.35 },
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
        weapon: 0.55,
        armor: 0.4,
        shield: 0.25,
        consumable: 0.7,
        tool: 0.25,
        container: 0.35,
        other: 0.45
      },
      maxDrops: 4,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.3, worn: 0.4, standard: 0.25, fine: 0.05, masterwork: 0 },
        standard: { broken: 0.15, worn: 0.3, standard: 0.35, fine: 0.15, masterwork: 0.05 },
        good: { broken: 0.08, worn: 0.2, standard: 0.35, fine: 0.3, masterwork: 0.07 },
        excellent: { broken: 0.04, worn: 0.12, standard: 0.3, fine: 0.38, masterwork: 0.16 },
        exceptional: { broken: 0.02, worn: 0.08, standard: 0.25, fine: 0.4, masterwork: 0.25 }
      }
    },
    junk: {
      type: "poolPick",
      definitionIds: [
        "burial-shroud-scrap",
        "coffin-nail",
        "grave-dirt",
        "empty-bottle",
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
        "scarab-bead",
        "burial-coin",
        "broken-holy-symbol",
        "copper-ring"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [1, 1],
        excellent: [1, 1],
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
        "hieroglyph-scrap",
        "curse-tablet",
        "ancient-epitaph",
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
        excellent: 0.38,
        exceptional: 0.55
      }
    }
  }
};
