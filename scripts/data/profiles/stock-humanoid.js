import {
  CIVILIZED_EQUIPMENT,
  civilizedCurrency,
  junkPool,
  storyPool,
  trinketPool
} from "./_humanoid-pools.js";

export const stockHumanoidProfile = {
  id: "stock-humanoid",
  matchNames: [
    "bandit captain",
    "cult fanatic",
    "gladiator",
    "berserker",
    "assassin",
    "veteran",
    "priest",
    "noble",
    "scout",
    "guard",
    "thug",
    "mage",
    "bandit",
    "cultist"
  ],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  excludeNames: [
    "archmage",
    "arch-mage",
    "goblin",
    "hobgoblin",
    "bugbear",
    "orc",
    "half-orc",
    "elf",
    "dwarf",
    "halfling"
  ],
  lootScale: {
    nameTokens: {
      "bandit captain": 1.15,
      "cult fanatic": 0.95,
      assassin: 1.35,
      gladiator: 1.3,
      veteran: 1.2,
      berserker: 1.0,
      mage: 1.15,
      priest: 1.05,
      noble: 1.1,
      scout: 0.8,
      guard: 0.75,
      thug: 0.7,
      bandit: 0.65,
      cultist: 0.55
    },
    bySize: {
      sm: 0.7,
      med: 1,
      lg: 1.15
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
        },
        {
          definitionId: "bandit-mask-scrap",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.08,
            standard: 0.15,
            good: 0.25,
            excellent: 0.4,
            exceptional: 0.55
          }
        },
        {
          definitionId: "cult-brand-mark",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [0, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.04,
            standard: 0.1,
            good: 0.2,
            excellent: 0.35,
            exceptional: 0.5
          }
        },
        {
          definitionId: "mage-component-scrap",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [1, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.04,
            standard: 0.1,
            good: 0.2,
            excellent: 0.35,
            exceptional: 0.5
          }
        },
        {
          definitionId: "assassin-garrote-cord",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 0],
            good: [0, 1],
            excellent: [0, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.02,
            standard: 0.06,
            good: 0.14,
            excellent: 0.28,
            exceptional: 0.45
          }
        },
        {
          definitionId: "thugs-brass-knuckle",
          quantityByQuality: {
            poor: [0, 0],
            standard: [0, 1],
            good: [0, 1],
            excellent: [0, 1],
            exceptional: [1, 1]
          },
          chanceByQuality: {
            poor: 0.05,
            standard: 0.12,
            good: 0.22,
            excellent: 0.38,
            exceptional: 0.55
          }
        }
      ]
    },

    currency: civilizedCurrency(
      {
        cp: { min: 2, max: 28, chance: 1 },
        sp: { min: 0, max: 18, chance: 0.92 },
        gp: { min: 0, max: 20, chance: 0.45 },
        pp: { min: 0, max: 4, chance: 0.08 }
      },
      { cp: 1.5, sp: 1.1, gp: 1.4, pp: 0.35 }
    ),

    equipment: {
      ...CIVILIZED_EQUIPMENT,
      chances: {
        weapon: 0.88,
        armor: 0.65,
        shield: 0.45,
        consumable: 0.75,
        tool: 0.25,
        container: 0.3,
        other: 0.4
      },
      maxDrops: 5
    },

    junk: junkPool([
      "scout-trail-chalk",
      "dirty-rag",
      "empty-bottle",
      "old-boot",
      "cracked-mug",
      "crumpled-receipt",
      "torn-ledger-page"
    ]),

    trinkets: trinketPool([
      "guard-watch-badge",
      "captains-purse-clasp",
      "veterans-service-pin",
      "noble-signet-wax",
      "priest-prayer-bead",
      "gladiator-arena-token",
      "berserker-rage-totem",
      "worn-insignia",
      "copper-ring",
      "travelers-token"
    ]),

    story: storyPool([
      "bounty-board-scrap",
      "cult-cell-roster",
      "barracks-roster",
      "letter-of-marque",
      "bandit-orders",
      "bandit-pass",
      "cultist-summons",
      "wanted-poster",
      "scribbled-note"
    ])
  }
};
