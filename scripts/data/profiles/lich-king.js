/**
 * Tier 5 boss — Lich King.
 * Guaranteed phylactery core / bone crown, royal lich dust, death-decree lore.
 * Matched before the generic lich profile.
 */

import {
  BOSS_CURRENCY,
  BOSS_EQUIPMENT,
  bossGuaranteed,
  bossLikely,
  bossPoolPick
} from "./_boss-pools.js";

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const lichKingProfile = {
  id: "lich-king",
  matchNames: ["lich king", "lich-king", "king of liches"],
  matchWholeWords: true,
  matchTypes: ["undead"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        bossGuaranteed("lich-king-phylactery-core", [1, 1], { fallback: true }),
        bossGuaranteed("crown-of-bones-shard", [1, 1]),
        bossGuaranteed("royal-lich-dust", [1, 2], { extraExcellent: true }),
        bossGuaranteed("soul-throne-fragment", [1, 1]),
        bossLikely("boss-trophy-crest"),
        bossLikely("legendary-craft-essence", { poorChance: 0.65 }),
        bossLikely("necrotic-crystal", { qty: [1, 2], poorChance: 0.7 }),
        bossLikely("phylactery-shard", { poorChance: 0.5 })
      ]
    },
    currency: BOSS_CURRENCY,
    equipment: BOSS_EQUIPMENT,
    junk: bossPoolPick(
      ["bone-shard", "grave-dirt", "coffin-nail", "yellowed-rib", "empty-bottle"],
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
      "crown-of-bones-shard",
      "soul-throne-fragment",
      "soul-gem-chip",
      "obsidian-focus",
      "boss-trophy-crest"
    ]),
    story: bossPoolPick(["death-decree-scroll", "boss-chronicle-page", "phylactery-notes", "lichdom-formula"], {
      countByQuality: {
        poor: [1, 1],
        standard: [1, 2],
        good: [1, 2],
        excellent: [2, 2],
        exceptional: [2, 3]
      },
      chanceByQuality: {
        poor: 0.95,
        standard: 1,
        good: 1,
        excellent: 1,
        exceptional: 1
      }
    })
  }
};
