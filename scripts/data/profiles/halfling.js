/**
 * Halfling — civilized humanoid multi-pool profile.
 */

import {
  CIVILIZED_EQUIPMENT,
  civilizedCurrency,
  junkPool,
  storyPool,
  trinketPool
} from "./_humanoid-pools.js";

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const halflingProfile = {
  id: "halfling",
  matchNames: ["halfling"],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  matchSubtypes: ["halfling"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "halfling-blood-vial",
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
          definitionId: "halfling-hair-lock",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.2,
            standard: 0.38,
            good: 0.55,
            excellent: 0.72,
            exceptional: 0.88
          }
        }
      ]
    },
    currency: civilizedCurrency({
      cp: { min: 4, max: 28, chance: 1 },
      sp: { min: 0, max: 10, chance: 0.88 },
      gp: { min: 0, max: 5, chance: 0.22 }
    }),
    equipment: {
      ...CIVILIZED_EQUIPMENT,
      chances: {
        ...CIVILIZED_EQUIPMENT.chances,
        consumable: 0.95,
        container: 0.35,
        other: 0.4
      },
      maxDrops: 3
    },
    junk: junkPool([
      "harvest-apple",
      "pocket-handkerchief",
      "empty-bottle",
      "bent-spoon",
      "dirty-rag"
    ]),
    trinkets: trinketPool([
      "halfling-pipe",
      "lucky-charm",
      "lucky-rabbit-foot",
      "copper-ring"
    ]),
    story: storyPool([
      "recipe-card",
      "county-fair-ticket",
      "shire-map-scrap",
      "scribbled-note"
    ], {
      chanceByQuality: {
        poor: 0.06,
        standard: 0.12,
        good: 0.18,
        excellent: 0.28,
        exceptional: 0.4
      }
    })
  }
};
