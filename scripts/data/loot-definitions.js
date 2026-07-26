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
  "alpha-wolf-fang": "LFAlphaFang00001",
  "spider-silk": "LFSpiderSilk0001",
  "spider-fang": "LFSpiderFang0001",
  "spider-venom-gland": "LFSpiderVenom001",
  "spider-eye": "LFSpiderEye00001",
  "salvaged-padded-armor": "LFSalvPadArm0001",
  "salvaged-chain-shirt": "LFSalvChain00001",
  "salvaged-scale-mail": "LFSalvScale00001",
  "salvaged-breastplate": "LFSalvBreast0001",
  "salvaged-plate-armor": "LFSalvPlate00001",
  "goblin-ear": "LFGoblinEar00000",
  "goblin-tooth": "LFGoblinTooth000",
  "goblin-finger-bone": "LFGoblinFBone000",
  "goblin-blood-vial": "LFGoblinBlood000",
  "bent-spoon": "LFBentSpoon00000",
  "dirty-rag": "LFDirtyRag000000",
  "broken-pipe": "LFBrokenPipe0000",
  "empty-bottle": "LFEmptyBottle000",
  "dice": "LFDiceSet0000000",
  "cracked-mug": "LFCrackedMug0000",
  "old-boot": "LFOldBoot0000000",
  "copper-ring": "LFCopperRing0000",
  "bone-necklace": "LFBoneNecklace00",
  "lucky-rabbit-foot": "LFLuckyRabbit000",
  "small-idol": "LFSmallIdol00000",
  "decorative-feather": "LFDecorFeather00",
  "goblin-journal": "LFGoblinJournal0",
  "crude-map": "LFCrudeMap000000",
  "wanted-poster": "LFWantedPoster00",
  "caravan-schedule": "LFCaravanSched00",
  "bandit-orders": "LFBanditOrders00",
  "scribbled-note": "LFScribbledNote0"
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
    img: `modules/${MODULE_ID}/assets/items/wolf-pelt.svg`,
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
    img: `modules/${MODULE_ID}/assets/items/wolf-fang.svg`,
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
    img: `modules/${MODULE_ID}/assets/items/wolf-meat.svg`,
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
    img: `modules/${MODULE_ID}/assets/items/wolf-claw.svg`,
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
    img: `modules/${MODULE_ID}/assets/items/alpha-wolf-fang.svg`,
    description:
      "An unusually large fang from a powerful wolf. Hunters value it as proof of a dangerous kill.",
    price: { value: 2, denomination: "gp" },
    weight: { value: 0.1, units: "lb" }
  },

  "spider-silk": {
    id: "spider-silk",
    documentId: DOC_IDS["spider-silk"],
    itemUuid: compendiumItemUuid(DOC_IDS["spider-silk"]),
    name: "Spider Silk",
    category: "crafting-material",
    rarity: "common",
    tags: ["beast", "spider", "silk", "crafting"],
    img: `modules/${MODULE_ID}/assets/items/spider-silk.svg`,
    description:
      "Tough, sticky silk harvested from a spider. Valued by weavers, alchemists, and trapmakers.",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.5, units: "lb" }
  },
  "spider-fang": {
    id: "spider-fang",
    documentId: DOC_IDS["spider-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["spider-fang"]),
    name: "Spider Fang",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "spider", "fang", "trophy"],
    img: `modules/${MODULE_ID}/assets/items/spider-fang.svg`,
    description:
      "A hollow fang capable of delivering venom. Useful as a trophy or for crude poison work.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.1, units: "lb" }
  },
  "spider-venom-gland": {
    id: "spider-venom-gland",
    documentId: DOC_IDS["spider-venom-gland"],
    itemUuid: compendiumItemUuid(DOC_IDS["spider-venom-gland"]),
    name: "Spider Venom Gland",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["beast", "spider", "venom", "alchemy"],
    img: `modules/${MODULE_ID}/assets/items/spider-venom-gland.svg`,
    description:
      "A small sac still holding diluted spider venom. Alchemists prize intact glands.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.2, units: "lb" }
  },
  "spider-eye": {
    id: "spider-eye",
    documentId: DOC_IDS["spider-eye"],
    itemUuid: compendiumItemUuid(DOC_IDS["spider-eye"]),
    name: "Spider Eye",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "spider", "eye", "alchemy"],
    img: `modules/${MODULE_ID}/assets/items/spider-eye.svg`,
    description:
      "A glossy spider eye, sometimes used in potions or as a macabre curio.",
    price: { value: 1, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },

  "salvaged-padded-armor": {
    id: "salvaged-padded-armor",
    documentId: DOC_IDS["salvaged-padded-armor"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-padded-armor"]),
    name: "Salvaged Padded Armor",
    category: "salvaged-armor",
    rarity: "common",
    tags: ["construct", "armor", "salvage", "light"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-padded-armor.svg`,
    description:
      "Battered padding pulled from animated armor. Barely serviceable as light protection (AC 11).",
    price: { value: 5, denomination: "gp" },
    weight: { value: 8, units: "lb" }
  },
  "salvaged-chain-shirt": {
    id: "salvaged-chain-shirt",
    documentId: DOC_IDS["salvaged-chain-shirt"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-chain-shirt"]),
    name: "Salvaged Chain Shirt",
    category: "salvaged-armor",
    rarity: "common",
    tags: ["construct", "armor", "salvage", "medium"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-chain-shirt.svg`,
    description:
      "A usable chain shirt recovered from animated armor. Offers modest protection (AC 13).",
    price: { value: 50, denomination: "gp" },
    weight: { value: 20, units: "lb" }
  },
  "salvaged-scale-mail": {
    id: "salvaged-scale-mail",
    documentId: DOC_IDS["salvaged-scale-mail"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-scale-mail"]),
    name: "Salvaged Scale Mail",
    category: "salvaged-armor",
    rarity: "common",
    tags: ["construct", "armor", "salvage", "medium"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-scale-mail.svg`,
    description:
      "Overlapping scales still fastened after the construct fell. Solid medium armor (AC 14).",
    price: { value: 50, denomination: "gp" },
    weight: { value: 45, units: "lb" }
  },
  "salvaged-breastplate": {
    id: "salvaged-breastplate",
    documentId: DOC_IDS["salvaged-breastplate"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-breastplate"]),
    name: "Salvaged Breastplate",
    category: "salvaged-armor",
    rarity: "uncommon",
    tags: ["construct", "armor", "salvage", "medium"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-breastplate.svg`,
    description:
      "A well-kept breastplate salvaged from animated armor. Strong medium protection (AC 14).",
    price: { value: 400, denomination: "gp" },
    weight: { value: 20, units: "lb" }
  },
  "salvaged-plate-armor": {
    id: "salvaged-plate-armor",
    documentId: DOC_IDS["salvaged-plate-armor"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-plate-armor"]),
    name: "Salvaged Plate Armor",
    category: "salvaged-armor",
    rarity: "uncommon",
    tags: ["construct", "armor", "salvage", "heavy"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-plate-armor.svg`,
    description:
      "Nearly intact plate recovered from a powerful animated construct. Heavy armor (AC 18).",
    price: { value: 1500, denomination: "gp" },
    weight: { value: 65, units: "lb" }
  },

  "goblin-ear": {
    id: "goblin-ear",
    documentId: DOC_IDS["goblin-ear"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-ear"]),
    name: "Goblin Ear",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","goblin","trophy"],
    img: `modules/${MODULE_ID}/assets/items/goblin-ear.svg`,
    description: "A severed goblin ear — crude proof of a kill, sometimes collected by bounty hunters.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.1, units: "lb" }
  },
  "goblin-tooth": {
    id: "goblin-tooth",
    documentId: DOC_IDS["goblin-tooth"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-tooth"]),
    name: "Goblin Tooth",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","goblin","bone"],
    img: `modules/${MODULE_ID}/assets/items/goblin-tooth.svg`,
    description: "A yellowed goblin tooth, often drilled for necklaces or thrown into foul stew pots.",
    price: { value: 1, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "goblin-finger-bone": {
    id: "goblin-finger-bone",
    documentId: DOC_IDS["goblin-finger-bone"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-finger-bone"]),
    name: "Goblin Finger Bone",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","goblin","bone"],
    img: `modules/${MODULE_ID}/assets/items/goblin-finger-bone.svg`,
    description: "A small finger bone cleaned of flesh. Goblins sometimes use them as charms.",
    price: { value: 5, denomination: "cp" },
    weight: { value: 0.05, units: "lb" }
  },
  "goblin-blood-vial": {
    id: "goblin-blood-vial",
    documentId: DOC_IDS["goblin-blood-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-blood-vial"]),
    name: "Goblin Blood Vial",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["humanoid","goblin","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/goblin-blood-vial.svg`,
    description: "A stoppered vial of dark goblin blood. Alchemists and hedge witches sometimes pay for it.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.2, units: "lb" }
  },
  "bent-spoon": {
    id: "bent-spoon",
    documentId: DOC_IDS["bent-spoon"],
    itemUuid: compendiumItemUuid(DOC_IDS["bent-spoon"]),
    name: "Bent Spoon",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/bent-spoon.svg`,
    description: "A tin spoon bent nearly in half. Worthless, but somehow still in a goblin's pocket.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 0.1, units: "lb" }
  },
  "dirty-rag": {
    id: "dirty-rag",
    documentId: DOC_IDS["dirty-rag"],
    itemUuid: compendiumItemUuid(DOC_IDS["dirty-rag"]),
    name: "Dirty Rag",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/dirty-rag.svg`,
    description: "A filthy scrap of cloth. Best not to ask what stained it.",
    price: { value: 0, denomination: "cp" },
    weight: { value: 0.1, units: "lb" }
  },
  "broken-pipe": {
    id: "broken-pipe",
    documentId: DOC_IDS["broken-pipe"],
    itemUuid: compendiumItemUuid(DOC_IDS["broken-pipe"]),
    name: "Broken Pipe",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/broken-pipe.svg`,
    description: "A cracked wooden smoking pipe. The bowl still smells faintly of something unpleasant.",
    price: { value: 2, denomination: "cp" },
    weight: { value: 0.2, units: "lb" }
  },
  "empty-bottle": {
    id: "empty-bottle",
    documentId: DOC_IDS["empty-bottle"],
    itemUuid: compendiumItemUuid(DOC_IDS["empty-bottle"]),
    name: "Empty Bottle",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/empty-bottle.svg`,
    description: "A cloudy glass bottle with the cork chewed off. Empty, save for a few sticky drops.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 0.5, units: "lb" }
  },
  "dice": {
    id: "dice",
    documentId: DOC_IDS["dice"],
    itemUuid: compendiumItemUuid(DOC_IDS["dice"]),
    name: "Dice",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin","game"],
    img: `modules/${MODULE_ID}/assets/items/dice.svg`,
    description: "A pair of uneven bone dice. One corner is chewed flat — fair play was never the point.",
    price: { value: 2, denomination: "cp" },
    weight: { value: 0.05, units: "lb" }
  },
  "cracked-mug": {
    id: "cracked-mug",
    documentId: DOC_IDS["cracked-mug"],
    itemUuid: compendiumItemUuid(DOC_IDS["cracked-mug"]),
    name: "Cracked Mug",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/cracked-mug.svg`,
    description: "A clay mug with a hairline crack. Still holds liquid, if you don't mind the leak.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 0.5, units: "lb" }
  },
  "old-boot": {
    id: "old-boot",
    documentId: DOC_IDS["old-boot"],
    itemUuid: compendiumItemUuid(DOC_IDS["old-boot"]),
    name: "Old Boot",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/old-boot.svg`,
    description: "A single worn boot, two sizes too large and missing its lace.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 1, units: "lb" }
  },
  "copper-ring": {
    id: "copper-ring",
    documentId: DOC_IDS["copper-ring"],
    itemUuid: compendiumItemUuid(DOC_IDS["copper-ring"]),
    name: "Copper Ring",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","goblin"],
    img: `modules/${MODULE_ID}/assets/items/copper-ring.svg`,
    description: "A thin copper band, green in places. Not magical — just shiny enough to steal.",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "bone-necklace": {
    id: "bone-necklace",
    documentId: DOC_IDS["bone-necklace"],
    itemUuid: compendiumItemUuid(DOC_IDS["bone-necklace"]),
    name: "Bone Necklace",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","goblin"],
    img: `modules/${MODULE_ID}/assets/items/bone-necklace.svg`,
    description: "Tiny bones and beads strung on sinew. A goblin keepsake, or a warning.",
    price: { value: 3, denomination: "sp" },
    weight: { value: 0.2, units: "lb" }
  },
  "lucky-rabbit-foot": {
    id: "lucky-rabbit-foot",
    documentId: DOC_IDS["lucky-rabbit-foot"],
    itemUuid: compendiumItemUuid(DOC_IDS["lucky-rabbit-foot"]),
    name: "Lucky Rabbit Foot",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","goblin"],
    img: `modules/${MODULE_ID}/assets/items/lucky-rabbit-foot.svg`,
    description: "A dried rabbit's foot on a frayed cord. Its previous owner clearly believed in luck.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.1, units: "lb" }
  },
  "small-idol": {
    id: "small-idol",
    documentId: DOC_IDS["small-idol"],
    itemUuid: compendiumItemUuid(DOC_IDS["small-idol"]),
    name: "Small Idol",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","goblin","religion"],
    img: `modules/${MODULE_ID}/assets/items/small-idol.svg`,
    description: "A crude stone idol with oversized eyes. Someone muttered to it in the dark.",
    price: { value: 2, denomination: "gp" },
    weight: { value: 0.5, units: "lb" }
  },
  "decorative-feather": {
    id: "decorative-feather",
    documentId: DOC_IDS["decorative-feather"],
    itemUuid: compendiumItemUuid(DOC_IDS["decorative-feather"]),
    name: "Decorative Feather",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","goblin"],
    img: `modules/${MODULE_ID}/assets/items/decorative-feather.svg`,
    description: "A bright feather, carefully kept. Perhaps from a stolen hat — or a bird that got away.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "goblin-journal": {
    id: "goblin-journal",
    documentId: DOC_IDS["goblin-journal"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-journal"]),
    name: "Goblin Journal",
    category: "story",
    rarity: "uncommon",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/goblin-journal.svg`,
    description: "A greasy little booklet of scratchy Common and Goblin. Entries complain about bosses, stolen chickens, and a \"shiny cave that bites.\" No maps of real value — yet.",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.5, units: "lb" }
  },
  "crude-map": {
    id: "crude-map",
    documentId: DOC_IDS["crude-map"],
    itemUuid: compendiumItemUuid(DOC_IDS["crude-map"]),
    name: "Crude Map",
    category: "story",
    rarity: "uncommon",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/crude-map.svg`,
    description: "A scrap of hide marked with charcoal. An X sits near a crooked river and three stick-figure trees. Whether the treasure exists is another matter.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.1, units: "lb" }
  },
  "wanted-poster": {
    id: "wanted-poster",
    documentId: DOC_IDS["wanted-poster"],
    itemUuid: compendiumItemUuid(DOC_IDS["wanted-poster"]),
    name: "Wanted Poster",
    category: "story",
    rarity: "common",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/wanted-poster.svg`,
    description: "A torn poster offering coin for \"the green one with the scar.\" The face is smudged beyond recognition. Someone kept it folded in a pouch.",
    price: { value: 1, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "caravan-schedule": {
    id: "caravan-schedule",
    documentId: DOC_IDS["caravan-schedule"],
    itemUuid: compendiumItemUuid(DOC_IDS["caravan-schedule"]),
    name: "Caravan Schedule",
    category: "story",
    rarity: "uncommon",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/caravan-schedule.svg`,
    description: "A damp parchment listing wagon departures along a trade road — dates, cargo notes (\"grain\", \"iron\", \"wine\"), and a scribbled goblin jot: \"wait at bend.\"",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "bandit-orders": {
    id: "bandit-orders",
    documentId: DOC_IDS["bandit-orders"],
    itemUuid: compendiumItemUuid(DOC_IDS["bandit-orders"]),
    name: "Bandit Orders",
    category: "story",
    rarity: "uncommon",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/bandit-orders.svg`,
    description: "Rough handwriting: \"Hit the south road after dark. Leave no wagons. Bring the strongbox to the hollow.\" Signed with a fang-shaped mark.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.05, units: "lb" }
  },
  "scribbled-note": {
    id: "scribbled-note",
    documentId: DOC_IDS["scribbled-note"],
    itemUuid: compendiumItemUuid(DOC_IDS["scribbled-note"]),
    name: "Scribbled Note",
    category: "story",
    rarity: "common",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/scribbled-note.svg`,
    description: "A scrap that reads: \"Boss says dig. Dig until shiny. Don't tell the tall ones.\" The rest is claw marks.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 0.05, units: "lb" }
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
    img: def.img || `modules/${MODULE_ID}/assets/ui/loot-bag.svg`,
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

  // Equipment / official system-item clones always prefer their stored snapshot.
  if ((entry?.kind === "equipment" || entry?.kind === "system-item") && entry.itemData) {
    const duplicate = globalThis.foundry?.utils?.duplicate
      ?? ((obj) => JSON.parse(JSON.stringify(obj)));
    const data = duplicate(entry.itemData);
    delete data._id;
    data.system ??= {};
    data.system.quantity = qty;
    data.flags ??= {};
    data.flags.lootforge = {
      ...(data.flags.lootforge ?? {}),
      kind: "equipment",
      equipmentQuality: entry.equipmentQuality ?? data.flags.lootforge?.equipmentQuality,
      sourceCreature: sourceCreature || data.flags.lootforge?.sourceCreature || "",
      generatedByLootForge: true,
      stackingKey: data.flags.lootforge?.stackingKey
        ?? `equip-${entry.entryId || entry.definitionId}`
    };
    return data;
  }

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
