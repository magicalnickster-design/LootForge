/**
 * Aberration — multi-pool profile for mind flayers, beholders, aboleths,
 * intellect devourers, carrion crawlers, chuuls, gibbering mouthers, and kin.
 *
 * Quantities scale by creature name via `lootScale` (devourer/mouther smaller,
 * beholder / death tyrant / aboleth larger). Equipment from the sheet when present.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const aberrationProfile = {
  id: "aberration",
  matchNames: [
    "death tyrant",
    "mind flayer",
    "illithid",
    "intellect devourer",
    "carrion crawler",
    "gibbering mouther",
    "beholder",
    "aboleth",
    "chuul",
    "aberration"
  ],
  matchWholeWords: true,
  matchTypes: ["aberration"],
  matchSubtypes: ["aberration"],
  lootScale: {
    // Longest token wins (see resolveLootScale).
    nameTokens: {
      "death tyrant": 1.65,
      "intellect devourer": 0.55,
      "carrion crawler": 0.65,
      "gibbering mouther": 0.6,
      "mind flayer": 1.15,
      illithid: 1.15,
      beholder: 1.55,
      aboleth: 1.45,
      chuul: 0.9,
      aberration: 1
    },
    bySize: {
      tiny: 0.45,
      sm: 0.6,
      med: 0.9,
      lg: 1.2,
      huge: 1.5,
      grg: 1.75
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "aberration-ichor",
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
          definitionId: "tentacle-scrap",
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
          definitionId: "illithid-tentacle",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.06,
            standard: 0.14,
            good: 0.25,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "elder-brain-matter",
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
            standard: 0.02,
            good: 0.06,
            excellent: 0.14,
            exceptional: 0.28
          }
        },
        {
          definitionId: "intellect-brain",
          quantityByQuality: {
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
            exceptional: 0.5
          }
        },
        {
          definitionId: "beholder-eyestalk",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
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
          definitionId: "central-eye-lens",
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
          definitionId: "death-tyrant-tooth",
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
          definitionId: "aboleth-mucus",
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
            excellent: 0.38,
            exceptional: 0.55
          }
        },
        {
          definitionId: "aboleth-tentacle",
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
          definitionId: "crawler-tentacle",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 4]
          },
          chanceByQuality: {
            poor: 0.1,
            standard: 0.2,
            good: 0.32,
            excellent: 0.45,
            exceptional: 0.6
          }
        },
        {
          definitionId: "chuul-pincer",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.28,
            excellent: 0.42,
            exceptional: 0.55
          }
        },
        {
          definitionId: "gibbering-flesh",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.1,
            standard: 0.2,
            good: 0.32,
            excellent: 0.45,
            exceptional: 0.6
          }
        }
      ]
    },

    currency: {
      type: "currency",
      // Colonies and lairs keep trophies/coin; wild crawlers less so.
      denominations: {
        cp: { min: 0, max: 10, chance: 0.25 },
        sp: { min: 0, max: 14, chance: 0.55 },
        gp: { min: 1, max: 22, chance: 0.75 },
        pp: { min: 0, max: 6, chance: 0.2 }
      },
      crScale: {
        cp: 0.75,
        sp: 1.1,
        gp: 2.2,
        pp: 0.65
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
      // Thrall gear / lair trophies on the sheet when present.
      chances: {
        weapon: 0.55,
        armor: 0.35,
        shield: 0.15,
        consumable: 0.55,
        tool: 0.2,
        container: 0.3,
        other: 0.4
      },
      maxDrops: 3,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.25, worn: 0.35, standard: 0.3, fine: 0.1, masterwork: 0 },
        standard: { broken: 0.1, worn: 0.25, standard: 0.4, fine: 0.2, masterwork: 0.05 },
        good: { broken: 0.05, worn: 0.15, standard: 0.35, fine: 0.35, masterwork: 0.1 },
        excellent: { broken: 0.02, worn: 0.08, standard: 0.28, fine: 0.4, masterwork: 0.22 },
        exceptional: { broken: 0, worn: 0.05, standard: 0.2, fine: 0.4, masterwork: 0.35 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "slime-residue",
        "chitin-flake",
        "broken-thrall-collar",
        "dirty-rag",
        "empty-bottle",
        "gnawed-bone",
        "ash-clump"
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
        "psionic-crystal",
        "eye-amulet",
        "copper-ring",
        "bone-necklace",
        "obsidian-focus"
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
        "colony-orders",
        "underdark-chart",
        "memory-fragment",
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
        poor: 0.08,
        standard: 0.15,
        good: 0.25,
        excellent: 0.4,
        exceptional: 0.55
      }
    }
  }
};
