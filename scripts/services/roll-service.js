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
 * Collect character actors that can perform a loot roll for the current user.
 * Excludes the corpse being looted.
 *
 * @param {Actor|null} [excludeActor=null]
 * @returns {Actor[]}
 */
export function getLooterCandidates(excludeActor = null) {
  const byId = new Map();
  const excludeId = excludeActor?.id;

  const consider = (actor) => {
    if (!actor || actor.type !== "character") return;
    if (excludeId && actor.id === excludeId) return;
    if (!actor.isOwner && !game.user.isGM) return;
    byId.set(actor.id, actor);
  };

  // 1. Assigned character for this user.
  consider(game.user.character);

  // 2. Controlled character tokens (ignore NPC corpses).
  for (const token of canvas.tokens?.controlled ?? []) {
    consider(token.actor);
  }

  // 3. Character tokens currently on the scene (best GM test candidates).
  for (const token of canvas.tokens?.placeables ?? []) {
    consider(token.actor);
  }

  // 4. If still empty, fall back to owned/world characters.
  if (byId.size === 0) {
    for (const actor of game.actors ?? []) {
      consider(actor);
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Prompt the user to choose which character performs the loot roll.
 * @param {Actor[]} candidates
 * @returns {Promise<Actor|null>}
 */
async function promptLooterChoice(candidates) {
  const escape = foundry.utils.escapeHTML
    ?? ((value) => String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;"));

  const options = candidates
    .map((actor) => `<option value="${actor.id}">${escape(actor.name)}</option>`)
    .join("");

  const content = `
    <p>${game.i18n.localize("LOOTFORGE.Dialog.ChooseLooterHint")}</p>
    <div class="form-group">
      <label for="lootforge-looter">${game.i18n.localize("LOOTFORGE.Dialog.ChooseLooter")}</label>
      <select id="lootforge-looter" name="looterId">${options}</select>
    </div>
  `;

  const looterId = await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.localize("LOOTFORGE.Dialog.ChooseLooterTitle") },
    content,
    ok: {
      label: "LOOTFORGE.HUD.LootBody",
      icon: "fa-solid fa-sack",
      callback: (_event, button) => button.form.elements.looterId?.value ?? null
    },
    rejectClose: false
  });

  if (!looterId) return null;
  return candidates.find((actor) => actor.id === looterId) ?? game.actors.get(looterId) ?? null;
}

/**
 * Resolve which actor should perform the loot skill check.
 * GMs usually have no assigned character and may have the corpse selected,
 * so this prompts when needed.
 *
 * @param {object} [options]
 * @param {Actor|null} [options.excludeActor]  Corpse actor to exclude from candidates
 * @returns {Promise<Actor|null>}
 */
export async function resolveLooterActor({ excludeActor = null } = {}) {
  // Fast path: assigned character.
  if (game.user.character && game.user.character.id !== excludeActor?.id) {
    return game.user.character;
  }

  // Fast path: exactly one controlled character that isn't the corpse.
  const controlledCharacters = [...new Map(
    (canvas.tokens?.controlled ?? [])
      .map((t) => t.actor)
      .filter((actor) => actor?.type === "character" && actor.isOwner && actor.id !== excludeActor?.id)
      .map((actor) => [actor.id, actor])
  ).values()];
  if (controlledCharacters.length === 1) return controlledCharacters[0];

  const candidates = getLooterCandidates(excludeActor);
  if (candidates.length === 0) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoLooter"));
    return null;
  }
  if (candidates.length === 1) return candidates[0];

  return promptLooterChoice(candidates);
}

/**
 * @deprecated Prefer resolveLooterActor(); kept for any external callers.
 * @returns {Actor|null}
 */
export function getLooterActor() {
  if (game.user.character) return game.user.character;

  const ownedCharacters = canvas.tokens?.controlled
    ?.map((t) => t.actor)
    .filter((actor) => actor && actor.type === "character" && actor.isOwner) ?? [];

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
