export const lichProfile = {
  id: "lich",
  matchNames: ["lich", "demilich", "archlich"],
  matchWholeWords: true,
  matchTypes: ["undead"],
  matchSubtypes: ["lich"],
  excludeNames: ["lich king", "lich-king", "king of liches"],
  lootScale: {
    nameTokens: {
      demilich: 0.65,
      archlich: 1.35,
      lich: 1
    },
    bySize: {
      tiny: 0.55,
      med: 1,
      lg: 1.15
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "lich-dust",
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
          definitionId: "necrotic-crystal",
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
          definitionId: "soul-ash",
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
          definitionId: "ectoplasm-vial",
          quantityByQuality: {
            poor: [0, 1],
            standard: [1, 1],
            good: [1, 2],
            excellent: [1, 2],
            exceptional: [2, 2]
          },
          chanceByQuality: {
            poor: 0.4,
            standard: 0.65,
            good: 0.85,
            excellent: 0.95,
            exceptional: 1
          }
        },
        {
          definitionId: "phylactery-shard",
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
            standard: 0.05,
            good: 0.12,
            excellent: 0.25,
            exceptional: 0.45
          }
        }
      ]
    },

    currency: {
      type: "currency",
      denominations: {
        cp: { min: 0, max: 20, chance: 0.25 },
        sp: { min: 5, max: 40, chance: 0.7 },
        gp: { min: 20, max: 120, chance: 1 },
        pp: { min: 2, max: 30, chance: 0.85 }
      },
      crScale: {
        sp: 1,
        gp: 4,
        pp: 1.5
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
        weapon: 0.85,
        armor: 0.55,
        shield: 0.2,
        consumable: 1,
        tool: 0.55,
        container: 0.5,
        other: 0.75
      },
      maxDrops: 6,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.1, worn: 0.25, standard: 0.4, fine: 0.2, masterwork: 0.05 },
        standard: { broken: 0.05, worn: 0.15, standard: 0.35, fine: 0.3, masterwork: 0.15 },
        good: { broken: 0.02, worn: 0.08, standard: 0.25, fine: 0.4, masterwork: 0.25 },
        excellent: { broken: 0, worn: 0.05, standard: 0.2, fine: 0.4, masterwork: 0.35 },
        exceptional: { broken: 0, worn: 0.02, standard: 0.13, fine: 0.35, masterwork: 0.5 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "void-wax-candle",
        "coffin-nail",
        "empty-bottle",
        "broken-pipe"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [1, 1],
        good: [1, 2],
        excellent: [1, 2],
        exceptional: [1, 2]
      },
      chanceByQuality: {
        poor: 0.45,
        standard: 0.6,
        good: 0.75,
        excellent: 0.85,
        exceptional: 0.95
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "obsidian-focus",
        "soul-gem-chip",
        "broken-holy-symbol",
        "burial-coin",
        "copper-ring"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [1, 1],
        good: [1, 2],
        excellent: [1, 2],
        exceptional: [2, 2]
      },
      chanceByQuality: {
        poor: 0.35,
        standard: 0.55,
        good: 0.75,
        excellent: 0.9,
        exceptional: 1
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "phylactery-notes",
        "spell-research-page",
        "lichdom-formula",
        "curse-tablet",
        "scribbled-note"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [1, 1],
        good: [1, 1],
        excellent: [1, 2],
        exceptional: [1, 2]
      },
      chanceByQuality: {
        poor: 0.25,
        standard: 0.45,
        good: 0.65,
        excellent: 0.85,
        exceptional: 1
      }
    }
  }
};
