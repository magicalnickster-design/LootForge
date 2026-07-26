/**
 * LootForge-owned item definitions for the Wolf MVP.
 * These are not DMG treasure tables and do not require the SRD compendium.
 */

/**
 * @typedef {object} LootDefinition
 * @property {string} id
 * @property {string} name
 * @property {string} type              dnd5e Item type
 * @property {string} category
 * @property {string} rarity            common|uncommon|rare|epic|legendary|mythic
 * @property {{ value: number, denomination: string }} price
 * @property {{ value: number, units: string }} weight
 * @property {string} description
 * @property {string[]} tags
 * @property {string} img
 */

/** @type {Record<string, LootDefinition>} */
export const LOOT_DEFINITIONS = {
  "wolf-pelt": {
    id: "wolf-pelt",
    name: "Wolf Pelt",
    type: "loot",
    category: "monster-part",
    rarity: "common",
    price: { value: 8, denomination: "sp" },
    weight: { value: 4, units: "lb" },
    description:
      "A rough hide taken from a slain wolf. Useful to hunters, leatherworkers, and cold-weather travelers.",
    tags: ["beast", "wolf", "hide", "leatherworking"],
    img: "icons/commodities/leather/fur-pelt-brown.webp"
  },
  "wolf-fang": {
    id: "wolf-fang",
    name: "Wolf Fang",
    type: "loot",
    category: "monster-part",
    rarity: "common",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.1, units: "lb" },
    description:
      "A sharp canine tooth often used in trophies, charms, or primitive jewelry.",
    tags: ["beast", "wolf", "bone", "trophy"],
    img: "icons/commodities/bones/tooth-canine-brown.webp"
  },
  "wolf-meat": {
    id: "wolf-meat",
    name: "Wolf Meat",
    type: "loot",
    category: "crafting-material",
    rarity: "common",
    price: { value: 3, denomination: "sp" },
    weight: { value: 2, units: "lb" },
    description:
      "Raw meat harvested from a wolf. Edible when properly prepared, though most civilized settlements consider it poor fare.",
    tags: ["beast", "wolf", "meat", "cooking"],
    img: "icons/consumables/meat/steak-raw-red-pink.webp"
  },
  "wolf-claw": {
    id: "wolf-claw",
    name: "Wolf Claw",
    type: "loot",
    category: "monster-part",
    rarity: "common",
    price: { value: 1, denomination: "sp" },
    weight: { value: 0.05, units: "lb" },
    description:
      "A curved claw suitable for use in jewelry, fetishes, or minor crafting recipes.",
    tags: ["beast", "wolf", "claw", "crafting"],
    img: "icons/commodities/claws/claw-bear-brown.webp"
  },
  "alpha-wolf-fang": {
    id: "alpha-wolf-fang",
    name: "Alpha Wolf Fang",
    type: "loot",
    category: "rare-collectible",
    rarity: "uncommon",
    price: { value: 2, denomination: "gp" },
    weight: { value: 0.1, units: "lb" },
    description:
      "An unusually large fang from a powerful wolf. Hunters value it as proof of a dangerous kill.",
    tags: ["beast", "wolf", "trophy", "rare"],
    img: "icons/commodities/bones/tooth-canine-white.webp"
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
 * Convert a LootForge definition into valid dnd5e embedded Item create data.
 *
 * @param {string|LootDefinition} definitionOrId
 * @param {object} [options]
 * @param {number} [options.quantity=1]
 * @param {string} [options.sourceCreature=""]
 * @returns {object}
 */
export function definitionToItemData(definitionOrId, { quantity = 1, sourceCreature = "" } = {}) {
  const def = typeof definitionOrId === "string"
    ? getLootDefinition(definitionOrId)
    : definitionOrId;

  if (!def) {
    throw new Error(`Unknown LootForge definition: ${definitionOrId}`);
  }

  const qty = Math.max(1, Math.floor(Number(quantity) || 1));

  return {
    name: def.name,
    type: def.type || "loot",
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
        stackingKey: def.id
      }
    }
  };
}

/**
 * Format a definition price for UI display.
 * @param {LootDefinition} def
 * @returns {string}
 */
export function formatDefinitionValue(def) {
  if (!def?.price) return "—";
  return `${def.price.value} ${def.price.denomination}`;
}
