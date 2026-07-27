import {
  BOSS_CURRENCY,
  BOSS_EQUIPMENT,
  bossGuaranteed,
  bossLikely,
  bossPoolPick
} from "./_boss-pools.js";

export const tarrasqueProfile = {
  id: "tarrasque",
  matchNames: ["tarrasque", "tarasque"],
  matchWholeWords: true,
  matchTypes: ["monstrosity"],
  matchSubtypes: ["tarrasque"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        bossGuaranteed("tarrasque-carapace-plate", [1, 2], { fallback: true, extraExcellent: true }),
        bossGuaranteed("tarrasque-fang", [1, 2]),
        bossGuaranteed("world-eater-bile", [1, 1]),
        bossGuaranteed("titanic-bone-shard", [1, 2]),
        bossLikely("boss-trophy-crest"),
        bossLikely("legendary-craft-essence", { poorChance: 0.7 })
      ]
    },
    currency: {
      ...BOSS_CURRENCY,
      denominations: {
        cp: { min: 0, max: 40, chance: 0.35 },
        sp: { min: 0, max: 60, chance: 0.45 },
        gp: { min: 20, max: 200, chance: 0.75 },
        pp: { min: 0, max: 30, chance: 0.4 }
      }
    },
    equipment: BOSS_EQUIPMENT,
    junk: bossPoolPick(
      ["crushed-wagon-spoke", "etched-metal-scrap", "bone-shard", "gravel-cluster", "empty-bottle"],
      {
        countByQuality: {
          poor: [2, 3],
          standard: [2, 4],
          good: [3, 4],
          excellent: [3, 5],
          exceptional: [4, 5]
        }
      }
    ),
    trinkets: bossPoolPick(["boss-trophy-crest", "polished-knuckle", "iron-nose-ring", "copper-ring"]),
    story: bossPoolPick(["apocalypse-scar-map", "boss-chronicle-page", "hunter-warning"], {
      countByQuality: {
        poor: [1, 1],
        standard: [1, 1],
        good: [1, 2],
        excellent: [1, 2],
        exceptional: [2, 2]
      },
      chanceByQuality: {
        poor: 0.9,
        standard: 1,
        good: 1,
        excellent: 1,
        exceptional: 1
      }
    })
  }
};
