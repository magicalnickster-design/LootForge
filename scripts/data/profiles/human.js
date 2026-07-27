/**
 * Human — civilized humanoid multi-pool profile.
 * Equipment comes from the NPC's actual inventory when present.
 */

import {
  CIVILIZED_EQUIPMENT,
  civilizedCurrency,
  junkPool,
  storyPool,
  trinketPool
} from "./_humanoid-pools.js";

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const humanProfile = {
  id: "human",
  matchNames: ["human"],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  matchSubtypes: ["human"],
  excludeNames: ["half-orc", "halforc", "half-elf", "tiefling", "dragonborn", "aasimar"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "human-blood-vial",
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
            good: 0.65,
            excellent: 0.85,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "human-hair-lock",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.2,
            standard: 0.4,
            good: 0.55,
            excellent: 0.75,
            exceptional: 0.9
          }
        }
      ]
    },
    currency: civilizedCurrency({
      cp: { min: 3, max: 24, chance: 1 },
      sp: { min: 0, max: 12, chance: 0.92 },
      gp: { min: 0, max: 8, chance: 0.35 }
    }),
    equipment: CIVILIZED_EQUIPMENT,
    junk: junkPool([
      "crumpled-receipt",
      "torn-ledger-page",
      "dirty-rag",
      "empty-bottle",
      "old-boot",
      "cracked-mug"
    ]),
    trinkets: trinketPool([
      "worn-insignia",
      "travelers-token",
      "copper-ring",
      "dice"
    ]),
    story: storyPool([
      "guild-letter",
      "bandit-pass",
      "love-letter",
      "wanted-poster",
      "scribbled-note"
    ])
  }
};
