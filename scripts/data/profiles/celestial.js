export const celestialProfile = {
  id: "celestial",
  matchNames: [
    "planetar",
    "solar",
    "couatl",
    "unicorn",
    "pegasus",
    "celestial",
    "angel"
  ],
  matchWholeWords: true,
  matchTypes: ["celestial"],
  matchSubtypes: ["celestial", "angel"],
  excludeNames: ["dragon", "eclipse", "panel", "flare", "system"],
  lootScale: {
    nameTokens: {
      planetar: 1.55,
      solar: 1.9,
      couatl: 1.05,
      unicorn: 0.85,
      pegasus: 0.55,
      angel: 1.3,
      celestial: 1
    },
    bySize: {
      tiny: 0.4,
      sm: 0.55,
      med: 0.9,
      lg: 1.25,
      huge: 1.6,
      grg: 1.85
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "celestial-feather",
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
          definitionId: "radiant-essence-vial",
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
          definitionId: "angelic-blood-vial",
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
            good: 0.5,
            excellent: 0.7,
            exceptional: 0.85
          }
        },
        {
          definitionId: "pegasus-feather",
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
          definitionId: "unicorn-horn-shard",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
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
          definitionId: "couatl-scale",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 2],
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
          definitionId: "planetar-plume",
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
          definitionId: "solar-wing-feather",
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
          definitionId: "solar-halo-shard",
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
            excellent: 0.2,
            exceptional: 0.38
          }
        }
      ]
    },

    currency: {
      type: "currency",
      denominations: {
        cp: { min: 0, max: 6, chance: 0.15 },
        sp: { min: 0, max: 12, chance: 0.35 },
        gp: { min: 0, max: 40, chance: 0.7 },
        pp: { min: 0, max: 12, chance: 0.35 }
      },
      crScale: {
        cp: 0.3,
        sp: 0.8,
        gp: 2.2,
        pp: 1.1
      },
      qualityChanceBonus: {
        poor: -0.05,
        standard: 0,
        good: 0.05,
        excellent: 0.12,
        exceptional: 0.2
      }
    },

    equipment: {
      type: "equipment",
      chances: {
        weapon: 0.7,
        armor: 0.55,
        shield: 0.25,
        consumable: 0.4,
        tool: 0.15,
        container: 0.2,
        other: 0.4
      },
      maxDrops: 4,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.1, worn: 0.25, standard: 0.4, fine: 0.2, masterwork: 0.05 },
        standard: { broken: 0.04, worn: 0.15, standard: 0.35, fine: 0.35, masterwork: 0.11 },
        good: { broken: 0.01, worn: 0.08, standard: 0.25, fine: 0.4, masterwork: 0.26 },
        excellent: { broken: 0, worn: 0.04, standard: 0.18, fine: 0.38, masterwork: 0.4 },
        exceptional: { broken: 0, worn: 0.02, standard: 0.1, fine: 0.35, masterwork: 0.53 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "shed-down-clump",
        "cracked-holy-charm",
        "faded-prayer-ribbon",
        "incense-ash-pouch",
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
        poor: 0.55,
        standard: 0.7,
        good: 0.8,
        excellent: 0.9,
        exceptional: 0.95
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "dawn-pearl",
        "celestial-sigil-seal",
        "silvered-holy-chip",
        "copper-ring",
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
        poor: 0.15,
        standard: 0.28,
        good: 0.42,
        excellent: 0.58,
        exceptional: 0.75
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "heavenly-mandate-scrap",
        "planar-gate-chart",
        "solar-edict-fragment",
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
        good: 0.28,
        excellent: 0.42,
        exceptional: 0.6
      }
    }
  }
};
