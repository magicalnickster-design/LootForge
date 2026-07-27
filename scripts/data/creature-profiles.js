/**
 * Creature loot profiles — public API.
 *
 * Profile documents live in `scripts/data/profiles/`.
 * Add future creatures there; keep generation logic generic.
 */

export {
  CREATURE_PROFILES,
  PROFILE_ORDER,
  TYPE_FALLBACKS,
  resolveCreatureProfile
} from "./profiles/index.js";

/**
 * @typedef {object} ProfileDrop
 * @property {string} [definitionId]
 * @property {Record<string, string>} [definitionByQuality]
 * @property {Record<string, [number, number]>} [quantityByQuality]
 * @property {Record<string, number>} [chanceByQuality]
 * @property {boolean} [rare]
 * @property {boolean} [guaranteedFallback]
 */

/**
 * @typedef {object} CurrencyDenomRule
 * @property {number} min
 * @property {number} max
 * @property {number} [chance]
 */

/**
 * @typedef {object} CreatureProfile
 * @property {string} id
 * @property {string[]} matchNames
 * @property {string[]} [excludeNames]
 * @property {boolean} [matchWholeWords]
 * @property {string[]} [matchTypes]
 * @property {string[]} [matchSubtypes]
 * @property {number} [maxCR]
 * @property {string} [nat20BonusDefinitionId]
 * @property {ProfileDrop[]} [drops]   Legacy single-pool profiles (wolf, …)
 * @property {object} [pools]          Multi-pool profiles (goblin, orc, spider, dragon, …)
 * @property {{ nameTokens?: Record<string, number>, bySize?: Record<string, number>, default?: number }} [lootScale]
 *   Optional quantity multiplier (wyrmling vs ancient, size tiers, etc.).
 */
