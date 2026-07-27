export const orcProfile = {
  id: "orc",
  matchNames: ["orc", "orog", "orc war chief"],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  matchSubtypes: ["orc"],
  excludeNames: ["half-orc", "halforc"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "orc-tusk",
          quantityByQuality: {
            poor: [0, 1],
            standard: [1, 1],
            good: [1, 2],
            excellent: [1, 2],
            exceptional: [2, 2]
          },
          chanceByQuality: {
            poor: 0.6,
            standard: 0.85,
            good: 0.95,
            excellent: 1,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "orc-ear",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 2],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.4,
            standard: 0.65,
            good: 0.8,
            excellent: 0.9,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "orc-blood-vial",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.12,
            standard: 0.3,
            good: 0.45,
            excellent: 0.65,
            exceptional: 0.85
          }
        },
        {
          definitionId: "orc-heart",
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
        cp: { min: 4, max: 24, chance: 1 },
        sp: { min: 0, max: 8, chance: 0.9 },
        gp: { min: 0, max: 4, chance: 0.22 }
      },
      crScale: {
        cp: 3,
        sp: 1,
        gp: 0.5
      },
      qualityChanceBonus: {
        poor: -0.08,
        standard: 0,
        good: 0.05,
        excellent: 0.1,
        exceptional: 0.15
      }
    },

    equipment: {
      type: "equipment",
      chances: {
        weapon: 0.8,
        armor: 0.45,
        shield: 0.35,
        consumable: 1,
        tool: 0.2,
        container: 0.15,
        other: 0.25
      },
      maxDrops: 4,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.4, worn: 0.4, standard: 0.2, fine: 0, masterwork: 0 },
        standard: { broken: 0.15, worn: 0.35, standard: 0.4, fine: 0.1, masterwork: 0 },
        good: { broken: 0.05, worn: 0.2, standard: 0.5, fine: 0.22, masterwork: 0.03 },
        excellent: { broken: 0.02, worn: 0.12, standard: 0.4, fine: 0.35, masterwork: 0.11 },
        exceptional: { broken: 0, worn: 0.08, standard: 0.3, fine: 0.4, masterwork: 0.22 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "war-paint-pot",
        "gnawed-bone",
        "rusty-nail-pouch",
        "dirty-rag",
        "broken-pipe",
        "empty-bottle",
        "old-boot",
        "cracked-mug"
      ],
      countByQuality: {
        poor: [1, 2],
        standard: [1, 2],
        good: [1, 3],
        excellent: [2, 3],
        exceptional: [2, 3]
      },
      chanceByQuality: {
        poor: 0.85,
        standard: 0.9,
        good: 0.95,
        excellent: 1,
        exceptional: 1
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "iron-nose-ring",
        "crude-totem",
        "tusk-pendant",
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
        poor: 0.1,
        standard: 0.18,
        good: 0.28,
        excellent: 0.4,
        exceptional: 0.55
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "orc-war-orders",
        "raid-map",
        "clan-marking",
        "blood-oath-scrap",
        "wanted-poster",
        "scribbled-note"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [0, 1],
        excellent: [0, 1],
        exceptional: [0, 1]
      },
      chanceByQuality: {
        poor: 0.05,
        standard: 0.09,
        good: 0.15,
        excellent: 0.22,
        exceptional: 0.35
      }
    }
  }
};
