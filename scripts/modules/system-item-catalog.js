import { log } from "./logger.js";

export const DEFAULT_SYSTEM_ITEM_PACKS = Object.freeze([
  "dnd5e.equipment24",
  "dnd5e.items",
  "dnd5e.tradegoods"
]);

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

let catalogCache = null;

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

function looksLikeNonLootable(name) {
  const n = String(name ?? "").toLowerCase();
  return /\b(feature|fighting style|channel divinity|pact of)\b/.test(n);
}

export async function getSystemItemCatalog({
  packKeys = DEFAULT_SYSTEM_ITEM_PACKS,
  itemTypes = CHEST_ITEM_TYPES,
  forceReload = false
} = {}) {
  if (catalogCache && !forceReload) return catalogCache;

  const typeSet = new Set(itemTypes);
  const byRarity = Object.fromEntries(RARITY_KEYS.map((k) => [k, []]));
  const seen = new Set();
  const usedPacks = [];

  for (const packKey of packKeys) {
    const pack = game.packs?.get?.(packKey);
    if (!pack || pack.documentName !== "Item") continue;

    try {
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

export function clearSystemItemCatalog() {
  catalogCache = null;
}

export function pickRarityBucket(weights, byRarity, rng = Math.random) {
  const entries = Object.entries(weights || {})
    .filter(([key, w]) => Number(w) > 0 && (byRarity[key]?.length ?? 0) > 0);
  if (!entries.length) {
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

export function pickRandomEntry(list, rng = Math.random) {
  if (!list?.length) return null;
  return list[Math.floor(rng() * list.length)] ?? null;
}
