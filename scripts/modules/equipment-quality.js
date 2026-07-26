/**
 * Dynamic equipment quality — applied at generation time via metadata.
 * No separate compendium entries per quality.
 */

/** @typedef {"broken"|"worn"|"standard"|"fine"|"masterwork"} EquipmentQuality */

/**
 * @type {Record<EquipmentQuality, {
 *   label: string|null,
 *   priceMult: number,
 *   blurb: string
 * }>}
 */
export const EQUIPMENT_QUALITIES = {
  broken: {
    label: "Broken",
    priceMult: 0.1,
    blurb: "This piece is badly damaged and barely holds together."
  },
  worn: {
    label: "Worn",
    priceMult: 0.45,
    blurb: "Poorly maintained — scuffed, notched, and long overdue for care."
  },
  standard: {
    label: null,
    priceMult: 1,
    blurb: ""
  },
  fine: {
    label: "Fine",
    priceMult: 1.75,
    blurb: "Well kept and clearly valued by its previous owner."
  },
  masterwork: {
    label: "Masterwork",
    priceMult: 3,
    blurb: "Exceptional craftsmanship for goblin-make — sturdy and carefully finished."
  }
};

/**
 * Weighted random quality pick.
 * @param {Record<string, number>} weights
 * @param {() => number} [rng]
 * @returns {EquipmentQuality}
 */
export function pickEquipmentQuality(weights, rng = Math.random) {
  const entries = Object.entries(weights || {}).filter(([, w]) => Number(w) > 0);
  if (!entries.length) return "standard";
  const total = entries.reduce((sum, [, w]) => sum + Number(w), 0);
  let roll = rng() * total;
  for (const [key, weight] of entries) {
    roll -= Number(weight);
    if (roll <= 0) return /** @type {EquipmentQuality} */ (key);
  }
  return /** @type {EquipmentQuality} */ (entries.at(-1)?.[0] ?? "standard");
}

/**
 * Apply quality to cloned item create-data (mutates a copy).
 *
 * @param {object} itemData  Item create-data (already cloned)
 * @param {EquipmentQuality} quality
 * @param {object} [meta]
 * @param {string} [meta.sourceCreature]
 * @returns {object}
 */
export function applyEquipmentQuality(itemData, quality, { sourceCreature = "" } = {}) {
  const q = EQUIPMENT_QUALITIES[quality] ?? EQUIPMENT_QUALITIES.standard;
  const baseName = String(itemData.name ?? "Item");
  const displayName = q.label ? `${q.label} ${baseName}` : baseName;

  const data = foundry.utils.duplicate
    ? foundry.utils.duplicate(itemData)
    : JSON.parse(JSON.stringify(itemData));

  data.name = displayName;
  data.system ??= {};

  const price = Number(data.system.price?.value ?? data.system.price ?? 0);
  if (Number.isFinite(price) && data.system.price && typeof data.system.price === "object") {
    data.system.price.value = Math.max(0, Math.round(price * q.priceMult * 100) / 100);
  }

  if (q.blurb) {
    const existing = String(data.system.description?.value ?? "");
    const block = `<p><em>${q.blurb}</em></p>`;
    data.system.description = {
      ...(data.system.description ?? {}),
      value: `${block}${existing}`,
      chat: q.blurb
    };
  }

  data.flags ??= {};
  data.flags.lootforge = {
    ...(data.flags.lootforge ?? {}),
    kind: "equipment",
    equipmentQuality: quality,
    baseName,
    sourceCreature: sourceCreature || data.flags.lootforge?.sourceCreature || "",
    generatedByLootForge: true,
    // Unique stacking key — equipment drops should not merge.
    stackingKey: `equip-${quality}-${baseName}-${foundry.utils.randomID?.(8) ?? Math.random().toString(36).slice(2, 10)}`
  };

  return data;
}

/**
 * Format a vendor value string from item data.
 * @param {object} itemData
 * @returns {string}
 */
export function formatItemValueText(itemData) {
  const price = itemData?.system?.price;
  if (!price) return "—";
  const value = Number(price.value ?? 0);
  const den = price.denomination || "gp";
  if (!Number.isFinite(value)) return "—";
  return `${value} ${den}`;
}
