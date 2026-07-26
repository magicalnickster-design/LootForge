/**
 * Scan an actor inventory for lootable equipment categories.
 * No creature-specific hardcoding — works for SRD, DDB, and custom NPCs.
 */

import { isLootForgeItem } from "./loot-storage.js";

/**
 * @typedef {"weapon"|"armor"|"shield"|"consumable"|"tool"|"container"|"other"} EquipmentCategory
 */

/**
 * @typedef {object} ScannedEquipment
 * @property {Item} item
 * @property {EquipmentCategory} category
 */

/**
 * @param {Item} item
 * @returns {EquipmentCategory|null}  null = not eligible for equipment loot
 */
export function classifyInventoryItem(item) {
  if (!item) return null;
  if (isLootForgeItem(item)) return null;

  const type = String(item.type ?? "");
  const typeValue = String(item.system?.type?.value ?? "").toLowerCase();

  // Skip natural / innate attacks.
  if (typeValue === "natural") return null;

  if (type === "weapon") {
    return "weapon";
  }

  if (type === "equipment") {
    if (typeValue === "shield") return "shield";
    if (["light", "medium", "heavy", "clothing"].includes(typeValue)) return "armor";
    // Focus, wondrous, etc.
    return "other";
  }

  if (type === "consumable") return "consumable";
  if (type === "tool") return "tool";
  if (type === "container") return "container";

  // Ignore spells, feats, class features, loot already on the actor, etc.
  if (type === "loot") return "other";
  return null;
}

/**
 * @param {Actor|null} actor
 * @returns {ScannedEquipment[]}
 */
export function scanActorEquipment(actor) {
  if (!actor?.items?.contents && !actor?.items) return [];
  const items = actor.items.contents ?? [...actor.items];
  /** @type {ScannedEquipment[]} */
  const out = [];

  for (const item of items) {
    const qty = Number(item.system?.quantity ?? 1);
    if (!(qty > 0)) continue;
    const category = classifyInventoryItem(item);
    if (!category) continue;
    out.push({ item, category });
  }

  return out;
}
