/**
 * Investigation skill rolls for loot generation.
 * LootForge always uses Investigation — never Survival or another skill.
 */

import { LOOT_SKILL } from "./constants.js";
import { log } from "./logger.js";

/**
 * @typedef {object} LootRollResult
 * @property {number} total
 * @property {number} natural
 * @property {boolean} isNatural20
 * @property {object} [roll]
 */

/**
 * Force an Investigation check for the looting character.
 * @param {Actor} looter
 * @returns {Promise<LootRollResult|null>}
 */
export async function rollInvestigation(looter) {
  return rollLootSkill(looter, LOOT_SKILL);
}

/**
 * @param {Actor} looter
 * @param {string} [skill]
 * @returns {Promise<LootRollResult|null>}
 */
export async function rollLootSkill(looter, skill = LOOT_SKILL) {
  if (!looter?.rollSkill) {
    log.error("Looter actor does not support rollSkill", looter);
    return null;
  }

  // Always Investigation for looting, regardless of caller argument.
  const skillId = LOOT_SKILL;
  if (skill && skill !== LOOT_SKILL) {
    log.warn(`Ignoring non-Investigation loot skill "${skill}" — forcing ${LOOT_SKILL}`);
  }

  log.info("Rolling Investigation for loot", {
    actorId: looter.id,
    actorName: looter.name,
    skill: skillId
  });

  const rolls = await looter.rollSkill({ skill: skillId }, {}, { create: true });
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
