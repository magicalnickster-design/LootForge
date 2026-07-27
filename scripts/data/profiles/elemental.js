/**
 * Elemental — multi-pool profile for fire/water/earth/air elementals and myrmidons.
 *
 * Quantities scale by form via `lootScale` (base elementals mid, myrmidons higher).
 * Equipment comes from the NPC inventory when present (common on myrmidons).
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const elementalProfile = {
  id: "elemental",
  matchNames: [
    "fire elemental myrmidon",
    "water elemental myrmidon",
    "earth elemental myrmidon",
    "air elemental myrmidon",
    "elemental myrmidon",
    "fire myrmidon",
    "water myrmidon",
    "earth myrmidon",
    "air myrmidon",
    "myrmidon",
    "fire elemental",
    "water elemental",
    "earth elemental",
    "air elemental",
    "elemental"
  ],
  matchWholeWords: true,
  matchTypes: ["elemental"],
  matchSubtypes: ["elemental", "fire", "water", "earth", "air"],
  lootScale: {
    // Longest token wins (see resolveLootScale).
    nameTokens: {
      "fire elemental myrmidon": 1.35,
      "water elemental myrmidon": 1.35,
      "earth elemental myrmidon": 1.35,
      "air elemental myrmidon": 1.35,
      "elemental myrmidon": 1.3,
      "fire myrmidon": 1.3,
      "water myrmidon": 1.3,
      "earth myrmidon": 1.3,
      "air myrmidon": 1.3,
      myrmidon: 1.25,
      "fire elemental": 1,
      "water elemental": 1,
      "earth elemental": 1,
      "air elemental": 1,
      elemental: 1
    },
    bySize: {
      sm: 0.7,
      med: 0.9,
      lg: 1.1,
      huge: 1.35,
      grg: 1.6
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "elemental-essence",
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
          definitionId: "fire-ember-core",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
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
          definitionId: "water-brine-pearl",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
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
          definitionId: "earth-living-stone",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
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
          definitionId: "air-wind-whorl",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
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
          definitionId: "scorched-cinder",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 3]
          },
          chanceByQuality: {
            poor: 0.15,
            standard: 0.25,
            good: 0.35,
            excellent: 0.45,
            exceptional: 0.6
          }
        },
        {
          definitionId: "tidal-foam-vial",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.12,
            standard: 0.22,
            good: 0.32,
            excellent: 0.42,
            exceptional: 0.55
          }
        },
        {
          definitionId: "gravel-cluster",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 3]
          },
          chanceByQuality: {
            poor: 0.15,
            standard: 0.25,
            good: 0.35,
            excellent: 0.45,
            exceptional: 0.6
          }
        },
        {
          definitionId: "gust-ribbon",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.12,
            standard: 0.22,
            good: 0.32,
            excellent: 0.42,
            exceptional: 0.55
          }
        },
        {
          definitionId: "myrmidon-plate",
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
            good: 0.25,
            excellent: 0.4,
            exceptional: 0.6
          }
        }
      ]
    },

    currency: {
      type: "currency",
      // Elementals rarely carry coin; myrmidons / conjured servants may.
      denominations: {
        cp: { min: 0, max: 8, chance: 0.2 },
        sp: { min: 0, max: 10, chance: 0.35 },
        gp: { min: 0, max: 12, chance: 0.45 },
        pp: { min: 0, max: 2, chance: 0.08 }
      },
      crScale: {
        cp: 0.5,
        sp: 0.75,
        gp: 1.25,
        pp: 0.3
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
      // Myrmidons often have weapons/armor on the sheet; wild elementals rarely do.
      chances: {
        weapon: 0.7,
        armor: 0.55,
        shield: 0.25,
        consumable: 0.35,
        tool: 0.15,
        container: 0.2,
        other: 0.3
      },
      maxDrops: 3,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.15, worn: 0.3, standard: 0.4, fine: 0.12, masterwork: 0.03 },
        standard: { broken: 0.06, worn: 0.2, standard: 0.4, fine: 0.26, masterwork: 0.08 },
        good: { broken: 0.02, worn: 0.12, standard: 0.35, fine: 0.35, masterwork: 0.16 },
        excellent: { broken: 0.01, worn: 0.06, standard: 0.25, fine: 0.4, masterwork: 0.28 },
        exceptional: { broken: 0, worn: 0.04, standard: 0.18, fine: 0.38, masterwork: 0.4 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "cooled-slag-lump",
        "puddle-residue",
        "cracked-dirt-clod",
        "spent-breeze",
        "ash-clump",
        "sulfur-lump",
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
        "bound-element-sigil",
        "planar-ash-charm",
        "storm-glass-bead",
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
        "summoning-circle-scrap",
        "elemental-binding-note",
        "planar-rift-map",
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
