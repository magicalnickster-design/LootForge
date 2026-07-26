/**
 * Resolve which character is looting / should receive assigned loot.
 */

import { log } from "./logger.js";

/**
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

  consider(game.user.character);

  for (const token of canvas.tokens?.controlled ?? []) consider(token.actor);
  for (const token of canvas.tokens?.placeables ?? []) consider(token.actor);

  if (byId.size === 0) {
    for (const actor of game.actors ?? []) consider(actor);
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * @param {Actor[]} candidates
 * @returns {Promise<Actor|null>}
 */
async function promptLooterChoice(candidates) {
  const escape = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

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
  return candidates.find((a) => a.id === looterId) ?? game.actors.get(looterId) ?? null;
}

/**
 * @param {object} [options]
 * @param {Actor|null} [options.excludeActor]
 * @param {boolean} [options.forcePrompt=false]
 * @returns {Promise<Actor|null>}
 */
export async function resolveLooterActor({ excludeActor = null, forcePrompt = false } = {}) {
  if (!forcePrompt && game.user.character && game.user.character.id !== excludeActor?.id) {
    return game.user.character;
  }

  const controlledCharacters = [...new Map(
    (canvas.tokens?.controlled ?? [])
      .map((t) => t.actor)
      .filter((actor) => actor?.type === "character" && (actor.isOwner || game.user.isGM)
        && actor.id !== excludeActor?.id)
      .map((actor) => [actor.id, actor])
  ).values()];

  if (!forcePrompt && controlledCharacters.length === 1) return controlledCharacters[0];

  const candidates = getLooterCandidates(excludeActor);
  if (!candidates.length) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoLooter"));
    log.warn("No eligible player characters found");
    return null;
  }
  if (!forcePrompt && candidates.length === 1) return candidates[0];

  return promptLooterChoice(candidates);
}

/**
 * Users who own a given actor (for assignment notifications).
 * @param {Actor} actor
 * @returns {User[]}
 */
export function ownersOfActor(actor) {
  if (!actor) return [];
  return game.users.filter((user) => {
    if (user.isGM) return false;
    return actor.testUserPermission(user, "OWNER");
  });
}
