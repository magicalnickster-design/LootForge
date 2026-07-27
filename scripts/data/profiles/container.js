export const containerProfile = {
  id: "container",
  matchNames: [],
  matchTypes: [],
  pools: {
    currency: {
      type: "currency",
      denominations: {
        cp: { min: 4, max: 30, chance: 1 },
        sp: { min: 0, max: 12, chance: 0.9 },
        gp: { min: 0, max: 6, chance: 0.45 },
        pp: { min: 0, max: 1, chance: 0.05 }
      },
      crScale: {
        cp: 2,
        sp: 1,
        gp: 0.75,
        pp: 0.1
      },
      qualityChanceBonus: {
        poor: -0.05,
        standard: 0,
        good: 0.05,
        excellent: 0.1,
        exceptional: 0.15
      }
    },

    systemGear: {
      type: "systemItems",
      packKeys: ["dnd5e.equipment24", "dnd5e.items", "dnd5e.tradegoods"],
      itemTypes: ["weapon", "equipment", "consumable", "tool", "loot", "container"],
      countByQuality: {
        poor: [1, 2],
        standard: [1, 3],
        good: [2, 4],
        excellent: [2, 5],
        exceptional: [3, 6]
      },
      chanceByQuality: {
        poor: 0.9,
        standard: 1,
        good: 1,
        excellent: 1,
        exceptional: 1
      },
      rarityWeightsByRollQuality: {
        poor: {
          common: 0.97,
          uncommon: 0.03,
          rare: 0,
          veryRare: 0,
          legendary: 0
        },
        standard: {
          common: 0.9,
          uncommon: 0.09,
          rare: 0.01,
          veryRare: 0,
          legendary: 0
        },
        good: {
          common: 0.75,
          uncommon: 0.2,
          rare: 0.05,
          veryRare: 0,
          legendary: 0
        },
        excellent: {
          common: 0.55,
          uncommon: 0.3,
          rare: 0.12,
          veryRare: 0.03,
          legendary: 0
        },
        exceptional: {
          common: 0.35,
          uncommon: 0.35,
          rare: 0.22,
          veryRare: 0.07,
          legendary: 0.01
        }
      }
    },

    equipment: {
      type: "equipment",
      chances: {
        weapon: 0.85,
        armor: 0.55,
        shield: 0.55,
        consumable: 1,
        tool: 0.5,
        container: 0.35,
        other: 0.45
      },
      maxDrops: 4,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.15, worn: 0.35, standard: 0.4, fine: 0.1, masterwork: 0 },
        standard: { broken: 0.05, worn: 0.2, standard: 0.5, fine: 0.2, masterwork: 0.05 },
        good: { broken: 0, worn: 0.1, standard: 0.45, fine: 0.35, masterwork: 0.1 },
        excellent: { broken: 0, worn: 0.05, standard: 0.3, fine: 0.45, masterwork: 0.2 },
        exceptional: { broken: 0, worn: 0, standard: 0.2, fine: 0.45, masterwork: 0.35 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "bent-spoon",
        "dirty-rag",
        "broken-pipe",
        "empty-bottle",
        "dice",
        "cracked-mug",
        "old-boot"
      ],
      countByQuality: {
        poor: [0, 2],
        standard: [1, 2],
        good: [1, 3],
        excellent: [1, 3],
        exceptional: [2, 3]
      },
      chanceByQuality: {
        poor: 0.55,
        standard: 0.65,
        good: 0.7,
        excellent: 0.75,
        exceptional: 0.8
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "copper-ring",
        "bone-necklace",
        "lucky-rabbit-foot",
        "small-idol",
        "decorative-feather"
      ],
      countByQuality: {
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
        exceptional: 0.65
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "crude-map",
        "wanted-poster",
        "caravan-schedule",
        "bandit-orders",
        "scribbled-note",
        "goblin-journal"
      ],
      countByQuality: {
        poor: [0, 1],
        standard: [0, 1],
        good: [0, 1],
        excellent: [0, 1],
        exceptional: [1, 1]
      },
      chanceByQuality: {
        poor: 0.08,
        standard: 0.14,
        good: 0.22,
        excellent: 0.32,
        exceptional: 0.45
      }
    }
  }
};
