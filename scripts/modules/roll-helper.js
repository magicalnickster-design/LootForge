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
 * Manual Investigation roll when Actor#ifrollSkill fails (dnd5e embedded update bugs).
 * @param {Actor} looter
 * @returns {Promise<LootRollResult|null>}
 */
async function rollInvestigationFallback(looter) {
  const skill = looter?.system?.skills?.inv ?? looter?.system?.skills?.investigation;
  const mod = Number(skill?.total ?? skill?.mod ?? 0) || 0;
  const formula = `1d20 + ${mod}`;
  log.warn("Using Investigation formula fallback", { actorId: looter?.id, formula });

  try {
    const roll = await new Roll(formula).evaluate();
    const natural = Number(roll.dice?.[0]?.results?.[0]?.result
      ?? roll.terms?.find((t) => t.faces === 20)?.results?.[0]?.result
      ?? 0);
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: looter }),
      flavor: game.i18n?.localize?.("LOOTFORGE.Notify.RollInvestigation")
        ?? "Investigation (LootForge)"
    });
    return {
      total: Number(roll.total ?? 0),
      natural: Number.isFinite(natural) ? natural : 0,
      isNatural20: natural === 20,
      roll
    };
  } catch (err) {
    log.error("Investigation fallback roll failed", err);
    return null;
  }
}

/**
 * @param {Actor} looter
 * @param {string} [skill]
 * @returns {Promise<LootRollResult|null>}
 */
export async function rollLootSkill(looter, skill = LOOT_SKILL) {
  if (!looter) {
    log.error("Missing looter actor for Investigation roll");
    return null;
  }

  const skillId = LOOT_SKILL;
  if (skill && skill !== LOOT_SKILL) {
    log.warn(`Ignoring non-Investigation loot skill "${skill}" — forcing ${LOOT_SKILL}`);
  }

  log.info("Rolling Investigation for loot", {
    actorId: looter.id,
    actorName: looter.name,
    skill: skillId
  });

  if (typeof looter.rollSkill === "function") {
    try {
      const rolls = await looter.rollSkill({ skill: skillId }, {}, { create: true });
      if (rolls?.length) {
        const roll = rolls[0];
        const total = Number(roll.total ?? 0);
        let natural = Number(roll.d20?.total);
        if (!Number.isFinite(natural)) {
          const die = roll.dice?.find((d) => d.faces === 20)
            ?? roll.terms?.find((t) => t.faces === 20);
          natural = Number(die?.total ?? die?.results?.find((r) => r.active)?.result ?? 0);
        }
        return {
          total,
          natural: Number.isFinite(natural) ? natural : 0,
          isNatural20: Boolean(roll.isCritical) || natural === 20,
          roll
        };
      }
      // User cancelled the roll configuration dialog.
      return null;
    } catch (err) {
      log.warn("Actor.rollSkill failed — trying formula fallback", err);
      return rollInvestigationFallback(looter);
    }
  }

  return rollInvestigationFallback(looter);
}
