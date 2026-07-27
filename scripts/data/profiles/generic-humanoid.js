/**
 * Generic Humanoid — type-fallback multi-pool profile for humanoids that
 * lack a race, goblinoid, stock-role, or boss name match.
 *
 * Goblin / Hobgoblin / Bugbear / race / stock NPC / Archmage profiles stay
 * more specific and are matched first by name or subtype.
 */

import {
  CIVILIZED_EQUIPMENT,
  civilizedCurrency,
  junkPool,
  storyPool,
  trinketPool
} from "./_humanoid-pools.js";

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const genericHumanoidProfile = {
  id: "generic-humanoid",
  // Name matching is intentionally empty — this profile is reached via
  // creature-type fallback after specific humanoid profiles miss.
  matchNames: [],
  matchTypes: ["humanoid"],
  lootScale: {
    bySize: {
      tiny: 0.45,
      sm: 0.7,
      med: 1,
      lg: 1.2,
      huge: 1.4
    },
    default: 1
  },
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "mercenary-blood-vial",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.35,
            standard: 0.55,
            good: 0.75,
            excellent: 0.9,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "calloused-knuckle-bone",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.2,
            standard: 0.35,
            good: 0.5,
            excellent: 0.7,
            exceptional: 0.85
          }
        }
      ]
    },

    currency: civilizedCurrency(
      {
        cp: { min: 1, max: 22, chance: 0.95 },
        sp: { min: 0, max: 12, chance: 0.8 },
        gp: { min: 0, max: 8, chance: 0.3 }
      },
      { cp: 1.5, sp: 0.9, gp: 0.8 }
    ),

    equipment: {
      ...CIVILIZED_EQUIPMENT,
      chances: {
        weapon: 0.7,
        armor: 0.45,
        shield: 0.3,
        consumable: 0.55,
        tool: 0.2,
        container: 0.25,
        other: 0.35
      },
      maxDrops: 3
    },

    junk: junkPool([
      "dirty-rag",
      "empty-bottle",
      "old-boot",
      "cracked-mug",
      "crumpled-receipt",
      "torn-ledger-page"
    ]),

    trinkets: trinketPool([
      "worn-insignia",
      "copper-ring",
      "travelers-token"
    ]),

    story: storyPool([
      "wanted-poster",
      "scribbled-note",
      "bounty-board-scrap"
    ])
  }
};
