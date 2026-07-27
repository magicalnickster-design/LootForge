export const monstrosityProfile = {
  id: "monstrosity",
  matchNames: [
    "purple worm",
    "owlbear",
    "basilisk",
    "cockatrice",
    "chimera",
    "griffon",
    "griffin",
    "manticore",
    "hydra",
    "bulette",
    "ankheg",
    "mimic",
    "roper",
    "monstrosity"
  ],
  matchWholeWords: true,
  matchTypes: ["monstrosity"],
  matchSubtypes: ["monstrosity"],
  lootScale: {
    nameTokens: {
      "purple worm": 1.9,
      cockatrice: 0.4,
      ankheg: 0.65,
      griffon: 0.7,
      griffin: 0.7,
      mimic: 0.7,
      owlbear: 0.8,
      basilisk: 0.85,
      manticore: 0.95,
      roper: 1.05,
      bulette: 1.15,
      chimera: 1.3,
      hydra: 1.5,
      monstrosity: 1
    },
    bySize: {
      tiny: 0.35,
      sm: 0.55,
      med: 0.85,
      lg: 1.15,
      huge: 1.55,
      grg: 1.9
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "monstrosity-hide",
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
          definitionId: "monstrosity-fang",
          quantityByQuality: {
            poor: [0, 1],
            standard: [1, 1],
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
          },
          guaranteedFallback: true
        },
        {
          definitionId: "owlbear-feather",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 4]
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
          definitionId: "owlbear-claw",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.25,
            excellent: 0.38,
            exceptional: 0.5
          }
        },
        {
          definitionId: "basilisk-scale",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.25,
            excellent: 0.38,
            exceptional: 0.5
          }
        },
        {
          definitionId: "basilisk-eye",
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
        },
        {
          definitionId: "cockatrice-feather",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
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
          definitionId: "chimera-horn",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.04,
            standard: 0.1,
            good: 0.2,
            excellent: 0.35,
            exceptional: 0.5
          }
        },
        {
          definitionId: "griffon-feather",
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
            excellent: 0.38,
            exceptional: 0.5
          }
        },
        {
          definitionId: "manticore-spike",
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
            good: 0.28,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "hydra-tooth",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.04,
            standard: 0.1,
            good: 0.2,
            excellent: 0.35,
            exceptional: 0.5
          }
        },
        {
          definitionId: "bulette-plate",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.04,
            standard: 0.1,
            good: 0.2,
            excellent: 0.35,
            exceptional: 0.5
          }
        },
        {
          definitionId: "ankheg-chitin",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.25,
            excellent: 0.38,
            exceptional: 0.5
          }
        },
        {
          definitionId: "ankheg-acid-sac",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
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
          definitionId: "purple-worm-tooth",
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
        },
        {
          definitionId: "mimic-adhesive",
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
            excellent: 0.38,
            exceptional: 0.5
          }
        },
        {
          definitionId: "roper-tendril",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.25,
            excellent: 0.38,
            exceptional: 0.5
          }
        }
      ]
    },

    currency: {
      type: "currency",
      denominations: {
        cp: { min: 0, max: 12, chance: 0.35 },
        sp: { min: 0, max: 10, chance: 0.55 },
        gp: { min: 0, max: 18, chance: 0.7 },
        pp: { min: 0, max: 4, chance: 0.15 }
      },
      crScale: {
        cp: 1,
        sp: 1.1,
        gp: 2.2,
        pp: 0.55
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
        weapon: 0.55,
        armor: 0.35,
        shield: 0.2,
        consumable: 0.5,
        tool: 0.2,
        container: 0.35,
        other: 0.45
      },
      maxDrops: 3,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.3, worn: 0.35, standard: 0.3, fine: 0.05, masterwork: 0 },
        standard: { broken: 0.15, worn: 0.3, standard: 0.4, fine: 0.12, masterwork: 0.03 },
        good: { broken: 0.08, worn: 0.2, standard: 0.4, fine: 0.25, masterwork: 0.07 },
        excellent: { broken: 0.03, worn: 0.12, standard: 0.35, fine: 0.35, masterwork: 0.15 },
        exceptional: { broken: 0.01, worn: 0.08, standard: 0.28, fine: 0.38, masterwork: 0.25 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "shed-scale",
        "sticky-residue",
        "dug-up-pebble",
        "gnawed-bone",
        "ash-clump",
        "old-boot",
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
        "petrified-chip",
        "nest-egg-shard",
        "copper-ring",
        "bone-necklace",
        "fang-charm"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [1, 1],
        excellent: [1, 2],
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

    story: {
      type: "poolPick",
      definitionIds: [
        "hunter-warning",
        "nest-map-scrap",
        "worm-tunnel-chart",
        "scribbled-note",
        "crude-map"
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
