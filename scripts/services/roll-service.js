/**
 * Request a dnd5e skill roll from the looting player character and read results.
 *
 * dnd5e 4.1+ / 5.x signature:
 *   actor.rollSkill({ skill: "sur" }, dialog, message) -> Promise<D20Roll[]|null>
 */

/**
 * @typedef {object} LootRollResult
 * @property {number} total
 * @property {number} natural
 * @property {boolean} isNatural20
 * @property {object} roll
 */

/**
 * Resolve which actor should perform the loot skill check.
 * Prefer the user's assigned character; otherwise a single owned selected character.
 *
 * @returns {Actor|null}
 */
export function getLooterActor() {
  if (game.user.character) return game.user.character;

  const ownedCharacters = canvas.tokens?.controlled
    ?.map((t) => t.actor)
    .filter((actor) => actor && actor.type === "character" && actor.isOwner) ?? [];

  // De-duplicate linked tokens of the same actor.
  const unique = [...new Map(ownedCharacters.map((a) => [a.id, a])).values()];
  if (unique.length === 1) return unique[0];
  return null;
}

/**
 * @param {Actor} looter
 * @param {string} skill  dnd5e skill key, e.g. "sur" or "inv"
 * @returns {Promise<LootRollResult|null>}
 */
export async function rollLootSkill(looter, skill) {
  if (!looter?.rollSkill) {
    console.error("LootForge | Looter actor does not support rollSkill", looter);
    return null;
  }

  // Let dnd5e show its normal skill dialog so players can apply situational bonuses.
  const rolls = await looter.rollSkill({ skill }, {}, { create: true });

  if (!rolls?.length) return null;

  const roll = rolls[0];
  const total = Number(roll.total ?? 0);

  // Prefer the kept d20 face from dnd5e's D20Roll helper when available.
  let natural = Number(roll.d20?.total);
  if (!Number.isFinite(natural)) {
    const die = roll.dice?.find((d) => d.faces === 20) ?? roll.terms?.find((t) => t.faces === 20);
    natural = Number(die?.total ?? die?.results?.find((r) => r.active)?.result ?? 0);
  }

  const isNatural20 = Boolean(roll.isCritical) || natural === 20;

  return {
    total,
    natural: Number.isFinite(natural) ? natural : 0,
    isNatural20,
    roll
  };
}
