/**
 * Tier 5 boss — Archmage.
 * Guaranteed spellbook page / focus crystal, arcane crafting thread, tower lore.
 */

import {
  BOSS_CURRENCY,
  BOSS_EQUIPMENT,
  bossGuaranteed,
  bossLikely,
  bossPoolPick
} from "./_boss-pools.js";

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const archmageProfile = {
  id: "archmage",
  matchNames: ["archmage", "arch-mage", "arch mage"],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        bossGuaranteed("archmage-focus-crystal", [1, 1], { fallback: true }),
        bossGuaranteed("woven-arcane-thread", [1, 2]),
        bossGuaranteed("archmage-spellbook-page", [1, 1]),
        bossLikely("boss-trophy-crest"),
        bossLikely("legendary-craft-essence", { poorChance: 0.55 })
      ]
    },
    currency: BOSS_CURRENCY,
    equipment: BOSS_EQUIPMENT,
    junk: bossPoolPick(
      ["empty-bottle", "crumpled-receipt", "torn-ledger-page", "dirty-rag", "whetstone-chip"],
      {
        countByQuality: {
          poor: [1, 2],
          standard: [1, 2],
          good: [2, 3],
          excellent: [2, 3],
          exceptional: [2, 4]
        }
      }
    ),
    trinkets: bossPoolPick([
      "planar-seal-ring",
      "obsidian-focus",
      "moonbeam-crystal",
      "boss-trophy-crest",
      "copper-ring"
    ]),
    story: bossPoolPick(["tower-ward-schematic", "archmage-spellbook-page", "boss-chronicle-page", "spell-research-page"], {
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
