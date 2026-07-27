/**
 * Generic Undead — fallback multi-pool profile for undead that lack a
 * dedicated name profile (wight, specter, ghast, ghost, vampire, etc.).
 *
 * Zombie / Skeleton / Mummy / Lich / Lich King stay more specific and are
 * matched first. Also used as the creature-type fallback for `undead`.
 */

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const genericUndeadProfile = {
  id: "generic-undead",
  matchNames: [
    "death knight",
    "poltergeist",
    "vampire",
    "banshee",
    "revenant",
    "specter",
    "spectre",
    "wight",
    "ghast",
    "ghost",
    "shadow",
    "undead"
  ],
  matchWholeWords: true,
  matchTypes: ["undead"],
  excludeNames: ["zombie", "skeleton", "mummy", "lich", "lich king"],
  lootScale: {
    nameTokens: {
      "death knight": 1.45,
      vampire: 1.35,
      banshee: 1.15,
      revenant: 1.1,
      wight: 0.95,
      specter: 0.75,
      spectre: 0.75,
      ghost: 0.7,
      poltergeist: 0.65,
      ghast: 0.85,
      shadow: 0.55,
      undead: 1
    },
    bySize: {
      tiny: 0.45,
      sm: 0.7,
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
          definitionId: "rotten-flesh",
          quantityByQuality: {
            poor: [1, 2],
            standard: [1, 3],
            good: [2, 3],
            excellent: [2, 4],
            exceptional: [3, 4]
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
          definitionId: "bone-shard",
          quantityByQuality: {
            poor: [0, 2],
            standard: [1, 3],
            good: [1, 4],
            excellent: [2, 4],
            exceptional: [2, 5]
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
          definitionId: "grave-dirt",
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
            good: 0.7,
            excellent: 0.85,
            exceptional: 0.95
          }
        },
        {
          definitionId: "ectoplasm-vial",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [0, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.18,
            good: 0.3,
            excellent: 0.45,
            exceptional: 0.6
          }
        }
      ]
    },
    currency: {
      type: "currency",
      denominations: {
        cp: { min: 0, max: 16, chance: 0.55 },
        sp: { min: 0, max: 8, chance: 0.35 },
        gp: { min: 0, max: 4, chance: 0.15 }
      },
      crScale: { cp: 1.5, sp: 0.5, gp: 0.3 },
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
        weapon: 0.4,
        armor: 0.25,
        shield: 0.15,
        consumable: 0.35,
        tool: 0.1,
        container: 0.2,
        other: 0.35
      },
      maxDrops: 2,
      qualityWeightsByRollQuality: {
        poor: { broken: 0.55, worn: 0.35, standard: 0.1, fine: 0, masterwork: 0 },
        standard: { broken: 0.35, worn: 0.4, standard: 0.25, fine: 0, masterwork: 0 },
        good: { broken: 0.2, worn: 0.4, standard: 0.35, fine: 0.05, masterwork: 0 },
        excellent: { broken: 0.1, worn: 0.3, standard: 0.45, fine: 0.15, masterwork: 0 },
        exceptional: { broken: 0.05, worn: 0.25, standard: 0.45, fine: 0.2, masterwork: 0.05 }
      }
    },
    junk: {
      type: "poolPick",
      definitionIds: [
        "burial-shroud-scrap",
        "coffin-nail",
        "dirty-rag",
        "old-boot",
        "empty-bottle"
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
        "burial-coin",
        "broken-holy-symbol",
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
        standard: 0.16,
        good: 0.24,
        excellent: 0.36,
        exceptional: 0.5
      }
    },
    story: {
      type: "poolPick",
      definitionIds: [
        "unfinished-will",
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
        poor: 0.05,
        standard: 0.1,
        good: 0.16,
        excellent: 0.24,
        exceptional: 0.34
      }
    }
  }
};
