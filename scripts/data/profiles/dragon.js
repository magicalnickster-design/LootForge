/**
 * Dragon — multi-pool profile for true dragons (chromatic / metallic / etc.).
 *
 * Quantities scale by age category via `lootScale` (wyrmling/young smaller,
 * adult/ancient larger). Equipment comes from the NPC inventory when present.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const dragonProfile = {
  id: "dragon",
  matchNames: ["dragon"],
  matchWholeWords: true,
  matchTypes: ["dragon"],
  matchSubtypes: ["dragon"],
  excludeNames: ["ancient red dragon", "dragonborn", "half-dragon", "pseudodragon"],
  lootScale: {
    // Age category from the creature name (5e MM forms).
    nameTokens: {
      wyrmling: 0.45,
      young: 0.75,
      adult: 1.35,
      ancient: 1.85
    },
    // Fallback when the name has no age word (custom dragons, dragon turtles, etc.).
    bySize: {
      tiny: 0.35,
      sm: 0.5,
      med: 0.65,
      lg: 1.0,
      huge: 1.4,
      grg: 1.85
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "dragon-scale",
          quantityByQuality: {
            poor: [1, 2],
            standard: [2, 4],
            good: [3, 5],
            excellent: [4, 7],
            exceptional: [5, 9]
          },
          chanceByQuality: {
            poor: 0.75,
            standard: 0.9,
            good: 1,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "dragon-fang",
          quantityByQuality: {
            poor: [1, 2],
            standard: [1, 3],
            good: [2, 4],
            excellent: [2, 5],
            exceptional: [3, 6]
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
          definitionId: "dragon-claw",
          quantityByQuality: {
            poor: [0, 2],
            standard: [1, 3],
            good: [2, 4],
            excellent: [2, 5],
            exceptional: [3, 6]
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
          definitionId: "dragon-blood-vial",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 2],
            excellent: [1, 2],
            exceptional: [2, 3]
          },
          chanceByQuality: {
            poor: 0.25,
            standard: 0.45,
            good: 0.65,
            excellent: 0.85,
            exceptional: 1
          }
        },
        {
          definitionId: "dragon-hide",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.1,
            standard: 0.3,
            good: 0.55,
            excellent: 0.75,
            exceptional: 0.95
          }
        },
        {
          definitionId: "dragon-horn",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.15,
            standard: 0.3,
            good: 0.45,
            excellent: 0.65,
            exceptional: 0.85
          }
        },
        {
          definitionId: "dragon-heart",
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
      // Hoard scraps on the body / nest — CR and lootScale push ancient hoards up hard.
      denominations: {
        cp: { min: 0, max: 40, chance: 0.55 },
        sp: { min: 2, max: 30, chance: 0.9 },
        gp: { min: 1, max: 40, chance: 0.95 },
        pp: { min: 0, max: 12, chance: 0.35 }
      },
      crScale: {
        cp: 2,
        sp: 1.5,
        gp: 3,
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
      // Hoard gear the DM put on the dragon's sheet, if any.
      chances: {
        weapon: 0.7,
        armor: 0.55,
        shield: 0.35,
        consumable: 0.85,
        tool: 0.35,
        container: 0.45,
        other: 0.55
      },
      maxDrops: 5,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.25, worn: 0.35, standard: 0.3, fine: 0.1, masterwork: 0 },
        standard: { broken: 0.1, worn: 0.25, standard: 0.4, fine: 0.2, masterwork: 0.05 },
        good: { broken: 0.05, worn: 0.15, standard: 0.35, fine: 0.35, masterwork: 0.1 },
        excellent: { broken: 0.02, worn: 0.1, standard: 0.28, fine: 0.4, masterwork: 0.2 },
        exceptional: { broken: 0, worn: 0.05, standard: 0.2, fine: 0.4, masterwork: 0.35 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "scorched-bone",
        "cracked-scale-shard",
        "sulfur-lump",
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
        "polished-dragon-scale",
        "dragon-tooth-pendant",
        "hoard-gem-chip",
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
        "hoard-ledger",
        "territorial-claim",
        "rival-challenge",
        "scorched-map",
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
        good: 0.2,
        excellent: 0.32,
        exceptional: 0.48
      }
    }
  }
};
