/**
 * Generate corpse loot from creature profiles.
 *
 * Supports:
 * - Legacy `drops[]` profiles (wolf, spider, animated armor) — unchanged behaviour
 * - Multi-pool `pools` profiles (goblin, …) — generic pool runners
 */

import {
  buildItemSnapshot,
  formatDefinitionValue,
  getLootDefinition
} from "../data/loot-definitions.js";
import { resolveCreatureProfile } from "../data/creature-profiles.js";
import {
  applyEquipmentQuality,
  formatItemValueText,
  pickEquipmentQuality
} from "./equipment-quality.js";
import { scanActorEquipment } from "./equipment-scanner.js";
import { getSetting } from "./settings.js";
import { log } from "./logger.js";
import { MODULE_ID } from "./constants.js";

const QUALITY_ORDER = ["poor", "standard", "good", "excellent", "exceptional"];

const CURRENCY_META = {
  cp: {
    name: "Copper",
    img: `modules/${MODULE_ID}/assets/items/currency-cp.svg`,
    description: "Loose copper coins pulled from a pouch or pocket."
  },
  sp: {
    name: "Silver",
    img: `modules/${MODULE_ID}/assets/items/currency-sp.svg`,
    description: "A handful of silver coins."
  },
  ep: {
    name: "Electrum",
    img: `modules/${MODULE_ID}/assets/items/currency-ep.svg`,
    description: "A few electrum coins."
  },
  gp: {
    name: "Gold",
    img: `modules/${MODULE_ID}/assets/items/currency-gp.svg`,
    description: "A rare glint of gold among the pocket change."
  },
  pp: {
    name: "Platinum",
    img: `modules/${MODULE_ID}/assets/items/currency-pp.svg`,
    description: "A platinum piece — unusual for common folk."
  }
};

/**
 * Map a skill total to roll quality.
 * @param {number} total
 * @returns {string}
 */
export function qualityFromSurvivalTotal(total) {
  const n = Number(total) || 0;
  if (n >= 25) return "exceptional";
  if (n >= 20) return "excellent";
  if (n >= 15) return "good";
  if (n >= 10) return "standard";
  return "poor";
}

/**
 * @param {string} quality
 * @param {number} [steps=1]
 * @returns {string}
 */
function bumpQuality(quality, steps = 1) {
  const idx = QUALITY_ORDER.indexOf(quality);
  if (idx < 0) return quality;
  return QUALITY_ORDER[Math.min(idx + steps, QUALITY_ORDER.length - 1)];
}

/**
 * @param {object} drop
 * @param {string} rollQuality
 * @returns {string|null}
 */
function resolveDropDefinitionId(drop, rollQuality) {
  if (drop?.definitionByQuality) {
    return drop.definitionByQuality[rollQuality]
      ?? drop.definitionByQuality.standard
      ?? Object.values(drop.definitionByQuality)[0]
      ?? null;
  }
  return drop?.definitionId ?? null;
}

function randomUniform() {
  const cfg = globalThis.CONFIG;
  if (typeof cfg?.Dice?.randomUniform === "function") return cfg.Dice.randomUniform();
  return Math.random();
}

function randomInt(min, max) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(randomUniform() * (hi - lo + 1)) + lo;
}

function chanceSucceeds(chance) {
  if (chance >= 1) return true;
  if (chance <= 0) return false;
  return randomUniform() < chance;
}

function applyContextQuantityBonus(qty, context, { allowBonus = true } = {}) {
  if (!allowBonus) return Math.max(0, qty);
  let result = qty;
  if (context?.size === "lg" || context?.size === "huge") result += 1;
  if (context?.isBoss || context?.isNamed) {
    if (chanceSucceeds(0.5)) result += 1;
  }
  return Math.max(0, result);
}

function emptyCurrency() {
  return { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
}

/**
 * Build a stored corpse loot entry from a definition + quantity.
 * @param {string} definitionId
 * @param {number} quantity
 * @returns {Promise<import("./loot-storage.js").CorpseLootItem|null>}
 */
export async function buildLootEntry(definitionId, quantity) {
  const def = getLootDefinition(definitionId);
  if (!def || quantity <= 0) return null;

  const itemData = await buildItemSnapshot(def);

  return {
    entryId: foundry.utils.randomID(),
    kind: "item",
    definitionId: def.id,
    itemUuid: def.itemUuid,
    quantity: Math.floor(quantity),
    name: itemData.name || def.name,
    img: itemData.img || def.img,
    rarity: def.rarity,
    valueText: formatDefinitionValue(def),
    description: def.description,
    itemData
  };
}

/**
 * @param {string} denom
 * @param {number} amount
 * @returns {import("./loot-storage.js").CorpseLootItem|null}
 */
export function buildCurrencyEntry(denom, amount) {
  const key = String(denom || "").toLowerCase();
  const qty = Math.floor(Number(amount) || 0);
  if (!CURRENCY_META[key] || qty <= 0) return null;
  const meta = CURRENCY_META[key];
  const currency = emptyCurrency();
  currency[key] = qty;

  return {
    entryId: foundry.utils.randomID(),
    kind: "currency",
    definitionId: `currency-${key}`,
    quantity: 1,
    name: `${qty} ${meta.name}`,
    img: meta.img,
    rarity: "common",
    valueText: `${qty} ${key}`,
    description: meta.description,
    currency,
    itemData: null
  };
}

/**
 * Aggregate currency from corpse entries.
 * @param {import("./loot-storage.js").CorpseLootItem[]} items
 * @returns {object}
 */
export function aggregateCurrencyFromItems(items) {
  const total = emptyCurrency();
  for (const entry of items ?? []) {
    if (entry?.kind !== "currency" || !entry.currency) continue;
    for (const key of Object.keys(total)) {
      total[key] += Math.max(0, Math.floor(Number(entry.currency[key]) || 0));
    }
  }
  return total;
}

/**
 * Legacy flat `drops[]` generation (wolf / spider / animated armor).
 */
async function generateFromDrops(profile, {
  context,
  rollQuality,
  isNatural20
}) {
  const enableRare = getSetting("enableRareDrops");
  /** @type {import("./loot-storage.js").CorpseLootItem[]} */
  const items = [];
  const fallbackDefs = [];

  for (const drop of profile.drops ?? []) {
    if (drop.rare && !enableRare) continue;

    const definitionId = resolveDropDefinitionId(drop, rollQuality);
    if (!definitionId) continue;

    const range = drop.quantityByQuality?.[rollQuality] ?? [0, 0];
    const chance = drop.chanceByQuality?.[rollQuality] ?? 1;
    if (drop.guaranteedFallback) fallbackDefs.push(definitionId);

    if (!chanceSucceeds(chance)) continue;

    const fixedSingle = Boolean(drop.definitionByQuality)
      || (range[0] === 1 && range[1] === 1);
    let qty = randomInt(range[0], range[1]);
    qty = applyContextQuantityBonus(qty, context, { allowBonus: !fixedSingle });
    if (isNatural20 && qty > 0 && !drop.definitionByQuality) qty += 1;
    if (drop.definitionByQuality) qty = Math.min(1, Math.max(0, qty));

    const entry = await buildLootEntry(definitionId, qty);
    if (entry) items.push(entry);
  }

  if (!items.length && fallbackDefs.length) {
    const entry = await buildLootEntry(fallbackDefs[0], 1);
    if (entry) items.push(entry);
  }

  const nat20BonusId = profile.nat20BonusDefinitionId;
  if (isNatural20 && nat20BonusId && !items.some((i) => i.definitionId === nat20BonusId)) {
    const bonus = await buildLootEntry(nat20BonusId, 1);
    if (bonus) items.push(bonus);
  }

  return { items, currency: emptyCurrency() };
}

/**
 * @param {object[]} drops
 * @param {object} options
 */
async function runDefinitionsPool(drops, {
  context,
  rollQuality,
  isNatural20,
  enableRare
}) {
  /** @type {import("./loot-storage.js").CorpseLootItem[]} */
  const items = [];
  const fallbackDefs = [];

  for (const drop of drops ?? []) {
    if (drop.rare && !enableRare) continue;
    const definitionId = resolveDropDefinitionId(drop, rollQuality);
    if (!definitionId) continue;

    const range = drop.quantityByQuality?.[rollQuality] ?? [0, 0];
    const chance = drop.chanceByQuality?.[rollQuality] ?? 1;
    if (drop.guaranteedFallback) fallbackDefs.push(definitionId);
    if (!chanceSucceeds(chance)) continue;

    let qty = randomInt(range[0], range[1]);
    qty = applyContextQuantityBonus(qty, context);
    if (isNatural20 && qty > 0) qty += 1;

    const entry = await buildLootEntry(definitionId, qty);
    if (entry) items.push(entry);
  }

  if (!items.length && fallbackDefs.length) {
    const entry = await buildLootEntry(fallbackDefs[0], 1);
    if (entry) items.push(entry);
  }

  return items;
}

/**
 * @param {object} pool
 * @param {object} options
 */
function runCurrencyPool(pool, { context, rollQuality }) {
  /** @type {import("./loot-storage.js").CorpseLootItem[]} */
  const items = [];
  const currency = emptyCurrency();
  const cr = Math.max(0, Number(context?.challengeRating) || 0);
  const chanceBonus = pool.qualityChanceBonus?.[rollQuality] ?? 0;

  for (const [denom, rule] of Object.entries(pool.denominations ?? {})) {
    if (!CURRENCY_META[denom] || !rule) continue;
    const chance = Math.min(1, Math.max(0, (rule.chance ?? 1) + chanceBonus));
    if (!chanceSucceeds(chance)) continue;

    const scale = Number(pool.crScale?.[denom] ?? 0);
    const maxBonus = Math.floor(cr * scale);
    const min = Math.max(0, Number(rule.min) || 0);
    const max = Math.max(min, (Number(rule.max) || 0) + maxBonus);
    const amount = randomInt(min, max);
    if (amount <= 0) continue;

    currency[denom] = amount;
    const entry = buildCurrencyEntry(denom, amount);
    if (entry) items.push(entry);
  }

  return { items, currency };
}

/**
 * @param {object} pool
 * @param {object} options
 */
async function runEquipmentPool(pool, {
  actor,
  context,
  rollQuality
}) {
  /** @type {import("./loot-storage.js").CorpseLootItem[]} */
  const items = [];
  if (!actor) return items;

  const scanned = scanActorEquipment(actor);
  if (!scanned.length) return items;

  // Shuffle so maxDrops is not biased by sheet order.
  const shuffled = [...scanned].sort(() => (chanceSucceeds(0.5) ? -1 : 1));
  const maxDrops = Math.max(0, Number(pool.maxDrops ?? 99));
  const chances = pool.chances ?? {};
  const qualityWeights = pool.qualityWeightsByRollQuality?.[rollQuality]
    ?? pool.qualityWeightsByRollQuality?.standard
    ?? { standard: 1 };

  let dropped = 0;
  for (const { item, category } of shuffled) {
    if (dropped >= maxDrops) break;
    const chance = chances[category] ?? 0;
    if (!chanceSucceeds(chance)) continue;

    const raw = typeof item.toObject === "function"
      ? item.toObject()
      : foundry.utils.duplicate(item);
    delete raw._id;
    delete raw.folder;
    delete raw.sort;
    delete raw._stats;
    if (raw.ownership) delete raw.ownership;

    // Drop a single unit even if the NPC stacked multiples.
    raw.system ??= {};
    raw.system.quantity = 1;

    const quality = pickEquipmentQuality(qualityWeights);
    const baseItemData = foundry.utils.duplicate(raw);
    const itemData = applyEquipmentQuality(raw, quality, {
      sourceCreature: context?.name ?? ""
    });

    items.push({
      entryId: foundry.utils.randomID(),
      kind: "equipment",
      definitionId: `equip-${item.id || foundry.utils.randomID()}`,
      quantity: 1,
      name: itemData.name,
      img: itemData.img || item.img,
      rarity: itemData.system?.rarity || item.system?.rarity || "common",
      valueText: formatItemValueText(itemData),
      description: itemData.system?.description?.chat
        || EQUIPMENT_QUALITY_BLURB(quality)
        || "",
      equipmentQuality: quality,
      sourceItemId: item.id,
      baseItemData,
      itemData
    });
    dropped += 1;
  }

  return items;
}

function EQUIPMENT_QUALITY_BLURB(quality) {
  return {
    broken: "Badly damaged equipment.",
    worn: "Poorly maintained equipment.",
    standard: "",
    fine: "Well-kept equipment.",
    masterwork: "Exceptionally crafted equipment."
  }[quality] ?? "";
}

/**
 * @param {object} pool
 * @param {object} options
 */
async function runPoolPick(pool, { rollQuality, enableRare }) {
  /** @type {import("./loot-storage.js").CorpseLootItem[]} */
  const items = [];
  if (pool.rare && !enableRare) return items;

  const chance = pool.chanceByQuality?.[rollQuality] ?? 1;
  if (!chanceSucceeds(chance)) return items;

  const range = pool.countByQuality?.[rollQuality] ?? [0, 1];
  const count = randomInt(range[0], range[1]);
  if (count <= 0) return items;

  const poolIds = [...(pool.definitionIds ?? [])].filter((id) => getLootDefinition(id));
  if (!poolIds.length) return items;

  // Sample without replacement when possible.
  const picks = [];
  const available = [...poolIds];
  for (let i = 0; i < count && available.length; i += 1) {
    const idx = randomInt(0, available.length - 1);
    picks.push(available.splice(idx, 1)[0]);
  }

  for (const definitionId of picks) {
    const entry = await buildLootEntry(definitionId, 1);
    if (entry) items.push(entry);
  }
  return items;
}

/**
 * Multi-pool generation (goblin and future humanoids).
 */
async function generateFromPools(profile, {
  context,
  actor,
  rollQuality,
  isNatural20
}) {
  const enableRare = getSetting("enableRareDrops");
  /** @type {import("./loot-storage.js").CorpseLootItem[]} */
  const items = [];
  let currency = emptyCurrency();
  const pools = profile.pools ?? {};

  // Stable pool order for handcrafted feel.
  const order = ["monsterParts", "currency", "equipment", "junk", "trinkets", "story", "rare"];

  for (const key of order) {
    const pool = pools[key];
    if (!pool) continue;

    if (pool.type === "definitions" || (key === "monsterParts" && pool.drops)) {
      const partItems = await runDefinitionsPool(pool.drops ?? [], {
        context,
        rollQuality,
        isNatural20,
        enableRare
      });
      items.push(...partItems);
      continue;
    }

    if (pool.type === "currency") {
      const result = runCurrencyPool(pool, { context, rollQuality });
      items.push(...result.items);
      currency = result.currency;
      continue;
    }

    if (pool.type === "equipment") {
      const eq = await runEquipmentPool(pool, { actor, context, rollQuality });
      items.push(...eq);
      continue;
    }

    if (pool.type === "poolPick") {
      const picked = await runPoolPick(pool, { rollQuality, enableRare });
      items.push(...picked);
    }
  }

  // Any extra custom pools not in the default order.
  for (const [key, pool] of Object.entries(pools)) {
    if (order.includes(key)) continue;
    if (pool?.type === "poolPick") {
      items.push(...await runPoolPick(pool, { rollQuality, enableRare }));
    } else if (pool?.type === "definitions") {
      items.push(...await runDefinitionsPool(pool.drops ?? [], {
        context,
        rollQuality,
        isNatural20,
        enableRare
      }));
    }
  }

  if (!items.length) {
    // Absolute last resort for multi-pool profiles: one junk or ear if defined.
    const fallbackId = pools.monsterParts?.drops?.[0]?.definitionId
      ?? pools.junk?.definitionIds?.[0];
    if (fallbackId) {
      const entry = await buildLootEntry(fallbackId, 1);
      if (entry) items.push(entry);
    }
  }

  return { items, currency };
}

/**
 * @param {object} options
 * @param {object} options.context
 * @param {number} options.survivalTotal
 * @param {number} [options.naturalDie=0]
 * @param {boolean} [options.isNatural20=false]
 * @param {Actor|null} [options.actor]  Required for equipment pools
 * @returns {Promise<{ profileId: string, rollQuality: string, items: object[], currency: object }>}
 */
export async function generateCreatureLoot({
  context,
  survivalTotal,
  naturalDie = 0,
  isNatural20 = false,
  actor = null
}) {
  const profile = resolveCreatureProfile(context);
  if (!profile) {
    throw new Error(`No LootForge profile for creature "${context?.name}"`);
  }

  let rollQuality = qualityFromSurvivalTotal(survivalTotal);
  if (context?.isBoss || (context?.isNamed && context?.isWolf)) {
    rollQuality = bumpQuality(rollQuality, 1);
  }
  if (isNatural20 && profile.drops?.some((d) => d.definitionByQuality)) {
    rollQuality = bumpQuality(rollQuality, 1);
  }
  if (isNatural20 && profile.pools?.equipment) {
    rollQuality = bumpQuality(rollQuality, 1);
  }

  const resolvedActor = actor
    ?? (context?.actorId ? game.actors?.get?.(context.actorId) : null)
    ?? null;

  const result = profile.pools
    ? await generateFromPools(profile, {
      context,
      actor: resolvedActor,
      rollQuality,
      isNatural20
    })
    : await generateFromDrops(profile, {
      context,
      rollQuality,
      isNatural20
    });

  log.debug("Generated loot", {
    profileId: profile.id,
    rollQuality,
    survivalTotal,
    naturalDie,
    currency: result.currency,
    items: result.items.map((i) => ({
      kind: i.kind,
      definitionId: i.definitionId,
      quantity: i.quantity,
      name: i.name
    }))
  });

  return {
    profileId: profile.id,
    rollQuality,
    items: result.items,
    currency: result.currency ?? aggregateCurrencyFromItems(result.items)
  };
}

/**
 * @param {object} context
 * @param {string} rollQuality
 * @param {string} definitionId
 * @param {object} [entry]  Original entry (for equipment re-quality)
 * @returns {Promise<import("./loot-storage.js").CorpseLootItem|null>}
 */
export async function rerollSingleEntry(context, rollQuality, definitionId, entry = null) {
  if (entry?.kind === "currency" && entry.currency) {
    const denom = Object.keys(entry.currency).find((k) => entry.currency[k] > 0);
    if (!denom) return null;
    const profile = resolveCreatureProfile(context);
    const rule = profile?.pools?.currency?.denominations?.[denom];
    if (!rule) return buildCurrencyEntry(denom, randomInt(1, 6));
    const cr = Math.max(0, Number(context?.challengeRating) || 0);
    const scale = Number(profile.pools.currency.crScale?.[denom] ?? 0);
    const max = Math.max(Number(rule.min) || 0, (Number(rule.max) || 0) + Math.floor(cr * scale));
    return buildCurrencyEntry(denom, randomInt(Number(rule.min) || 0, max));
  }

  if (entry?.kind === "equipment" && entry.baseItemData) {
    const profile = resolveCreatureProfile(context);
    const weights = profile?.pools?.equipment?.qualityWeightsByRollQuality?.[rollQuality]
      ?? { standard: 1 };
    const quality = pickEquipmentQuality(weights);
    const raw = foundry.utils.duplicate(entry.baseItemData);
    const itemData = applyEquipmentQuality(raw, quality, {
      sourceCreature: context?.name ?? ""
    });
    return {
      ...entry,
      entryId: foundry.utils.randomID(),
      name: itemData.name,
      valueText: formatItemValueText(itemData),
      description: itemData.system?.description?.chat || "",
      equipmentQuality: quality,
      itemData,
      quantity: 1
    };
  }

  const profile = resolveCreatureProfile(context);
  const drop = profile?.drops?.find((d) => {
    if (d.definitionId === definitionId) return true;
    if (d.definitionByQuality) {
      return Object.values(d.definitionByQuality).includes(definitionId);
    }
    return false;
  });

  // Multi-pool definition drops / junk / trinkets / story.
  if (!drop && profile?.pools) {
    return buildLootEntry(definitionId, 1);
  }

  if (!drop) return buildLootEntry(definitionId, 1);

  if (drop.rare && !getSetting("enableRareDrops")) return null;

  const resolvedId = resolveDropDefinitionId(drop, rollQuality) ?? definitionId;
  const range = drop.quantityByQuality?.[rollQuality] ?? [1, 1];
  const chance = drop.chanceByQuality?.[rollQuality] ?? 1;
  if (!chanceSucceeds(Math.max(chance, 0.35))) {
    if ((range[0] ?? 0) <= 0) return null;
  }
  const fixedSingle = Boolean(drop.definitionByQuality)
    || (range[0] === 1 && range[1] === 1);
  let qty = randomInt(Math.max(1, range[0]), Math.max(1, range[1]));
  qty = applyContextQuantityBonus(qty, context, { allowBonus: !fixedSingle });
  if (drop.definitionByQuality) qty = 1;
  return buildLootEntry(resolvedId, qty);
}
