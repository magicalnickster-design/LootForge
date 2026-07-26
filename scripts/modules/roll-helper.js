/**
 * Survival / Investigation skill rolls for loot generation.
 */

import { log } from "./logger.js";

/**
 * @typedef {object} LootRollResult
 * @property {number} total
 * @property {number} natural
 * @property {boolean} isNatural20
 * @property {object} roll
 */

/**
 * @param {Actor} looter
 * @param {string} skill
 * @returns {Promise<LootRollResult|null>}
 */
export async function rollLootSkill(looter, skill) {
  if (!looter?.rollSkill) {
    log.error("Looter actor does not support rollSkill", looter);
    return null;
  }

  const rolls = await looter.rollSkill({ skill }, {}, { create: true });
  if (!rolls?.length) return null;

  const roll = rolls[0];
  const total = Number(roll.total ?? 0);

  let natural = Number(roll.d20?.total);
  if (!Number.isFinite(natural)) {
    const die = roll.dice?.find((d) => d.faces === 20) ?? roll.terms?.find((t) => t.faces === 20);
    natural = Number(die?.total ?? die?.results?.find((r) => r.active)?.result ?? 0);
  }

  return {
    total,
    natural: Number.isFinite(natural) ? natural : 0,
    isNatural20: Boolean(roll.isCritical) || natural === 20,
    roll
  };
}
