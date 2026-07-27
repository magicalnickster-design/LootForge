import {
  BOSS_CURRENCY,
  BOSS_EQUIPMENT,
  bossGuaranteed,
  bossLikely,
  bossPoolPick
} from "./_boss-pools.js";

export const ancientRedDragonProfile = {
  id: "ancient-red-dragon",
  matchNames: ["ancient red dragon"],
  matchWholeWords: true,
  matchTypes: ["dragon"],
  excludeNames: ["dragonborn", "half-dragon"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        bossGuaranteed("ancient-red-dragon-scale", [1, 2], { fallback: true, extraExcellent: true }),
        bossGuaranteed("ancient-dragon-heartfire", [1, 1]),
        bossGuaranteed("crimson-wyrm-fang", [1, 2]),
        bossLikely("boss-trophy-crest"),
        bossLikely("legendary-craft-essence", { poorChance: 0.6 })
      ]
    },
    currency: BOSS_CURRENCY,
    equipment: BOSS_EQUIPMENT,
    junk: bossPoolPick(
      ["scorched-bone", "ash-clump", "sulfur-lump", "cracked-scale-shard", "empty-bottle"],
      {
        countByQuality: {
          poor: [1, 2],
          standard: [2, 3],
          good: [2, 3],
          excellent: [2, 4],
          exceptional: [3, 4]
        }
      }
    ),
    trinkets: bossPoolPick(["hoard-crown-shard", "hoard-gem-chip", "polished-dragon-scale", "boss-trophy-crest"]),
    story: bossPoolPick(["scorched-throne-edict", "boss-chronicle-page", "hoard-ledger", "territorial-claim"], {
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
