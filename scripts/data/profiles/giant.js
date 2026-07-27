/**
 * Giant — multi-pool profile for hill, stone, frost, fire, cloud, and storm giants.
 *
 * Quantities scale by giant type via `lootScale` (hill smaller, storm larger).
 * Equipment comes from the NPC inventory when present (bags, weapons, armor).
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const giantProfile = {
  id: "giant",
  matchNames: [
    "storm giant",
    "cloud giant",
    "fire giant",
    "frost giant",
    "stone giant",
    "hill giant",
    "giant"
  ],
  matchWholeWords: true,
  matchTypes: ["giant"],
  matchSubtypes: ["giant"],
  // Avoid matching "giant spider", "giant wolf spider", etc. via type alone —
  // those are beasts/monstrosities already handled by spider/monstrosity profiles.
  excludeNames: ["giant scorpion", "giant frog", "giant snake", "giant poisonous snake", "giant constrictor snake", "giant spider", "giant wolf", "giant rat", "giant eagle", "giant owl", "giant toad", "giant weasel", "giant crab", "giant crocodile", "giant constrictor", "giant centipede", "giant bat", "giant goat", "giant hyena", "giant lizard", "giant octopus", "giant seahorse", "giant shark", "giant vulture", "giant elk", "giant boar", "giant fire beetle", "giant poisonous", "giant badger"],
  lootScale: {
    // Longest token wins (see resolveLootScale).
    nameTokens: {
      "storm giant": 1.6,
      "cloud giant": 1.3,
      "fire giant": 1.2,
      "frost giant": 1.1,
      "stone giant": 1,
      "hill giant": 0.85,
      giant: 1
    },
    bySize: {
      med: 0.7,
      lg: 0.9,
      huge: 1.2,
      grg: 1.55
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "giant-tooth",
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
          definitionId: "giant-knuckle",
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
          definitionId: "giant-hair-lock",
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
          definitionId: "hill-giant-rock",
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
            excellent: 0.5,
            exceptional: 0.65
          }
        },
        {
          definitionId: "stone-giant-chip",
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
        },
        {
          definitionId: "frost-giant-ice",
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
        },
        {
          definitionId: "fire-giant-slag",
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
        },
        {
          definitionId: "cloud-giant-silk",
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
          definitionId: "storm-spark-stone",
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
      // Giants keep tribute and pouch-coin — richer than humanoids, CR-scaled.
      denominations: {
        cp: { min: 0, max: 30, chance: 0.55 },
        sp: { min: 2, max: 24, chance: 0.9 },
        gp: { min: 2, max: 35, chance: 0.95 },
        pp: { min: 0, max: 8, chance: 0.3 }
      },
      crScale: {
        cp: 1.5,
        sp: 1.5,
        gp: 2.5,
        pp: 0.75
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
      // Giants usually carry weapons/armor/bags on the sheet.
      chances: {
        weapon: 0.9,
        armor: 0.55,
        shield: 0.35,
        consumable: 0.55,
        tool: 0.3,
        container: 0.45,
        other: 0.5
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
        "giant-boot-scrap",
        "crushed-wagon-spoke",
        "greasy-sack-scrap",
        "cracked-boulder",
        "old-boot",
        "empty-bottle",
        "dirty-rag"
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
        "giant-thumb-ring",
        "boulder-charm",
        "rune-carved-pebble",
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
        "tribute-list",
        "giant-clan-mark",
        "storm-omen-note",
        "raiding-map",
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
        excellent: 0.4,
        exceptional: 0.55
      }
    }
  }
};
