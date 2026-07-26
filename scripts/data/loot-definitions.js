/**
 * LootForge definition registry.
 *
 * Canonical Item documents live in the module compendium:
 *   Compendium.lootforge.loot-items
 *
 * This file maps stable definitionIds → compendium UUIDs and keeps a thin
 * fallback snapshot for worlds where UUID resolution is unavailable.
 */

import { MODULE_ID } from "../modules/constants.js";

/** Pack collection id as declared in module.json. */
export const LOOT_ITEMS_PACK = `${MODULE_ID}.loot-items`;

/**
 * @typedef {object} LootDefinition
 * @property {string} id
 * @property {string} itemUuid              Canonical Compendium UUID
 * @property {string} documentId            Fixed pack document _id
 * @property {string} name                  Display name (UI / fallback)
 * @property {string} category
 * @property {string} rarity
 * @property {string[]} tags
 * @property {string} img
 * @property {string} description
 * @property {{ value: number, denomination: string }} price
 * @property {{ value: number, units: string }} weight
 */

/**
 * Stable document IDs used when packing packs/src/loot-items.
 * Changing these breaks existing UUID references — treat as immutable.
 */
const DOC_IDS = Object.freeze({
  "wolf-pelt": "LFWolfPelt000001",
  "wolf-fang": "LFWolfFang000001",
  "wolf-meat": "LFWolfMeat000001",
  "wolf-claw": "LFWolfClaw000001",
  "alpha-wolf-fang": "LFAlphaFang00001"
});

/**
 * @param {string} documentId
 * @returns {string}
 */
export function compendiumItemUuid(documentId) {
  return `Compendium.${LOOT_ITEMS_PACK}.Item.${documentId}`;
}

/** @type {Record<string, LootDefinition>} */
export const LOOT_DEFINITIONS = {
  "wolf-pelt": {
    id: "wolf-pelt",
    documentId: DOC_IDS["wolf-pelt"],
    itemUuid: compendiumItemUuid(DOC_IDS["wolf-pelt"]),
    name: "Wolf Pelt",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "wolf", "hide", "leatherworking"],
    img: "icons/commodities/leather/fur-pelt-brown.webp",
    description:
      "A rough hide taken from a slain wolf. Useful to hunters, leatherworkers, and cold-weather travelers.",
    price: { value: 8, denomination: "sp" },
    weight: { value: 4, units: "lb" }
  },
  "wolf-fang": {
    id: "wolf-fang",
    documentId: DOC_IDS["wolf-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["wolf-fang"]),
    name: "Wolf Fang",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "wolf", "bone", "trophy"],
    img: "icons/commodities/bones/tooth-canine-brown.webp",
    description:
      "A sharp canine tooth often used in trophies, charms, or primitive jewelry.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.1, units: "lb" }
  },
  "wolf-meat": {
    id: "wolf-meat",
    documentId: DOC_IDS["wolf-meat"],
    itemUuid: compendiumItemUuid(DOC_IDS["wolf-meat"]),
    name: "Wolf Meat",
    category: "crafting-material",
    rarity: "common",
    tags: ["beast", "wolf", "meat", "cooking"],
    img: "icons/consumables/meat/steak-raw-red-pink.webp",
    description:
      "Raw meat harvested from a wolf. Edible when properly prepared, though most civilized settlements consider it poor fare.",
    price: { value: 3, denomination: "sp" },
    weight: { value: 2, units: "lb" }
  },
  "wolf-claw": {
    id: "wolf-claw",
    documentId: DOC_IDS["wolf-claw"],
    itemUuid: compendiumItemUuid(DOC_IDS["wolf-claw"]),
    name: "Wolf Claw",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "wolf", "claw", "crafting"],
    img: "icons/commodities/claws/claw-bear-brown.webp",
    description:
      "A curved claw suitable for use in jewelry, fetishes, or minor crafting recipes.",
    price: { value: 1, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "alpha-wolf-fang": {
    id: "alpha-wolf-fang",
    documentId: DOC_IDS["alpha-wolf-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["alpha-wolf-fang"]),
    name: "Alpha Wolf Fang",
    category: "rare-collectible",
    rarity: "uncommon",
    tags: ["beast", "wolf", "trophy", "rare"],
    img: "icons/commodities/bones/tooth-canine-white.webp",
    description:
      "An unusually large fang from a powerful wolf. Hunters value it as proof of a dangerous kill.",
    price: { value: 2, denomination: "gp" },
    weight: { value: 0.1, units: "lb" }
  }
};

/**
 * @param {string} definitionId
 * @returns {LootDefinition|null}
 */
export function getLootDefinition(definitionId) {
  return LOOT_DEFINITIONS[definitionId] ?? null;
}

/**
 * @returns {LootDefinition[]}
 */
export function listLootDefinitions() {
  return Object.values(LOOT_DEFINITIONS);
}

/**
 * Build a fallback Item create-data object when the compendium UUID cannot be resolved.
 * Not the canonical source — the pack Item is.
 *
 * @param {LootDefinition} def
 * @param {object} [options]
 * @param {number} [options.quantity=1]
 * @param {string} [options.sourceCreature=""]
 * @returns {object}
 */
export function buildFallbackItemData(def, { quantity = 1, sourceCreature = "" } = {}) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  return {
    name: def.name,
    type: "loot",
    img: def.img || "icons/svg/item-bag.svg",
    system: {
      description: {
        value: `<p>${def.description}</p>`,
        chat: def.description
      },
      quantity: qty,
      weight: {
        value: Number(def.weight?.value ?? 0),
        units: def.weight?.units || "lb"
      },
      price: {
        value: Number(def.price?.value ?? 0),
        denomination: def.price?.denomination || "gp"
      },
      rarity: def.rarity || "common",
      identified: true
    },
    flags: {
      lootforge: {
        definitionId: def.id,
        category: def.category,
        rarity: def.rarity,
        tags: [...(def.tags ?? [])],
        sourceCreature: sourceCreature || "",
        generatedByLootForge: true,
        stackingKey: def.id,
        itemUuid: def.itemUuid
      }
    }
  };
}

/**
 * @deprecated Use buildFallbackItemData / resolveItemDataForTransfer
 */
export function definitionToItemData(definitionOrId, options = {}) {
  const def = typeof definitionOrId === "string"
    ? getLootDefinition(definitionOrId)
    : definitionOrId;
  if (!def) throw new Error(`Unknown LootForge definition: ${definitionOrId}`);
  return buildFallbackItemData(def, options);
}

/**
 * Clone create-data from a resolved Item document (never mutates the source).
 * @param {Item|object} doc
 * @param {object} [options]
 * @param {number} [options.quantity=1]
 * @param {string} [options.sourceCreature=""]
 * @param {LootDefinition|null} [options.definition]
 * @returns {object}
 */
export function cloneItemDataFromDocument(doc, {
  quantity = 1,
  sourceCreature = "",
  definition = null
} = {}) {
  const data = typeof doc.toObject === "function"
    ? doc.toObject()
    : foundry.utils.duplicate(doc);

  delete data._id;
  delete data.folder;
  delete data.sort;
  delete data._stats;
  if (data.ownership) delete data.ownership;

  data.system ??= {};
  data.system.quantity = Math.max(1, Math.floor(Number(quantity) || 1));

  const def = definition ?? getLootDefinition(data.flags?.lootforge?.definitionId);
  data.flags ??= {};
  data.flags.lootforge = {
    ...(data.flags.lootforge ?? {}),
    definitionId: def?.id ?? data.flags.lootforge?.definitionId,
    category: def?.category ?? data.flags.lootforge?.category,
    rarity: def?.rarity ?? data.flags.lootforge?.rarity,
    tags: def?.tags ? [...def.tags] : (data.flags.lootforge?.tags ?? []),
    stackingKey: def?.id ?? data.flags.lootforge?.stackingKey,
    itemUuid: def?.itemUuid ?? data.flags.lootforge?.itemUuid,
    sourceCreature: sourceCreature || data.flags.lootforge?.sourceCreature || "",
    generatedByLootForge: true
  };

  return data;
}

/**
 * Resolve Item create-data: pack UUID → stored snapshot → definition fallback.
 *
 * @param {object} entry  Corpse loot entry
 * @param {object} [options]
 * @param {number} [options.quantity]
 * @param {string} [options.sourceCreature=""]
 * @returns {Promise<object>}
 */
export async function resolveItemDataForTransfer(entry, {
  quantity,
  sourceCreature = ""
} = {}) {
  const qty = Math.max(1, Math.floor(Number(quantity ?? entry.quantity) || 1));
  const def = getLootDefinition(entry.definitionId);
  // Prefer UUID already stored on the corpse entry; otherwise the definition UUID.
  const uuid = entry.itemUuid || def?.itemUuid;

  // 1) Canonical path: clone from the module Item compendium (read-only source).
  //    Never update/create inside the pack — only clone create-data for the actor.
  if (uuid && typeof globalThis.fromUuid === "function") {
    try {
      const doc = await globalThis.fromUuid(uuid);
      if (doc) {
        return cloneItemDataFromDocument(doc, {
          quantity: qty,
          sourceCreature,
          definition: def
        });
      }
    } catch (err) {
      console.warn("LootForge | fromUuid failed, using snapshot/fallback", uuid, err);
    }
  }

  // 2) Stored snapshot from generation time (or v0.2.1+ corpse entries).
  if (entry.itemData) {
    const duplicate = globalThis.foundry?.utils?.duplicate
      ?? ((obj) => JSON.parse(JSON.stringify(obj)));
    const data = duplicate(entry.itemData);
    delete data._id;
    data.system ??= {};
    data.system.quantity = qty;
    data.flags ??= {};
    data.flags.lootforge = {
      ...(data.flags.lootforge ?? {}),
      sourceCreature: sourceCreature || data.flags.lootforge?.sourceCreature || "",
      generatedByLootForge: true,
      stackingKey: data.flags.lootforge?.stackingKey
        ?? def?.id
        ?? entry.definitionId
    };
    return data;
  }

  // 3) Legacy v0.2.0 corpse entries / corrupted UUID: definition fallback snapshot.
  if (!def) throw new Error(`Unknown LootForge definition: ${entry.definitionId}`);
  return buildFallbackItemData(def, { quantity: qty, sourceCreature });
}

/**
 * Build a quantity-neutral snapshot for corpse storage.
 * Prefer cloning from the live pack document.
 *
 * @param {LootDefinition} def
 * @returns {Promise<object>}
 */
export async function buildItemSnapshot(def) {
  if (def?.itemUuid && typeof fromUuid === "function") {
    try {
      const doc = await fromUuid(def.itemUuid);
      if (doc) {
        const data = cloneItemDataFromDocument(doc, {
          quantity: 1,
          definition: def
        });
        // Snapshot stores quantity 1; transfer overwrites.
        return data;
      }
    } catch (err) {
      console.warn("LootForge | snapshot fromUuid failed", def.itemUuid, err);
    }
  }
  return buildFallbackItemData(def, { quantity: 1 });
}

/**
 * @param {LootDefinition} def
 * @returns {string}
 */
export function formatDefinitionValue(def) {
  if (!def?.price) return "—";
  return `${def.price.value} ${def.price.denomination}`;
}
