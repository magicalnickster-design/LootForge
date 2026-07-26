/**
 * Catalog of official dnd5e system Items for chest/container loot.
 *
 * Sources (in priority order):
 *   - dnd5e.equipment24  (SRD 5.2 / modern PHB equipment as shipped by Foundry)
 *   - dnd5e.items        (SRD 5.1 items)
 *   - dnd5e.tradegoods   (SRD trade goods)
 *
 * LootForge does NOT redistribute Player's Handbook text. It clones live
 * documents from the system's licensed/SRD packs at generation time.
 */

import { log } from "./logger.js";

/** Preferred pack collection ids (module.packName). */
export const DEFAULT_SYSTEM_ITEM_PACKS = Object.freeze([
  "dnd5e.equipment24",
  "dnd5e.items",
  "dnd5e.tradegoods"
]);

/** Item document types suitable for chest loot. */
export const CHEST_ITEM_TYPES = Object.freeze([
  "weapon",
  "equipment",
  "consumable",
  "tool",
  "loot",
  "container"
]);

const RARITY_KEYS = Object.freeze([
  "common",
  "uncommon",
  "rare",
  "veryRare",
  "legendary",
  "artifact"
]);

/** @type {null|{ byRarity: Record<string, object[]>, total: number, packs: string[] }} */
let catalogCache = null;

/**
 * @param {string|null|undefined} rarity
 * @returns {string}
 */
export function normalizeItemRarity(rarity) {
  const raw = String(rarity ?? "").trim();
  if (!raw) return "common";
  const compact = raw.toLowerCase().replace(/[\s_-]+/g, "");
  if (compact === "veryrare") return "veryRare";
  if (compact === "common") return "common";
  if (compact === "uncommon") return "uncommon";
  if (compact === "rare") return "rare";
  if (compact === "legendary") return "legendary";
  if (compact === "artifact") return "artifact";
  if (raw === "veryRare") return "veryRare";
  return "common";
}

/**
 * @param {string} name
 * @returns {boolean}
 */
function looksLikeNonLootable(name) {
  const n = String(name ?? "").toLowerCase();
  // Skip class/feature-ish leftovers if a pack is unfiltered.
  return /\b(feature|fighting style|channel divinity|pact of)\b/.test(n);
}

/**
 * Build (and cache) an index of system items by rarity.
 * @param {object} [options]
 * @param {string[]} [options.packKeys]
 * @param {string[]} [options.itemTypes]
 * @param {boolean} [options.forceReload=false]
 */
export async function getSystemItemCatalog({
  packKeys = DEFAULT_SYSTEM_ITEM_PACKS,
  itemTypes = CHEST_ITEM_TYPES,
  forceReload = false
} = {}) {
  if (catalogCache && !forceReload) return catalogCache;

  const typeSet = new Set(itemTypes);
  /** @type {Record<string, object[]>} */
  const byRarity = Object.fromEntries(RARITY_KEYS.map((k) => [k, []]));
  const seen = new Set();
  const usedPacks = [];

  for (const packKey of packKeys) {
    const pack = game.packs?.get?.(packKey);
    if (!pack || pack.documentName !== "Item") continue;

    try {
      // Prefer getIndex when available (Foundry 11+).
      const index = typeof pack.getIndex === "function"
        ? await pack.getIndex({ fields: ["name", "type", "img", "system.rarity", "system.type"] })
        : pack.index;

      let added = 0;
      for (const entry of index) {
        if (!typeSet.has(entry.type)) continue;
        if (looksLikeNonLootable(entry.name)) continue;
        const uuid = entry.uuid || `Compendium.${packKey}.Item.${entry._id}`;
        if (seen.has(uuid)) continue;
        seen.add(uuid);

        const rarity = normalizeItemRarity(entry.system?.rarity);
        byRarity[rarity].push({
          uuid,
          packKey,
          id: entry._id,
          name: entry.name,
          type: entry.type,
          img: entry.img,
          rarity
        });
        added += 1;
      }
      usedPacks.push(packKey);
      log.debug(`System item catalog: ${packKey} → ${added} lootable entries`);
    } catch (err) {
      log.warn(`Failed to index system pack ${packKey}`, err);
    }
  }

  const total = Object.values(byRarity).reduce((n, arr) => n + arr.length, 0);
  catalogCache = { byRarity, total, packs: usedPacks };
  log.info(`System item catalog ready: ${total} items from [${usedPacks.join(", ")}]`);
  return catalogCache;
}

/**
 * Clear catalog cache (e.g. after packs reload).
 */
export function clearSystemItemCatalog() {
  catalogCache = null;
}

/**
 * Weighted rarity pick, falling back to denser lower tiers if a bucket is empty.
 * @param {Record<string, number>} weights
 * @param {Record<string, object[]>} byRarity
 * @param {() => number} [rng]
 * @returns {string|null}
 */
export function pickRarityBucket(weights, byRarity, rng = Math.random) {
  const entries = Object.entries(weights || {})
    .filter(([key, w]) => Number(w) > 0 && (byRarity[key]?.length ?? 0) > 0);
  if (!entries.length) {
    // Fallback: densest available bucket in common→artifact order.
    for (const key of RARITY_KEYS) {
      if (byRarity[key]?.length) return key;
    }
    return null;
  }
  const total = entries.reduce((sum, [, w]) => sum + Number(w), 0);
  let roll = rng() * total;
  for (const [key, weight] of entries) {
    roll -= Number(weight);
    if (roll <= 0) return key;
  }
  return entries.at(-1)?.[0] ?? null;
}

/**
 * @param {object[]} list
 * @param {() => number} [rng]
 * @returns {object|null}
 */
export function pickRandomEntry(list, rng = Math.random) {
  if (!list?.length) return null;
  return list[Math.floor(rng() * list.length)] ?? null;
}
