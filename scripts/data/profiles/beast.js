/**
 * Beast — multi-pool profile for common MM beasts (boar, bear, great cats,
 * giant vermin/birds, crocodile, shark, etc.).
 *
 * Wolf and Spider stay on their dedicated profiles (matched first).
 * Dire Wolf continues to use the wolf profile.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const beastProfile = {
  id: "beast",
  matchNames: [
    "giant scorpion",
    "giant constrictor snake",
    "giant poisonous snake",
    "giant eagle",
    "giant owl",
    "giant frog",
    "giant rat",
    "giant shark",
    "hunter shark",
    "reef shark",
    "crocodile",
    "brown bear",
    "black bear",
    "polar bear",
    "panther",
    "lion",
    "tiger",
    "boar",
    "bear",
    "shark",
    "snake",
    "scorpion",
    "eagle",
    "owl",
    "frog",
    "rat"
  ],
  matchWholeWords: true,
  matchTypes: ["beast"],
  // Name-only (no subtype) so Wolf / Spider dedicated profiles are never stolen.
  excludeNames: [
    "spider",
    "wolf",
    "worg",
    "werewolf",
    "winter wolf",
    "owlbear",
    "displacer"
  ],
  lootScale: {
    // Longest token wins (see resolveLootScale).
    nameTokens: {
      "giant scorpion": 1.2,
      "giant constrictor snake": 1.15,
      "giant poisonous snake": 0.85,
      "giant shark": 1.35,
      "hunter shark": 1.15,
      "reef shark": 0.7,
      "giant eagle": 0.85,
      "giant owl": 0.75,
      "giant frog": 0.55,
      "giant rat": 0.4,
      "brown bear": 1.05,
      "polar bear": 1.1,
      "black bear": 0.85,
      crocodile: 0.9,
      panther: 0.75,
      tiger: 1.0,
      lion: 0.95,
      boar: 0.65,
      bear: 1.0,
      shark: 1.1,
      snake: 0.9,
      scorpion: 1.15,
      eagle: 0.7,
      owl: 0.65,
      frog: 0.5,
      rat: 0.35
    },
    bySize: {
      tiny: 0.35,
      sm: 0.5,
      med: 0.85,
      lg: 1.15,
      huge: 1.4,
      grg: 1.65
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "beast-hide",
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
          definitionId: "beast-fang",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 3]
          },
          chanceByQuality: {
            poor: 0.4,
            standard: 0.65,
            good: 0.85,
            excellent: 0.95,
            exceptional: 1
          }
        },
        {
          definitionId: "beast-claw",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 4]
          },
          chanceByQuality: {
            poor: 0.35,
            standard: 0.6,
            good: 0.8,
            excellent: 0.9,
            exceptional: 1
          }
        },
        {
          definitionId: "beast-meat",
          quantityByQuality: {
            poor: [0, 1],
            standard: [1, 1],
            good: [1, 2],
            excellent: [1, 2],
            exceptional: [2, 3]
          },
          chanceByQuality: {
            poor: 0.45,
            standard: 0.7,
            good: 0.85,
            excellent: 0.95,
            exceptional: 1
          }
        },
        {
          definitionId: "boar-tusk",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.28,
            excellent: 0.42,
            exceptional: 0.58
          }
        },
        {
          definitionId: "bear-claw",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 2],
            excellent: [1, 2],
            exceptional: [1, 3]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.28,
            excellent: 0.42,
            exceptional: 0.58
          }
        },
        {
          definitionId: "great-cat-fang",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 2],
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
          definitionId: "giant-rat-tail",
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
          definitionId: "scorpion-stinger",
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
          definitionId: "snake-skin-shed",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 2],
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
          definitionId: "frog-poison-sac",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [0, 1],
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
          definitionId: "giant-eagle-feather",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 3]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.28,
            excellent: 0.42,
            exceptional: 0.58
          }
        },
        {
          definitionId: "giant-owl-feather",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 2],
            good: [1, 2],
            excellent: [1, 3],
            exceptional: [2, 3]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.28,
            excellent: 0.42,
            exceptional: 0.58
          }
        },
        {
          definitionId: "crocodile-hide-scrap",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 2],
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
          definitionId: "shark-tooth",
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
            good: 0.35,
            excellent: 0.5,
            exceptional: 0.65
          }
        }
      ]
    },

    currency: {
      type: "currency",
      // Beasts rarely carry coin — occasional swallowed / nest scraps.
      denominations: {
        cp: { min: 0, max: 12, chance: 0.25 },
        sp: { min: 0, max: 6, chance: 0.15 },
        gp: { min: 0, max: 3, chance: 0.05 }
      },
      crScale: {
        cp: 0.5,
        sp: 0.35,
        gp: 0.2
      },
      qualityChanceBonus: {
        poor: -0.05,
        standard: 0,
        good: 0.05,
        excellent: 0.08,
        exceptional: 0.12
      }
    },

    equipment: {
      type: "equipment",
      // Occasional swallowed / nest victim gear from the sheet.
      chances: {
        weapon: 0.2,
        armor: 0.1,
        shield: 0.05,
        consumable: 0.15,
        tool: 0.1,
        container: 0.15,
        other: 0.2
      },
      maxDrops: 2,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.5, worn: 0.35, standard: 0.15, fine: 0, masterwork: 0 },
        standard: { broken: 0.35, worn: 0.4, standard: 0.22, fine: 0.03, masterwork: 0 },
        good: { broken: 0.2, worn: 0.35, standard: 0.35, fine: 0.1, masterwork: 0 },
        excellent: { broken: 0.1, worn: 0.25, standard: 0.4, fine: 0.2, masterwork: 0.05 },
        exceptional: { broken: 0.05, worn: 0.15, standard: 0.4, fine: 0.3, masterwork: 0.1 }
      }
    },

    junk: {
      type: "poolPick",
      definitionIds: [
        "bloody-fur-tuft",
        "cracked-claw-sheath",
        "nest-twig-bundle",
        "fishbone-cluster",
        "dirty-rag",
        "gnawed-bone",
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
        standard: 0.82,
        good: 0.9,
        excellent: 0.95,
        exceptional: 1
      }
    },

    trinkets: {
      type: "poolPick",
      definitionIds: [
        "polished-fang-charm",
        "beast-tooth-necklace",
        "fang-charm",
        "copper-ring",
        "lucky-rabbit-foot"
      ],
      countByQuality: {
        poor: [0, 1],
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
        exceptional: 0.6
      }
    },

    story: {
      type: "poolPick",
      definitionIds: [
        "hunter-trail-map",
        "beast-lair-scratching",
        "ranger-warning-scrap",
        "hunter-warning",
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
        poor: 0.05,
        standard: 0.1,
        good: 0.2,
        excellent: 0.32,
        exceptional: 0.48
      }
    }
  }
};
