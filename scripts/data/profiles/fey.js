/**
 * Fey — multi-pool profile for pixies, dryads, satyrs, redcaps, and hags.
 *
 * Quantities scale by creature name via `lootScale` (pixie/satyr smaller,
 * night hag larger). Equipment comes from the NPC inventory when present.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const feyProfile = {
  id: "fey",
  matchNames: [
    "night hag",
    "green hag",
    "sea hag",
    "redcap",
    "pixie",
    "dryad",
    "satyr",
    "hag",
    "fey"
  ],
  matchWholeWords: true,
  matchTypes: ["fey"],
  matchSubtypes: ["fey", "hag"],
  lootScale: {
    // Longest token wins (see resolveLootScale).
    nameTokens: {
      "night hag": 1.4,
      "green hag": 1.1,
      "sea hag": 1.05,
      redcap: 0.95,
      dryad: 0.75,
      satyr: 0.55,
      pixie: 0.4,
      hag: 1.15,
      fey: 1
    },
    bySize: {
      tiny: 0.4,
      sm: 0.65,
      med: 1,
      lg: 1.25,
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
          definitionId: "fey-dust",
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
          definitionId: "fey-blood-vial",
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
          definitionId: "pixie-wing",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.12,
            standard: 0.2,
            good: 0.3,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "dryad-bark",
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
          definitionId: "satyr-horn",
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
          definitionId: "redcap-tooth",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 3]
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
          definitionId: "hag-hair",
          quantityByQuality: {
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
        {
          definitionId: "hag-eye",
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
        cp: { min: 0, max: 16, chance: 0.45 },
        sp: { min: 1, max: 14, chance: 0.85 },
        gp: { min: 0, max: 12, chance: 0.55 },
        pp: { min: 0, max: 3, chance: 0.12 }
      },
      crScale: {
        cp: 1,
        sp: 1.2,
        gp: 1.75,
        pp: 0.4
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
        armor: 0.25,
        shield: 0.15,
        consumable: 0.7,
        tool: 0.25,
        container: 0.3,
        other: 0.45
      },
      maxDrops: 3,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.2, worn: 0.35, standard: 0.35, fine: 0.1, masterwork: 0 },
        standard: { broken: 0.08, worn: 0.25, standard: 0.4, fine: 0.22, masterwork: 0.05 },
        good: { broken: 0.03, worn: 0.15, standard: 0.35, fine: 0.35, masterwork: 0.12 },
        excellent: { broken: 0.01, worn: 0.08, standard: 0.28, fine: 0.4, masterwork: 0.23 },
        exceptional: { broken: 0, worn: 0.05, standard: 0.2, fine: 0.4, masterwork: 0.35 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "wilted-petal",
        "tangled-vine",
        "torn-ribbon",
        "bloodstained-cap",
        "dirty-rag",
        "empty-bottle",
        "decorative-feather"
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
        "fairy-ring-mushroom",
        "moonbeam-crystal",
        "iron-nail-ward",
        "hag-eye-amulet",
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
        poor: 0.14,
        standard: 0.25,
        good: 0.38,
        excellent: 0.52,
        exceptional: 0.7
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "fey-bargain-scrap",
        "court-invitation",
        "hag-coven-note",
        "stolen-name-list",
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
        standard: 0.16,
        good: 0.26,
        excellent: 0.4,
        exceptional: 0.55
      }
    }
  }
};
