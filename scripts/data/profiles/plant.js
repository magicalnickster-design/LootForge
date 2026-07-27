/**
 * Plant — multi-pool profile for blights, myconids, shambling mounds, and treants.
 *
 * Quantities scale by form via `lootScale` (twig blight smaller, treant larger).
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const plantProfile = {
  id: "plant",
  matchNames: [
    "shambling mound",
    "vine blight",
    "needle blight",
    "twig blight",
    "treant",
    "myconid",
    "blight",
    "plant"
  ],
  matchWholeWords: true,
  matchTypes: ["plant"],
  matchSubtypes: ["plant", "blight", "myconid"],
  excludeNames: ["eggplant", "houseplant", "planter"],
  lootScale: {
    // Longest token wins (see resolveLootScale).
    nameTokens: {
      "shambling mound": 1.35,
      "vine blight": 0.7,
      "needle blight": 0.55,
      "twig blight": 0.35,
      treant: 1.7,
      myconid: 0.75,
      blight: 0.5,
      plant: 1
    },
    bySize: {
      tiny: 0.35,
      sm: 0.5,
      med: 0.85,
      lg: 1.2,
      huge: 1.55,
      grg: 1.8
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "plant-fiber",
          quantityByQuality: {
            poor: [1, 1],
            standard: [1, 2],
            good: [1, 2],
            excellent: [2, 3],
            exceptional: [2, 4]
          },
          chanceByQuality: {
            poor: 0.7,
            standard: 0.9,
            good: 1,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "living-sap-vial",
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
          definitionId: "twig-blight-twig",
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
            good: 0.28,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "needle-blight-needle",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
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
          definitionId: "vine-blight-tendril",
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
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "myconid-spore-sac",
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
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "shambling-vine-mass",
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
          definitionId: "treant-bark-plate",
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
          definitionId: "heartwood-core",
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
      // Plants rarely carry coin; victims / grove offerings may.
      denominations: {
        cp: { min: 0, max: 10, chance: 0.25 },
        sp: { min: 0, max: 8, chance: 0.35 },
        gp: { min: 0, max: 12, chance: 0.4 },
        pp: { min: 0, max: 2, chance: 0.06 }
      },
      crScale: {
        cp: 0.5,
        sp: 0.75,
        gp: 1.5,
        pp: 0.35
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
      // Occasional victim gear tangled in vines / roots.
      chances: {
        weapon: 0.45,
        armor: 0.25,
        shield: 0.15,
        consumable: 0.35,
        tool: 0.2,
        container: 0.3,
        other: 0.4
      },
      maxDrops: 3,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.4, worn: 0.35, standard: 0.22, fine: 0.03, masterwork: 0 },
        standard: { broken: 0.25, worn: 0.35, standard: 0.3, fine: 0.08, masterwork: 0.02 },
        good: { broken: 0.12, worn: 0.28, standard: 0.38, fine: 0.18, masterwork: 0.04 },
        excellent: { broken: 0.06, worn: 0.18, standard: 0.36, fine: 0.3, masterwork: 0.1 },
        exceptional: { broken: 0.02, worn: 0.1, standard: 0.3, fine: 0.4, masterwork: 0.18 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "dry-leaf-clump",
        "thorn-cluster",
        "moldy-root",
        "spore-dust-pouch",
        "dirty-rag",
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
        poor: 0.75,
        standard: 0.85,
        good: 0.92,
        excellent: 0.97,
        exceptional: 1
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "blossom-charm",
        "amber-sap-bead",
        "fungal-lantern-cap",
        "copper-ring",
        "decorative-feather"
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
        "grove-warning-scrap",
        "blight-circle-map",
        "treant-oath-bark",
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
        poor: 0.06,
        standard: 0.12,
        good: 0.22,
        excellent: 0.35,
        exceptional: 0.5
      }
    }
  }
};
