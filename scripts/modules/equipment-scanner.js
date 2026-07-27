import { isLootForgeItem } from "./loot-storage.js";

export function classifyInventoryItem(item) {
  if (!item) return null;
  if (isLootForgeItem(item)) return null;

  const type = String(item.type ?? "");
  const typeValue = String(item.system?.type?.value ?? "").toLowerCase();

  if (typeValue === "natural") return null;

  if (type === "weapon") {
    return "weapon";
  }

  if (type === "equipment") {
    if (typeValue === "shield") return "shield";
    if (["light", "medium", "heavy", "clothing"].includes(typeValue)) return "armor";
    return "other";
  }

  if (type === "consumable") return "consumable";
  if (type === "tool") return "tool";
  if (type === "container") return "container";

  if (type === "loot") return "other";
  return null;
}

export function scanActorEquipment(actor) {
  if (!actor?.items?.contents && !actor?.items) return [];
  const items = actor.items.contents ?? [...actor.items];
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
