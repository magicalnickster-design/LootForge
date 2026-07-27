/**
 * Tier 5 boss — Kraken.
 * Guaranteed tentacle / ink, abyssal eye collectible, drowned-lore artifacts.
 */

import {
  BOSS_CURRENCY,
  BOSS_EQUIPMENT,
  bossGuaranteed,
  bossLikely,
  bossPoolPick
} from "./_boss-pools.js";

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const krakenProfile = {
  id: "kraken",
  matchNames: ["kraken"],
  matchWholeWords: true,
  matchTypes: ["monstrosity"],
  matchSubtypes: ["kraken"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        bossGuaranteed("kraken-tentacle", [1, 2], { fallback: true, extraExcellent: true }),
        bossGuaranteed("kraken-ink-sac", [1, 1]),
        bossGuaranteed("abyssal-eye-lens", [1, 1]),
        bossLikely("boss-trophy-crest"),
        bossLikely("legendary-craft-essence", { poorChance: 0.55 })
      ]
    },
    currency: BOSS_CURRENCY,
    equipment: BOSS_EQUIPMENT,
    junk: bossPoolPick(
      ["sticky-residue", "empty-bottle", "dirty-rag", "old-boot", "dissolved-boot"],
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
    trinkets: bossPoolPick(["drowned-captain-sigil", "undigested-ring", "slime-coated-gem", "boss-trophy-crest"]),
    story: bossPoolPick(["sunken-empire-chart", "boss-chronicle-page", "scribbled-note"], {
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
