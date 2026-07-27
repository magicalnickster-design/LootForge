import {
  BOSS_CURRENCY,
  BOSS_EQUIPMENT,
  bossGuaranteed,
  bossLikely,
  bossPoolPick
} from "./_boss-pools.js";

export const demonLordProfile = {
  id: "demon-lord",
  matchNames: [
    "demon lord",
    "demon prince",
    "demogorgon",
    "orcus",
    "graz'zt",
    "grazzt",
    "juiblex",
    "baphomet",
    "yeenoghu",
    "zuggtmoy",
    "fraz-urb'luu",
    "frazurbluu"
  ],
  matchWholeWords: true,
  matchTypes: ["fiend"],
  excludeNames: ["balor"], // Balor stays on generic fiend unless named as a lord
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        bossGuaranteed("demon-lord-horn", [1, 2], { fallback: true, extraExcellent: true }),
        bossGuaranteed("demonic-ichor-concentrate", [1, 1]),
        bossGuaranteed("abyssal-crown-fragment", [1, 1]),
        bossLikely("boss-trophy-crest"),
        bossLikely("legendary-craft-essence", { poorChance: 0.65 }),
        bossLikely("fiend-horn", { qty: [1, 2], poorChance: 0.5 })
      ]
    },
    currency: BOSS_CURRENCY,
    equipment: BOSS_EQUIPMENT,
    junk: bossPoolPick(
      ["brimstone-chunk", "sulfur-stained-cloth", "scorched-scrap", "empty-bottle", "melted-coin"],
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
    trinkets: bossPoolPick([
      "abyss-gate-key-shard",
      "abyssal-crown-fragment",
      "infernal-seal",
      "soul-coin-chip",
      "boss-trophy-crest"
    ]),
    story: bossPoolPick(["soul-contract-vellum", "boss-chronicle-page", "blood-war-orders", "infernal-contract"], {
      countByQuality: {
        poor: [1, 1],
        standard: [1, 2],
        good: [1, 2],
        excellent: [2, 2],
        exceptional: [2, 3]
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
