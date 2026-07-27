/**
 * Normalized creature context for loot generation.
 * Safe against missing DDB / incomplete actor data.
 */

import { MODULE_ID } from "./constants.js";
import { log } from "./logger.js";
import { isLootContainerActor } from "./world-actors.js";

/**
 * @typedef {object} CreatureContext
 * @property {string|null} actorId
 * @property {string|null} tokenId
 * @property {string|null} sceneId
 * @property {string} name
 * @property {string} image
 * @property {string} actorType
 * @property {string} creatureType
 * @property {string} creatureSubtype
 * @property {number} challengeRating
 * @property {string} size
 * @property {boolean} isDead
 * @property {boolean} isContainer
 * @property {boolean} isNamed
 * @property {boolean} isBoss
 * @property {string[]} environmentTags
 * @property {string[]} factionTags
 * @property {string[]} equipmentTags
 * @property {boolean} isWolf
 * @property {boolean} isBeast
 */

/**
 * @param {Actor|null} actor
 * @param {TokenDocument|Token|null} token
 * @param {Scene|null} [scene]
 * @returns {CreatureContext}
 */
export function buildCreatureContext(actor, token, scene = null) {
  const tokenDoc = token?.document ?? token ?? null;
  const resolvedActor = actor ?? tokenDoc?.actor ?? null;
  const resolvedScene = scene ?? tokenDoc?.parent ?? canvas?.scene ?? null;

  const details = resolvedActor?.system?.details ?? {};
  const typeData = details.type ?? {};

  const creatureType = String(typeData.value ?? typeData ?? "unknown").toLowerCase() || "unknown";
  const creatureSubtype = String(typeData.subtype ?? typeData.custom ?? "").toLowerCase();
  const name = String(resolvedActor?.name ?? tokenDoc?.name ?? "Unknown");
  const nameLower = name.toLowerCase();

  let challengeRating = Number(details.cr);
  if (!Number.isFinite(challengeRating)) challengeRating = 0;

  const size = String(resolvedActor?.system?.traits?.size ?? "med");

  const isDead = isCreatureDead(tokenDoc, resolvedActor);
  const isContainer = isLootContainerActor(resolvedActor)
    || Boolean(tokenDoc?.getFlag?.(MODULE_ID, "isContainer"));
  // True wolves only — not wolf spiders, werewolves, or worgs.
  const isWolf = isActualWolf(nameLower, creatureSubtype);
  const isBeast = !isContainer && (creatureType === "beast" || isWolf);
  const isNamed = looksNamed(name, creatureType);
  const isBoss = Boolean(details.legendary?.value) || /alpha|elder|ancient|dire/i.test(name);

  const context = {
    actorId: resolvedActor?.id ?? null,
    tokenId: tokenDoc?.id ?? null,
    sceneId: resolvedScene?.id ?? null,
    name,
    image: resolvedActor?.img || tokenDoc?.texture?.src || "icons/svg/mystery-man.svg",
    actorType: String(resolvedActor?.type ?? "unknown"),
    creatureType,
    creatureSubtype,
    challengeRating,
    size,
    isDead,
    isContainer,
    isNamed,
    isBoss,
    environmentTags: inferEnvironmentTags(resolvedScene),
    factionTags: [],
    equipmentTags: [],
    isWolf,
    isBeast
  };

  log.debug("Creature context", context);
  return context;
}

/**
 * @param {TokenDocument|null} tokenDoc
 * @param {Actor|null} actor
 * @returns {boolean}
 */
export function isCreatureDead(tokenDoc, actor = null) {
  try {
    if (tokenDoc && typeof tokenDoc.hasStatusEffect === "function" && tokenDoc.hasStatusEffect("dead")) {
      return true;
    }
  } catch (err) {
    log.debug("hasStatusEffect failed", err);
  }

  const hp = actor?.system?.attributes?.hp?.value ?? tokenDoc?.actor?.system?.attributes?.hp?.value;
  return Number.isFinite(hp) && hp <= 0;
}

/**
 * True for LootForge Chest / Container actors (and tokens flagged as containers).
 * @param {TokenDocument|null} tokenDoc
 * @param {Actor|null} [actor]
 * @returns {boolean}
 */
export function isLootContainer(tokenDoc, actor = null) {
  const resolved = actor ?? tokenDoc?.actor ?? null;
  if (isLootContainerActor(resolved)) return true;
  try {
    if (tokenDoc?.getFlag?.(MODULE_ID, "isContainer")) return true;
  } catch {
    // ignore
  }
  return Boolean(tokenDoc?.flags?.[MODULE_ID]?.isContainer);
}

/**
 * Anything players may loot: dead creatures OR LootForge containers.
 * @param {TokenDocument|null} tokenDoc
 * @param {Actor|null} [actor]
 * @returns {boolean}
 */
export function isLootableTarget(tokenDoc, actor = null) {
  const resolved = actor ?? tokenDoc?.actor ?? null;
  if (isLootContainer(tokenDoc, resolved)) return true;
  return isCreatureDead(tokenDoc, resolved);
}

/**
 * @param {string} nameLower
 * @param {string} subtypeLower
 * @returns {boolean}
 */
function isActualWolf(nameLower, subtypeLower) {
  const hay = `${nameLower} ${subtypeLower}`;
  if (!/\bwolf\b/.test(hay)) return false;
  if (/\bspider\b/.test(hay)) return false;
  if (/\bwerewolf\b/.test(hay)) return false;
  if (/\bworg\b/.test(hay)) return false;
  return true;
}

/**
 * Heuristic: "Wolf" / "Wolf 3" are generic; "Fenrir" style names are named.
 * @param {string} name
 * @param {string} creatureType
 * @returns {boolean}
 */
function looksNamed(name, creatureType) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  // Generic numbered tokens: Wolf, Wolf (2), Wolf 3
  if (/^.+\s*\(?\d+\)?$/.test(trimmed)) return false;
  if (trimmed.toLowerCase() === creatureType) return false;
  // Single common noun often means SRD stock creature.
  const stock = new Set([
    "wolf",
    "dire wolf",
    "worg",
    "spider",
    "giant spider",
    "giant wolf spider",
    "wolf spider",
    "phase spider",
    "animated armor",
    "animated armour",
    "flying sword",
    "helmed horror",
    "flesh golem",
    "clay golem",
    "stone golem",
    "iron golem",
    "shield guardian",
    "goblin",
    "bugbear",
    "orc",
    "orc war chief",
    "orog",
    "zombie",
    "skeleton",
    "mummy",
    "mummy lord",
    "lich",
    "demilich",
    "human",
    "elf",
    "dwarf",
    "halfling",
    "imp",
    "quasit",
    "hell hound",
    "hellhound",
    "barbed devil",
    "bearded devil",
    "chain devil",
    "bone devil",
    "horned devil",
    "pit fiend",
    "balor",
    "pixie",
    "dryad",
    "satyr",
    "redcap",
    "hag",
    "green hag",
    "night hag",
    "sea hag",
    "owlbear",
    "basilisk",
    "cockatrice",
    "chimera",
    "griffon",
    "griffin",
    "manticore",
    "hydra",
    "bulette",
    "ankheg",
    "purple worm",
    "mimic",
    "roper",
    "hill giant",
    "stone giant",
    "frost giant",
    "fire giant",
    "cloud giant",
    "storm giant",
    "fire elemental",
    "water elemental",
    "earth elemental",
    "air elemental",
    "myrmidon",
    "fire elemental myrmidon",
    "water elemental myrmidon",
    "earth elemental myrmidon",
    "air elemental myrmidon",
    "mind flayer",
    "illithid",
    "intellect devourer",
    "beholder",
    "death tyrant",
    "aboleth",
    "carrion crawler",
    "chuul",
    "gibbering mouther",
    "gray ooze",
    "grey ooze",
    "gelatinous cube",
    "black pudding",
    "ochre jelly",
    "dragon turtle",
    "faerie dragon",
    "pseudodragon",
    "chest",
    "container"
  ]);
  if (stock.has(trimmed.toLowerCase())) return false;
  // Stock dragon age forms: "Adult Red Dragon", "Young White Dragon", "Ancient Gold Dragon"
  if (/^(wyrmling|young|adult|ancient)\s+\w+\s+dragon$/i.test(trimmed)) return false;
  if (/^(wyrmling|young|adult|ancient)\s+dragon$/i.test(trimmed)) return false;
  return true;
}

/**
 * @param {Scene|null} scene
 * @returns {string[]}
 */
function inferEnvironmentTags(scene) {
  if (!scene) return [];
  const hay = `${scene.name ?? ""} ${scene.navName ?? ""}`.toLowerCase();
  const tags = [];
  if (/forest|wood|grove/.test(hay)) tags.push("forest");
  if (/cave|mine|underdark/.test(hay)) tags.push("cave");
  if (/snow|ice|tundra|winter/.test(hay)) tags.push("arctic");
  if (/swamp|marsh/.test(hay)) tags.push("swamp");
  return tags;
}
