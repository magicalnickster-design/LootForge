/**
 * Creature loot profiles. Quantity/chance rules live here — not in the UI.
 */

/**
 * @typedef {object} ProfileDrop
 * @property {string} definitionId
 * @property {Record<string, [number, number]>} quantityByQuality  Inclusive [min,max] per roll quality
 * @property {Record<string, number>} [chanceByQuality]            0–1 chance to appear; default 1
 * @property {boolean} [rare]                                      Honors enableRareDrops setting
 * @property {boolean} [guaranteedFallback]                        Prefer this if the roll produced nothing
 */

/**
 * @typedef {object} CreatureProfile
 * @property {string} id
 * @property {string[]} matchNames          Substrings matched against actor name (lowercase)
 * @property {string[]} matchTypes          dnd5e creature type values
 * @property {string[]} [matchSubtypes]
 * @property {number} [maxCR]
 * @property {ProfileDrop[]} drops
 */

/** @type {Record<string, CreatureProfile>} */
export const CREATURE_PROFILES = {
  wolf: {
    id: "wolf",
    matchNames: ["wolf"],
    matchTypes: ["beast"],
    matchSubtypes: ["wolf"],
    maxCR: 1,
    drops: [
      {
        definitionId: "wolf-pelt",
        quantityByQuality: {
          poor: [0, 1],
          standard: [0, 1],
          good: [1, 1],
          excellent: [1, 1],
          exceptional: [1, 1]
        },
        chanceByQuality: {
          poor: 0.55,
          standard: 0.75,
          good: 0.9,
          excellent: 1,
          exceptional: 1
        },
        guaranteedFallback: true
      },
      {
        definitionId: "wolf-fang",
        quantityByQuality: {
          poor: [1, 2],
          standard: [1, 3],
          good: [2, 4],
          excellent: [2, 4],
          exceptional: [3, 4]
        },
        chanceByQuality: {
          poor: 0.85,
          standard: 1,
          good: 1,
          excellent: 1,
          exceptional: 1
        },
        guaranteedFallback: true
      },
      {
        definitionId: "wolf-meat",
        quantityByQuality: {
          poor: [0, 1],
          standard: [1, 2],
          good: [1, 3],
          excellent: [2, 3],
          exceptional: [2, 3]
        },
        chanceByQuality: {
          poor: 0.6,
          standard: 0.85,
          good: 0.95,
          excellent: 1,
          exceptional: 1
        }
      },
      {
        definitionId: "wolf-claw",
        quantityByQuality: {
          poor: [0, 2],
          standard: [1, 3],
          good: [1, 4],
          excellent: [2, 4],
          exceptional: [3, 4]
        },
        chanceByQuality: {
          poor: 0.5,
          standard: 0.7,
          good: 0.85,
          excellent: 0.95,
          exceptional: 1
        }
      },
      {
        definitionId: "alpha-wolf-fang",
        rare: true,
        quantityByQuality: {
          poor: [0, 0],
          standard: [0, 1],
          good: [0, 1],
          excellent: [1, 1],
          exceptional: [1, 1]
        },
        chanceByQuality: {
          poor: 0,
          standard: 0.05,
          good: 0.12,
          excellent: 0.28,
          exceptional: 0.45
        }
      }
    ]
  }
};

/**
 * Resolve a creature profile from normalized context / actor name.
 * @param {object} context  Result of buildCreatureContext
 * @returns {CreatureProfile|null}
 */
export function resolveCreatureProfile(context) {
  if (!context) return null;
  const name = String(context.name ?? "").toLowerCase();
  const type = String(context.creatureType ?? "").toLowerCase();
  const subtype = String(context.creatureSubtype ?? "").toLowerCase();

  for (const profile of Object.values(CREATURE_PROFILES)) {
    const nameHit = profile.matchNames?.some((n) => name.includes(n));
    const subtypeHit = profile.matchSubtypes?.some((s) => subtype.includes(s));
    const typeOk = !profile.matchTypes?.length || profile.matchTypes.includes(type);

    // Prefer explicit wolf name/subtype matches.
    if ((nameHit || subtypeHit) && typeOk) return profile;

    // Name contains wolf even if type missing/wrong (DDB imports).
    if (nameHit) return profile;
  }

  return null;
}
