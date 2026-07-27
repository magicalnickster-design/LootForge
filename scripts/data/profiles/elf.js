/**
 * Elf — civilized humanoid multi-pool profile (includes drow / eladrin by name).
 */

import {
  CIVILIZED_EQUIPMENT,
  civilizedCurrency,
  junkPool,
  storyPool,
  trinketPool
} from "./_humanoid-pools.js";

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const elfProfile = {
  id: "elf",
  matchNames: ["elf", "drow", "eladrin"],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  matchSubtypes: ["elf"],
  excludeNames: ["half-elf", "halforc"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "elf-blood-vial",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.22,
            standard: 0.42,
            good: 0.62,
            excellent: 0.82,
            exceptional: 0.95
          },
          guaranteedFallback: true
        },
        {
          definitionId: "elf-hair-lock",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.25,
            standard: 0.45,
            good: 0.6,
            excellent: 0.78,
            exceptional: 0.92
          }
        },
        {
          definitionId: "moon-silver-splinter",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.18,
            good: 0.32,
            excellent: 0.48,
            exceptional: 0.65
          }
        }
      ]
    },
    currency: civilizedCurrency({
      cp: { min: 2, max: 18, chance: 0.85 },
      sp: { min: 1, max: 14, chance: 0.9 },
      gp: { min: 0, max: 6, chance: 0.28 }
    }),
    equipment: {
      ...CIVILIZED_EQUIPMENT,
      chances: {
        ...CIVILIZED_EQUIPMENT.chances,
        weapon: 0.8,
        consumable: 0.75
      }
    },
    junk: junkPool([
      "perfume-vial",
      "silk-scrap",
      "empty-bottle",
      "decorative-feather",
      "dirty-rag"
    ]),
    trinkets: trinketPool([
      "elven-arrowhead",
      "silver-leaf-charm",
      "copper-ring",
      "bone-necklace"
    ], {
      chanceByQuality: {
        poor: 0.12,
        standard: 0.22,
        good: 0.32,
        excellent: 0.45,
        exceptional: 0.6
      }
    }),
    story: storyPool([
      "elven-poetry-scrap",
      "woodland-map",
      "crude-map",
      "scribbled-note"
    ], {
      chanceByQuality: {
        poor: 0.06,
        standard: 0.12,
        good: 0.2,
        excellent: 0.3,
        exceptional: 0.42
      }
    })
  }
};
