/**
 * Creature loot profiles. Quantity/chance rules live here — not in the UI.
 *
 * More-specific profiles are listed first (spider before wolf).
 */

/**
 * @typedef {object} ProfileDrop
 * @property {string} [definitionId]
 * @property {Record<string, string>} [definitionByQuality]  Pick definition from roll quality
 * @property {Record<string, [number, number]>} quantityByQuality  Inclusive [min,max] per roll quality
 * @property {Record<string, number>} [chanceByQuality]            0–1 chance to appear; default 1
 * @property {boolean} [rare]                                      Honors enableRareDrops setting
 * @property {boolean} [guaranteedFallback]                        Prefer this if the roll produced nothing
 */

/**
 * @typedef {object} CreatureProfile
 * @property {string} id
 * @property {string[]} matchNames          Substrings matched against actor name (lowercase)
 * @property {string[]} [excludeNames]      If any match, this profile is skipped
 * @property {boolean} [matchWholeWords]    Match names as whole words (\\b)
 * @property {string[]} matchTypes          dnd5e creature type values
 * @property {string[]} [matchSubtypes]
 * @property {number} [maxCR]
 * @property {string} [nat20BonusDefinitionId]
 * @property {ProfileDrop[]} drops
 */

/** @type {Record<string, CreatureProfile>} */
export const CREATURE_PROFILES = {
  spider: {
    id: "spider",
    matchNames: ["spider"],
    matchTypes: ["beast"],
    matchSubtypes: ["spider"],
    nat20BonusDefinitionId: "spider-fang",
    drops: [
      {
        definitionId: "spider-silk",
        quantityByQuality: {
          poor: [0, 1],
          standard: [1, 2],
          good: [1, 3],
          excellent: [2, 3],
          exceptional: [2, 4]
        },
        chanceByQuality: {
          poor: 0.65,
          standard: 0.85,
          good: 0.95,
          excellent: 1,
          exceptional: 1
        },
        guaranteedFallback: true
      },
      {
        definitionId: "spider-fang",
        quantityByQuality: {
          poor: [1, 2],
          standard: [1, 2],
          good: [2, 3],
          excellent: [2, 4],
          exceptional: [3, 4]
        },
        chanceByQuality: {
          poor: 0.8,
          standard: 1,
          good: 1,
          excellent: 1,
          exceptional: 1
        },
        guaranteedFallback: true
      },
      {
        definitionId: "spider-venom-gland",
        quantityByQuality: {
          poor: [0, 1],
          standard: [0, 1],
          good: [1, 1],
          excellent: [1, 2],
          exceptional: [1, 2]
        },
        chanceByQuality: {
          poor: 0.35,
          standard: 0.55,
          good: 0.75,
          excellent: 0.9,
          exceptional: 1
        }
      },
      {
        definitionId: "spider-eye",
        quantityByQuality: {
          poor: [0, 2],
          standard: [1, 3],
          good: [2, 4],
          excellent: [2, 5],
          exceptional: [3, 6]
        },
        chanceByQuality: {
          poor: 0.45,
          standard: 0.65,
          good: 0.8,
          excellent: 0.9,
          exceptional: 1
        }
      }
    ]
  },

  animatedArmor: {
    id: "animated-armor",
    matchNames: ["animated armor", "animated armour"],
    matchTypes: ["construct"],
    // Investigation quality maps to a single salvaged armor piece (see definitionByQuality).
    drops: [
      {
        // Investigation quality → how strong the salvaged armor piece is.
        definitionByQuality: {
          poor: "salvaged-padded-armor",
          standard: "salvaged-chain-shirt",
          good: "salvaged-scale-mail",
          excellent: "salvaged-breastplate",
          exceptional: "salvaged-plate-armor"
        },
        quantityByQuality: {
          poor: [1, 1],
          standard: [1, 1],
          good: [1, 1],
          excellent: [1, 1],
          exceptional: [1, 1]
        },
        chanceByQuality: {
          poor: 1,
          standard: 1,
          good: 1,
          excellent: 1,
          exceptional: 1
        },
        guaranteedFallback: true
      }
    ]
  },

  wolf: {
    id: "wolf",
    matchNames: ["wolf"],
    excludeNames: ["spider"],
    matchWholeWords: true,
    matchTypes: ["beast"],
    matchSubtypes: ["wolf"],
    maxCR: 1,
    nat20BonusDefinitionId: "wolf-fang",
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

/** Specific profiles first — spider before wolf, etc. */
const PROFILE_ORDER = ["spider", "animatedArmor", "wolf"];

/**
 * @param {CreatureProfile} profile
 * @param {string} nameLower
 * @returns {boolean}
 */
function nameHitsProfile(profile, nameLower) {
  if (profile.excludeNames?.some((ex) => nameLower.includes(ex))) return false;

  return (profile.matchNames ?? []).some((needle) => {
    if (!needle) return false;
    if (profile.matchWholeWords) {
      const re = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      return re.test(nameLower);
    }
    return nameLower.includes(needle);
  });
}

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

  const ordered = [
    ...PROFILE_ORDER.map((id) => CREATURE_PROFILES[id]).filter(Boolean),
    ...Object.values(CREATURE_PROFILES).filter((p) => !PROFILE_ORDER.includes(p.id))
  ];

  for (const profile of ordered) {
    const nameHit = nameHitsProfile(profile, name);
    const subtypeHit = profile.matchSubtypes?.some((s) => subtype.includes(s))
      && !profile.excludeNames?.some((ex) => name.includes(ex) || subtype.includes(ex));
    const typeOk = !profile.matchTypes?.length || profile.matchTypes.includes(type);

    if ((nameHit || subtypeHit) && typeOk) return profile;

    // Name hit even if type missing/wrong (DDB imports), still respect excludes.
    if (nameHit) return profile;
  }

  return null;
}
