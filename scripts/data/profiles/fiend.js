export const fiendProfile = {
  id: "fiend",
  matchNames: [
    "pit fiend",
    "horned devil",
    "barbed devil",
    "bearded devil",
    "chain devil",
    "bone devil",
    "hell hound",
    "hellhound",
    "balor",
    "quasit",
    "imp",
    "devil",
    "demon",
    "fiend"
  ],
  matchWholeWords: true,
  matchTypes: ["fiend"],
  matchSubtypes: ["devil", "demon", "yugoloth"],
  excludeNames: ["demon lord", "demon prince", "demogorgon", "orcus", "graz'zt", "grazzt", "juiblex", "baphomet", "yeenoghu", "zuggtmoy"],
  lootScale: {
    nameTokens: {
      "pit fiend": 1.85,
      "horned devil": 1.45,
      "bone devil": 1.3,
      "chain devil": 1.2,
      "barbed devil": 1.1,
      "bearded devil": 0.9,
      "hell hound": 0.7,
      hellhound: 0.7,
      balor: 1.9,
      quasit: 0.4,
      imp: 0.4,
      devil: 1,
      demon: 1.05,
      fiend: 1
    },
    bySize: {
      tiny: 0.4,
      sm: 0.55,
      med: 1,
      lg: 1.3,
      huge: 1.65,
      grg: 1.9
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "fiend-ichor",
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
          definitionId: "fiend-horn",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 2],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.25,
            standard: 0.45,
            good: 0.65,
            excellent: 0.85,
            exceptional: 0.95
          }
        },
        {
          definitionId: "brimstone-chunk",
          quantityByQuality: {
            poor: [0, 1],
            standard: [1, 1],
            good: [1, 2],
            excellent: [1, 2],
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
          definitionId: "hellhound-fang",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 4]
          },
          chanceByQuality: {
            poor: 0.15,
            standard: 0.25,
            good: 0.35,
            excellent: 0.45,
            exceptional: 0.55
          }
        },
        {
          definitionId: "hellhound-hide",
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
            good: 0.28,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "imp-wing",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.1,
            standard: 0.18,
            good: 0.25,
            excellent: 0.35,
            exceptional: 0.45
          }
        },
        {
          definitionId: "quasit-claw",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.1,
            standard: 0.18,
            good: 0.25,
            excellent: 0.35,
            exceptional: 0.45
          }
        },
        {
          definitionId: "barbed-spine",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 4]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.25,
            excellent: 0.35,
            exceptional: 0.5
          }
        },
        {
          definitionId: "devil-chain-link",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.05,
            standard: 0.12,
            good: 0.22,
            excellent: 0.35,
            exceptional: 0.5
          }
        },
        {
          definitionId: "bone-spur",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.05,
            standard: 0.12,
            good: 0.22,
            excellent: 0.35,
            exceptional: 0.5
          }
        },
        {
          definitionId: "pit-fiend-scale",
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
          definitionId: "balor-ash",
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
            standard: 0.03,
            good: 0.08,
            excellent: 0.18,
            exceptional: 0.35
          }
        }
      ]
    },

    currency: {
      type: "currency",
      denominations: {
        cp: { min: 0, max: 20, chance: 0.4 },
        sp: { min: 0, max: 18, chance: 0.75 },
        gp: { min: 1, max: 25, chance: 0.9 },
        pp: { min: 0, max: 8, chance: 0.28 }
      },
      crScale: {
        cp: 1,
        sp: 1.25,
        gp: 2.5,
        pp: 0.85
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
        weapon: 0.75,
        armor: 0.45,
        shield: 0.25,
        consumable: 0.55,
        tool: 0.2,
        container: 0.25,
        other: 0.4
      },
      maxDrops: 4,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.2, worn: 0.35, standard: 0.35, fine: 0.1, masterwork: 0 },
        standard: { broken: 0.08, worn: 0.22, standard: 0.4, fine: 0.24, masterwork: 0.06 },
        good: { broken: 0.03, worn: 0.12, standard: 0.35, fine: 0.35, masterwork: 0.15 },
        excellent: { broken: 0.01, worn: 0.06, standard: 0.25, fine: 0.4, masterwork: 0.28 },
        exceptional: { broken: 0, worn: 0.04, standard: 0.18, fine: 0.38, masterwork: 0.4 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "scorched-scrap",
        "melted-coin",
        "sulfur-stained-cloth",
        "sulfur-lump",
        "ash-clump",
        "scorched-bone",
        "empty-bottle"
      ],
      countByQuality: {
        poor: [1, 2],
        standard: [1, 2],
        good: [1, 3],
        excellent: [2, 3],
        exceptional: [2, 4]
      },
      chanceByQuality: {
        poor: 0.65,
        standard: 0.78,
        good: 0.88,
        excellent: 0.95,
        exceptional: 1
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "soul-coin-chip",
        "brimstone-charm",
        "infernal-seal",
        "abyssal-rune-shard",
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
        "infernal-contract",
        "blood-war-orders",
        "cultist-summons",
        "soul-ledger",
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
