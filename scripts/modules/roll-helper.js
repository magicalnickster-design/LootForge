import { LOOT_SKILL_INV, LOOT_SKILL_SUR } from "./constants.js";
import { log } from "./logger.js";

export function resolveLootSkill(creatureContext = null) {
  if (creatureContext?.isBeast || creatureContext?.isWolf) return LOOT_SKILL_SUR;
  const type = String(creatureContext?.creatureType ?? "").toLowerCase();
  if (type === "beast") return LOOT_SKILL_SUR;
  return LOOT_SKILL_INV;
}

export function lootSkillLabel(skillId) {
  if (skillId === LOOT_SKILL_SUR) {
    return game.i18n?.localize?.("LOOTFORGE.Skill.Survival") || "Survival";
  }
  return game.i18n?.localize?.("LOOTFORGE.Skill.Investigation") || "Investigation";
}

export function buildLootSkillFormula(looter, skillId = LOOT_SKILL_INV) {
  const skills = looter?.system?.skills ?? {};
  const skill = skills[skillId]
    ?? (skillId === LOOT_SKILL_SUR ? skills.survival : skills.investigation)
    ?? skills[LOOT_SKILL_INV];
  const mod = Number(skill?.total ?? skill?.mod ?? 0) || 0;
  return `1d20 + ${mod}`;
}

export function buildInvestigationFormula(looter) {
  return buildLootSkillFormula(looter, LOOT_SKILL_INV);
}

export async function rollLootSkillSilent(looter, {
  createMessage = true,
  flavor = null,
  skill = LOOT_SKILL_INV
} = {}) {
  if (!looter) {
    log.error("Missing looter actor for silent loot skill roll");
    return null;
  }

  const skillId = skill === LOOT_SKILL_SUR ? LOOT_SKILL_SUR : LOOT_SKILL_INV;
  const formula = buildLootSkillFormula(looter, skillId);
  log.info("Silent loot skill formula roll", { actorId: looter.id, skill: skillId, formula });

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
          || `${lootSkillLabel(skillId)} (LootForge)`
      });
    }
    return {
      total: Number(roll.total ?? 0),
      natural: Number.isFinite(natural) ? natural : 0,
      isNatural20: natural === 20,
      skill: skillId,
      roll
    };
  } catch (err) {
    log.error("Silent loot skill roll failed", err);
    return null;
  }
}

export async function rollInvestigationSilent(looter, options = {}) {
  return rollLootSkillSilent(looter, { ...options, skill: LOOT_SKILL_INV });
}

export async function rollLootSkill(looter, skill = LOOT_SKILL_INV) {
  if (!looter) {
    log.error("Missing looter actor for loot skill roll");
    return null;
  }

  const skillId = skill === LOOT_SKILL_SUR ? LOOT_SKILL_SUR : LOOT_SKILL_INV;

  if (game.user.isGM) {
    log.info("GM loot skill → silent formula (no roll dialog)", {
      actorId: looter.id,
      skill: skillId
    });
    return rollLootSkillSilent(looter, { skill: skillId });
  }

  log.info("Rolling loot skill", {
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
          skill: skillId,
          roll
        };
      }
      return null;
    } catch (err) {
      log.warn("Actor.rollSkill failed — trying silent formula fallback", err);
      return rollLootSkillSilent(looter, { skill: skillId });
    }
  }

  return rollLootSkillSilent(looter, { skill: skillId });
}

export async function rollInvestigation(looter) {
  return rollLootSkill(looter, LOOT_SKILL_INV);
}
