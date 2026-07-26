/**
 * Spider — beast/monstrosity multi-pool profile.
 *
 * Harvestable parts stay LootForge customs. Any gear on the NPC sheet
 * (victim loot stuffed into inventory) can drop via the equipment pool.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const spiderProfile = {
  id: "spider",
  matchNames: ["spider"],
  matchWholeWords: true,
  matchTypes: ["beast", "monstrosity"],
  matchSubtypes: ["spider"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "spider-silk",
          quantityByQuality: {
            poor: [0, 1],
            standard: [1, 2],
            good: [1, 3],
            excellent: [2, 3],
            exceptional: [2, 4]
          },
          chanceByQuality: {
            poor: 0.65,
            standard: 0.85,
            good: 0.95,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "spider-fang",
          quantityByQuality: {
            poor: [1, 2],
            standard: [1, 2],
            good: [2, 3],
            excellent: [2, 4],
            exceptional: [3, 4]
          },
          chanceByQuality: {
            poor: 0.8,
            standard: 1,
            good: 1,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "spider-venom-gland",
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
          definitionId: "spider-eye",
          quantityByQuality: {
            poor: [0, 2],
            standard: [1, 3],
            good: [2, 4],
            excellent: [2, 5],
            exceptional: [3, 6]
          },
          chanceByQuality: {
            poor: 0.45,
            standard: 0.65,
            good: 0.8,
            excellent: 0.9,
            exceptional: 1
          }
        },
        {
          definitionId: "spider-chitin",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 2],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.25,
            standard: 0.4,
            good: 0.55,
            excellent: 0.7,
            exceptional: 0.85
          }
        },
        {
          definitionId: "spinneret",
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
      // Coins snagged in webbing — uncommon, not pocket change.
      denominations: {
        cp: { min: 0, max: 14, chance: 0.4 },
        sp: { min: 0, max: 5, chance: 0.22 },
        gp: { min: 0, max: 2, chance: 0.06 }
      },
      crScale: {
        cp: 2,
        sp: 0.5,
        gp: 0.25
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
      // Victim gear the DM put on the spider's sheet, if any.
      chances: {
        weapon: 0.55,
        armor: 0.35,
        shield: 0.25,
        consumable: 0.75,
        tool: 0.3,
        container: 0.35,
        other: 0.45
      },
      maxDrops: 3,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.55, worn: 0.35, standard: 0.1, fine: 0, masterwork: 0 },
        standard: { broken: 0.3, worn: 0.4, standard: 0.25, fine: 0.05, masterwork: 0 },
        good: { broken: 0.15, worn: 0.35, standard: 0.35, fine: 0.13, masterwork: 0.02 },
        excellent: { broken: 0.08, worn: 0.25, standard: 0.4, fine: 0.22, masterwork: 0.05 },
        exceptional: { broken: 0.04, worn: 0.18, standard: 0.4, fine: 0.28, masterwork: 0.1 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "sticky-web-clump",
        "empty-cocoon",
        "brittle-leg-segment",
        "dirty-rag",
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
        poor: 0.8,
        standard: 0.88,
        good: 0.94,
        excellent: 1,
        exceptional: 1
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "web-wrapped-coin",
        "iridescent-chitin-shard",
        "fang-charm",
        "bone-necklace",
        "copper-ring"
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
        standard: 0.14,
        good: 0.22,
        excellent: 0.34,
        exceptional: 0.48
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "cocooned-journal",
        "prey-keepsake",
        "webbing-scrawl",
        "scribbled-note",
        "wanted-poster"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [0, 1],
        excellent: [0, 1],
        exceptional: [0, 1]
      },
      chanceByQuality: {
        poor: 0.04,
        standard: 0.08,
        good: 0.14,
        excellent: 0.22,
        exceptional: 0.32
      }
    }
  }
};
