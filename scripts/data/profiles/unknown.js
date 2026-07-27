export const unknownCreatureProfile = {
  id: "unknown",
  matchNames: [],
  lootScale: {
    bySize: {
      tiny: 0.5,
      sm: 0.75,
      med: 1,
      lg: 1.15,
      huge: 1.3,
      grg: 1.45
    },
    default: 1
  },
  pools: {
    currency: {
      type: "currency",
      denominations: {
        cp: { min: 2, max: 24, chance: 0.95 },
        sp: { min: 0, max: 12, chance: 0.75 },
        gp: { min: 0, max: 5, chance: 0.3 }
      },
      crScale: { cp: 1.5, sp: 0.8, gp: 0.45 },
      qualityChanceBonus: {
        poor: -0.05,
        standard: 0,
        good: 0.05,
        excellent: 0.1,
        exceptional: 0.15
      }
    },
    story: {
      type: "poolPick",
      definitionIds: [
        "scribbled-note",
        "crude-map",
        "wanted-poster",
        "hunter-trail-map",
        "ranger-warning-scrap",
        "bounty-board-scrap"
      ],
      countByQuality: {
        poor: [1, 1],
        standard: [1, 1],
        good: [1, 2],
        excellent: [1, 2],
        exceptional: [2, 2]
      },
      chanceByQuality: {
        poor: 0.85,
        standard: 0.95,
        good: 1,
        excellent: 1,
        exceptional: 1
      }
    }
  }
};
