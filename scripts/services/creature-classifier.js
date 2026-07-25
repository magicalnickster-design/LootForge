/**
 * Classify a dnd5e actor as Search (Investigation) or Harvest (Survival).
 *
 * Creature type is read from actor.system.details.type.value (NPC data model).
 */

/** Types that carry possessions / are typically searched. */
const SEARCH_TYPES = new Set(["humanoid", "giant"]);

/** Types that are harvested for materials. */
const HARVEST_TYPES = new Set([
  "beast",
  "monstrosity",
  "dragon",
  "aberration",
  "plant",
  "ooze",
  "undead",
  "fiend",
  "celestial",
  "elemental",
  "fey"
]);

/**
 * @typedef {"search"|"harvest"} InteractionType
 */

/**
 * @typedef {object} ClassificationResult
 * @property {InteractionType} interaction
 * @property {string} skill          dnd5e skill abbreviation ("inv" | "sur")
 * @property {string} creatureType   raw type value, or "unknown"
 * @property {number} cr
 */

/**
 * @param {Actor} actor
 * @returns {ClassificationResult}
 */
export function classifyCreature(actor) {
  const creatureType = String(actor?.system?.details?.type?.value ?? "unknown").toLowerCase();
  const cr = Number(actor?.system?.details?.cr ?? 0);

  if (SEARCH_TYPES.has(creatureType)) {
    return {
      interaction: "search",
      skill: "inv",
      creatureType,
      cr: Number.isFinite(cr) ? cr : 0
    };
  }

  // Default unknown types to harvest for the prototype so beasts without a
  // filled type field still work during testing.
  if (HARVEST_TYPES.has(creatureType) || creatureType === "unknown" || !creatureType) {
    return {
      interaction: "harvest",
      skill: "sur",
      creatureType: creatureType || "unknown",
      cr: Number.isFinite(cr) ? cr : 0
    };
  }

  // Fallback: treat unrecognized configured types as search (intelligent-ish).
  return {
    interaction: "search",
    skill: "inv",
    creatureType,
    cr: Number.isFinite(cr) ? cr : 0
  };
}

/**
 * Whether a token/actor is considered defeated for looting.
 * Uses the core "dead" status effect applied via the Token HUD.
 *
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function isDefeated(tokenDoc) {
  if (!tokenDoc) return false;
  if (typeof tokenDoc.hasStatusEffect === "function" && tokenDoc.hasStatusEffect("dead")) {
    return true;
  }

  // Fallback: HP at 0 or below on the synthetic/base actor.
  const hp = tokenDoc.actor?.system?.attributes?.hp?.value;
  return Number.isFinite(hp) && hp <= 0;
}
