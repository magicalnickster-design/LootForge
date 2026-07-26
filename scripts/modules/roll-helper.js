/**
 * Investigation skill rolls for loot generation.
 * LootForge always uses Investigation — never Survival or another skill.
 *
 * Critical rule: on the GM client, never open an interactive PC roll dialog.
 * Use silent formula rolls for GM-side fallbacks.
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
 * @param {Actor} looter
 * @returns {string}
 */
export function buildInvestigationFormula(looter) {
  const skill = looter?.system?.skills?.[LOOT_SKILL]
    ?? looter?.system?.skills?.investigation;
  const mod = Number(skill?.total ?? skill?.mod ?? 0) || 0;
  return `1d20 + ${mod}`;
}

/**
 * Silent Investigation roll — never opens Foundry's roll config UI.
 * @param {Actor} looter
 * @param {{ createMessage?: boolean, flavor?: string }} [options]
 * @returns {Promise<LootRollResult|null>}
 */
export async function rollInvestigationSilent(looter, {
  createMessage = true,
  flavor = null
} = {}) {
  if (!looter) {
    log.error("Missing looter actor for silent Investigation roll");
    return null;
  }

  const formula = buildInvestigationFormula(looter);
  log.info("Silent Investigation formula roll", { actorId: looter.id, formula });

  try {
    const roll = await new Roll(formula).evaluate();
    const natural = Number(
      roll.dice?.[0]?.results?.[0]?.result
      ?? roll.terms?.find((t) => t.faces === 20)?.results?.[0]?.result
      ?? 0
    );
    if (createMessage) {
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: looter }),
        flavor: flavor
          || game.i18n?.localize?.("LOOTFORGE.Notify.RollInvestigation")
          || "Investigation (LootForge)"
      });
    }
    return {
      total: Number(roll.total ?? 0),
      natural: Number.isFinite(natural) ? natural : 0,
      isNatural20: natural === 20,
      roll
    };
  } catch (err) {
    log.error("Silent Investigation roll failed", err);
    return null;
  }
}

/**
 * Interactive Investigation for the local player who owns the character.
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
  if (!looter) {
    log.error("Missing looter actor for Investigation roll");
    return null;
  }

  // GM must never open interactive PC roll dialogs during loot flows.
  if (game.user.isGM) {
    log.info("GM Investigation → silent formula (no roll dialog)", {
      actorId: looter.id
    });
    return rollInvestigationSilent(looter);
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
      log.warn("Actor.rollSkill failed — trying silent formula fallback", err);
      return rollInvestigationSilent(looter);
    }
  }

  return rollInvestigationSilent(looter);
}
