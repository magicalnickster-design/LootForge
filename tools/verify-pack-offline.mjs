/**
 * Offline release checks (no Foundry runtime required).
 * Copies the LevelDB pack before opening so verification cannot mutate shipped files.
 */
import { ClassicLevel } from "classic-level";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packDir = path.join(root, "packs/loot-items");
const moduleJson = JSON.parse(readFileSync(path.join(root, "module.json"), "utf8"));

if (moduleJson.version !== "0.5.12") {
  throw new Error(`Expected module version 0.5.12, got ${moduleJson.version}`);
}

const packDecl = moduleJson.packs?.find((p) => p.name === "loot-items");
if (!packDecl || packDecl.label !== "LootForge Items" || packDecl.type !== "Item") {
  throw new Error("module.json missing correct loot-items pack declaration");
}
if (packDecl.system !== "dnd5e") throw new Error("loot-items pack must declare system dnd5e");
if (!packDecl.path?.includes("packs/loot-items")) {
  throw new Error("loot-items pack path must point at packs/loot-items");
}

const shipped = readdirSync(packDir).sort();
const requiredKinds = {
  current: shipped.includes("CURRENT"),
  lock: shipped.includes("LOCK"),
  log: shipped.includes("LOG"),
  manifest: shipped.some((f) => f.startsWith("MANIFEST-")),
  ldb: shipped.some((f) => f.endsWith(".ldb")),
  numberedLog: shipped.some((f) => /^\d+\.log$/.test(f))
};
for (const [kind, ok] of Object.entries(requiredKinds)) {
  if (!ok) throw new Error(`packs/loot-items missing LevelDB component: ${kind}`);
}

const expectedNames = new Set([
  "Wolf Pelt",
  "Wolf Fang",
  "Wolf Meat",
  "Wolf Claw",
  "Alpha Wolf Fang",
  "Spider Silk",
  "Spider Fang",
  "Spider Venom Gland",
  "Spider Eye",
  "Salvaged Padded Armor",
  "Salvaged Chain Shirt",
  "Salvaged Scale Mail",
  "Salvaged Breastplate",
  "Salvaged Plate Armor",
  "Goblin Ear",
  "Goblin Tooth",
  "Goblin Finger Bone",
  "Goblin Blood Vial",
  "Bent Spoon",
  "Dirty Rag",
  "Broken Pipe",
  "Empty Bottle",
  "Dice",
  "Cracked Mug",
  "Old Boot",
  "Copper Ring",
  "Bone Necklace",
  "Lucky Rabbit Foot",
  "Small Idol",
  "Decorative Feather",
  "Goblin Journal",
  "Crude Map",
  "Wanted Poster",
  "Caravan Schedule",
  "Bandit Orders",
  "Scribbled Note",
  "Orc Tusk",
  "Orc Ear",
  "Orc Blood Vial",
  "Orc Heart",
  "War Paint Pot",
  "Gnawed Bone",
  "Rusty Nail Pouch",
  "Iron Nose Ring",
  "Crude Totem",
  "Tusk Pendant",
  "Orc War Orders",
  "Raid Map",
  "Clan Marking",
  "Blood Oath Scrap",
  "Spider Chitin",
  "Spinneret",
  "Sticky Web Clump",
  "Empty Cocoon",
  "Brittle Leg Segment",
  "Web-Wrapped Coin",
  "Iridescent Chitin Shard",
  "Fang Charm",
  "Cocooned Journal",
  "Prey Keepsake",
  "Webbing Scrawl",
  "Dragon Scale",
  "Dragon Fang",
  "Dragon Claw",
  "Dragon Blood Vial",
  "Dragon Hide",
  "Dragon Horn",
  "Dragon Heart",
  "Scorched Bone",
  "Cracked Scale Shard",
  "Sulfur Lump",
  "Ash Clump",
  "Polished Dragon Scale",
  "Dragon Tooth Pendant",
  "Hoard Gem Chip",
  "Hoard Ledger",
  "Territorial Claim",
  "Rival Challenge",
  "Scorched Map",
  "Bugbear Ear",
  "Bugbear Fang",
  "Bugbear Hide Scrap",
  "Bugbear Heart",
  "Mangy Fur Tuft",
  "Greasy Strap",
  "Bone Earring",
  "Crude Nose Bone",
  "Bugbear Orders",
  "Raid Tally",
  "Ectoplasm Vial",
  "Grave Dirt",
  "Burial Coin",
  "Broken Holy Symbol",
  "Rotten Flesh",
  "Zombie Tooth",
  "Zombie Hand",
  "Burial Shroud Scrap",
  "Coffin Nail",
  "Unfinished Will",
  "Bone Shard",
  "Yellowed Rib",
  "Skeleton Finger",
  "Rusted Mail Link",
  "Polished Knuckle",
  "Ancient Epitaph",
  "Mummy Bandage",
  "Withered Flesh",
  "Canopic Dust",
  "Mummy Heart",
  "Scarab Bead",
  "Hieroglyph Scrap",
  "Curse Tablet",
  "Lich Dust",
  "Necrotic Crystal",
  "Soul Ash",
  "Phylactery Shard",
  "Void-Wax Candle",
  "Obsidian Focus",
  "Soul Gem Chip",
  "Phylactery Notes",
  "Spell Research Page",
  "Lichdom Formula",
  "Human Blood Vial",
  "Human Hair Lock",
  "Worn Insignia",
  "Traveler's Token",
  "Crumpled Receipt",
  "Torn Ledger Page",
  "Guild Letter",
  "Bandit Pass",
  "Love Letter",
  "Elf Blood Vial",
  "Elf Hair Lock",
  "Moon-Silver Splinter",
  "Elven Arrowhead",
  "Silver Leaf Charm",
  "Perfume Vial",
  "Silk Scrap",
  "Elven Poetry Scrap",
  "Woodland Map",
  "Dwarf Blood Vial",
  "Dwarf Beard Braid",
  "Iron Beard Ring",
  "Forged Nail",
  "Coal Dust Pouch",
  "Whetstone Chip",
  "Clan Crest Chip",
  "Mining Claim",
  "Ale-Stained Mug",
  "Halfling Blood Vial",
  "Halfling Hair Lock",
  "Halfling Pipe",
  "Lucky Charm",
  "Harvest Apple",
  "Pocket Handkerchief",
  "Recipe Card",
  "County Fair Ticket",
  "Shire Map Scrap",
  "Fiend Ichor",
  "Fiend Horn",
  "Brimstone Chunk",
  "Hell Hound Fang",
  "Hell Hound Hide Scrap",
  "Imp Wing Membrane",
  "Quasit Claw",
  "Barbed Spine",
  "Devil Chain Link",
  "Bone Spur",
  "Pit Fiend Scale",
  "Balor Ash",
  "Soul Coin Chip",
  "Brimstone Charm",
  "Infernal Seal",
  "Abyssal Rune Shard",
  "Scorched Scrap",
  "Melted Coin",
  "Sulfur-Stained Cloth",
  "Infernal Contract Scrap",
  "Blood War Orders",
  "Cultist Summons",
  "Soul Ledger Page",
  "Fey Dust",
  "Fey Blood Vial",
  "Pixie Wing",
  "Dryad Bark Scrap",
  "Satyr Horn Tip",
  "Redcap Tooth",
  "Hag Hair Lock",
  "Hag Eye",
  "Fairy Ring Mushroom",
  "Moonbeam Crystal",
  "Iron Nail Ward",
  "Hag Eye Amulet",
  "Wilted Petal",
  "Tangled Vine",
  "Torn Ribbon",
  "Bloodstained Cap Scrap",
  "Fey Bargain Scrap",
  "Court Invitation",
  "Hag Coven Note",
  "Stolen Name List",
  "Monstrosity Hide Scrap",
  "Monstrosity Fang",
  "Owlbear Feather",
  "Owlbear Claw",
  "Basilisk Eye",
  "Basilisk Scale",
  "Cockatrice Feather",
  "Chimera Horn",
  "Griffon Feather",
  "Manticore Spike",
  "Hydra Tooth",
  "Bulette Plate",
  "Ankheg Chitin",
  "Ankheg Acid Sac",
  "Purple Worm Tooth",
  "Mimic Adhesive",
  "Roper Tendril",
  "Petrified Chip",
  "Nest Egg Shard",
  "Shed Scale",
  "Sticky Residue",
  "Dug-Up Pebble",
  "Hunter Warning",
  "Nest Map Scrap",
  "Worm Tunnel Chart"
]);

const tempPack = mkdtempSync(path.join(tmpdir(), "lootforge-pack-"));
try {
  cpSync(packDir, tempPack, { recursive: true });
  const db = new ClassicLevel(tempPack, {
    keyEncoding: "utf8",
    valueEncoding: "json",
    createIfMissing: false
  });
  await db.open();
  const items = [];
  for await (const [, value] of db.iterator()) items.push(value);
  await db.close();

  if (items.length !== expectedNames.size) {
    throw new Error(`Expected ${expectedNames.size} pack items, found ${items.length}`);
  }

  const requiredFlagKeys = ["definitionId", "category", "rarity", "tags", "stackingKey"];
  for (const item of items) {
    expectedNames.delete(item.name);
    if (item.type !== "loot") throw new Error(`${item.name} is not type loot`);
    if (item.system?.quantity !== 1) throw new Error(`${item.name} quantity must default to 1`);
    if (!item.system?.price || !item.system?.weight) {
      throw new Error(`${item.name} missing price/weight`);
    }
    const flags = item.flags?.lootforge ?? {};
    for (const key of requiredFlagKeys) {
      if (flags[key] == null) throw new Error(`${item.name} missing flags.lootforge.${key}`);
    }
    if (!Array.isArray(flags.tags)) throw new Error(`${item.name} tags must be an array`);
    if (flags.stackingKey !== flags.definitionId) {
      throw new Error(`${item.name} stackingKey should match definitionId`);
    }
    if (!String(item.img || "").startsWith("modules/lootforge/assets/")) {
      throw new Error(`${item.name} must use a bundled LootForge icon, got ${item.img}`);
    }
  }
  if (expectedNames.size) {
    throw new Error(`Missing expected items: ${[...expectedNames].join(", ")}`);
  }
} finally {
  rmSync(tempPack, { recursive: true, force: true });
}

// Minimal Foundry stubs for generator smoke tests.
globalThis.foundry = {
  utils: {
    randomID: (n = 16) => `id${Math.random().toString(36).slice(2, 2 + n)}`,
    duplicate: (obj) => JSON.parse(JSON.stringify(obj))
  }
};
globalThis.game = {
  settings: {
    get: (_module, key) => (key === "enableRareDrops" ? true : false)
  },
  actors: { get: () => null }
};

const { buildFallbackItemData, getLootDefinition, resolveItemDataForTransfer, listLootDefinitions } = await import(
  "../scripts/data/loot-definitions.js"
);
const { resolveCreatureProfile } = await import("../scripts/data/creature-profiles.js");
const { generateCreatureLoot, aggregateCurrencyFromItems, resolveLootScale } = await import(
  "../scripts/modules/loot-generator.js"
);
const { applyEquipmentQuality, pickEquipmentQuality } = await import(
  "../scripts/modules/equipment-quality.js"
);
const { classifyInventoryItem } = await import("../scripts/modules/equipment-scanner.js");

const legacyEntry = {
  entryId: "legacy1",
  definitionId: "wolf-pelt",
  name: "Wolf Pelt",
  quantity: 2
};
const legacyData = await resolveItemDataForTransfer(legacyEntry, {
  quantity: 2,
  sourceCreature: "Wolf"
});
if (legacyData._id) throw new Error("Fallback data must not include _id");
if (legacyData.system.quantity !== 2) throw new Error("Legacy fallback quantity wrong");
if (legacyData.flags.lootforge.stackingKey !== "wolf-pelt") {
  throw new Error("Legacy fallback missing stackingKey");
}

const badUuidEntry = {
  entryId: "bad1",
  definitionId: "wolf-fang",
  itemUuid: "Compendium.lootforge.loot-items.Item.DOESNOTEXIST",
  quantity: 1,
  itemData: buildFallbackItemData(getLootDefinition("wolf-fang"), { quantity: 1 })
};
globalThis.fromUuid = async () => {
  throw new Error("simulated missing uuid");
};
const snapped = await resolveItemDataForTransfer(badUuidEntry, { quantity: 3 });
if (snapped.system.quantity !== 3) throw new Error("Snapshot fallback quantity wrong");
if (snapped._id) throw new Error("Snapshot clone must strip _id");

const wolf = resolveCreatureProfile({ name: "Wolf", creatureType: "beast", creatureSubtype: "" });
const wolfSpider = resolveCreatureProfile({
  name: "Wolf Spider",
  creatureType: "beast",
  creatureSubtype: ""
});
const spider = resolveCreatureProfile({
  name: "Giant Spider",
  creatureType: "beast",
  creatureSubtype: ""
});
const armor = resolveCreatureProfile({
  name: "Animated Armor",
  creatureType: "construct",
  creatureSubtype: ""
});
const goblin = resolveCreatureProfile({
  name: "Goblin",
  creatureType: "humanoid",
  creatureSubtype: "goblinoid"
});
const hobgoblin = resolveCreatureProfile({
  name: "Hobgoblin",
  creatureType: "humanoid",
  creatureSubtype: "goblinoid"
});
const orc = resolveCreatureProfile({
  name: "Orc",
  creatureType: "humanoid",
  creatureSubtype: "orc"
});
const orog = resolveCreatureProfile({
  name: "Orog",
  creatureType: "humanoid",
  creatureSubtype: "orc"
});
const halfOrc = resolveCreatureProfile({
  name: "Half-Orc Raider",
  creatureType: "humanoid",
  creatureSubtype: "human"
});
const dragon = resolveCreatureProfile({
  name: "Adult Red Dragon",
  creatureType: "dragon",
  creatureSubtype: ""
});
const wyrmling = resolveCreatureProfile({
  name: "Red Dragon Wyrmling",
  creatureType: "dragon",
  creatureSubtype: ""
});
const dragonborn = resolveCreatureProfile({
  name: "Dragonborn Guard",
  creatureType: "humanoid",
  creatureSubtype: "dragonborn"
});
const chest = resolveCreatureProfile({
  name: "Chest",
  creatureType: "construct",
  creatureSubtype: "",
  isContainer: true
});
if (wolf?.id !== "wolf") throw new Error(`Expected wolf profile, got ${wolf?.id}`);
if (wolfSpider?.id !== "spider") throw new Error(`Expected spider profile for Wolf Spider, got ${wolfSpider?.id}`);
if (spider?.id !== "spider") throw new Error(`Expected spider profile, got ${spider?.id}`);
if (armor?.id !== "animated-armor") throw new Error(`Expected animated-armor profile, got ${armor?.id}`);
if (goblin?.id !== "goblin") throw new Error(`Expected goblin profile, got ${goblin?.id}`);
if (hobgoblin?.id === "goblin") throw new Error("Hobgoblin must not resolve to goblin profile");
if (orc?.id !== "orc") throw new Error(`Expected orc profile, got ${orc?.id}`);
if (orog?.id !== "orc") throw new Error(`Expected orc profile for Orog, got ${orog?.id}`);
if (halfOrc?.id === "orc") throw new Error("Half-orc must not resolve to orc profile");
if (dragon?.id !== "dragon") throw new Error(`Expected dragon profile, got ${dragon?.id}`);
if (wyrmling?.id !== "dragon") throw new Error(`Expected dragon profile for wyrmling, got ${wyrmling?.id}`);
if (dragonborn?.id === "dragon") throw new Error("Dragonborn must not resolve to dragon profile");
if (chest?.id !== "container") throw new Error(`Expected container profile for Chest, got ${chest?.id}`);
if (chest?.pools?.systemGear?.type !== "systemItems") {
  throw new Error("Container profile missing systemGear pool for official dnd5e items");
}

const {
  normalizeItemRarity,
  pickRarityBucket
} = await import("../scripts/modules/system-item-catalog.js");
if (normalizeItemRarity("very rare") !== "veryRare") {
  throw new Error("normalizeItemRarity failed for very rare");
}
if (normalizeItemRarity("") !== "common") {
  throw new Error("normalizeItemRarity should default blank to common");
}
const bucket = pickRarityBucket(
  { common: 1, rare: 0 },
  { common: [{ uuid: "a" }], uncommon: [], rare: [], veryRare: [], legendary: [], artifact: [] }
);
if (bucket !== "common") throw new Error(`Expected common rarity bucket, got ${bucket}`);
if (!getLootDefinition("goblin-ear") || !getLootDefinition("bandit-orders")) {
  throw new Error("Missing goblin loot definitions");
}
if (!getLootDefinition("orc-tusk") || !getLootDefinition("orc-war-orders") || !getLootDefinition("blood-oath-scrap")) {
  throw new Error("Missing orc loot definitions");
}
if (!getLootDefinition("spider-chitin") || !getLootDefinition("spinneret") || !getLootDefinition("cocooned-journal")) {
  throw new Error("Missing spider loot definitions");
}
if (!getLootDefinition("dragon-scale") || !getLootDefinition("dragon-heart") || !getLootDefinition("hoard-ledger")) {
  throw new Error("Missing dragon loot definitions");
}
if (!getLootDefinition("bugbear-ear") || !getLootDefinition("zombie-hand") || !getLootDefinition("phylactery-shard") || !getLootDefinition("lichdom-formula")) {
  throw new Error("Missing bugbear/undead loot definitions");
}
if (!getLootDefinition("human-blood-vial") || !getLootDefinition("elf-blood-vial") || !getLootDefinition("dwarf-beard-braid") || !getLootDefinition("halfling-pipe")) {
  throw new Error("Missing PC race loot definitions");
}
if (listLootDefinitions().length < 210) {
  throw new Error("Expected expanded definition registry");
}

if (resolveLootScale(dragon, { name: "Red Dragon Wyrmling", size: "med" }) !== 0.45) {
  throw new Error("Wyrmling lootScale should be 0.45");
}
if (resolveLootScale(dragon, { name: "Young Red Dragon", size: "lg" }) !== 0.75) {
  throw new Error("Young dragon lootScale should be 0.75");
}
if (resolveLootScale(dragon, { name: "Adult Red Dragon", size: "huge" }) !== 1.35) {
  throw new Error("Adult dragon lootScale should be 1.35");
}
if (resolveLootScale(dragon, { name: "Ancient Red Dragon", size: "grg" }) !== 1.85) {
  throw new Error("Ancient dragon lootScale should be 1.85");
}

// Wolf legacy generation still returns only definition-based items (no currency).
const wolfLoot = await generateCreatureLoot({
  context: {
    name: "Wolf",
    creatureType: "beast",
    creatureSubtype: "",
    size: "med",
    challengeRating: 0.25,
    isWolf: true,
    isBoss: false,
    isNamed: false
  },
  survivalTotal: 15,
  naturalDie: 10,
  isNatural20: false,
  actor: null
});
if (wolfLoot.profileId !== "wolf") throw new Error("Wolf generation used wrong profile");
if (!wolfLoot.items.length) throw new Error("Wolf generation produced no items");
if (wolfLoot.items.some((i) => i.kind === "currency")) {
  throw new Error("Wolf generation should not invent currency entries");
}
if (wolfLoot.items.some((i) => String(i.definitionId || "").includes("goblin"))) {
  throw new Error("Wolf generation leaked goblin definitions");
}

// Goblin multi-pool smoke test with fake inventory.
const fakeActor = {
  id: "gob1",
  name: "Goblin",
  items: {
    contents: [
      {
        id: "w1",
        name: "Scimitar",
        type: "weapon",
        img: "icons/svg/sword.svg",
        system: { quantity: 1, type: { value: "martialM" }, price: { value: 25, denomination: "gp" }, description: { value: "<p>A scimitar.</p>" }, rarity: "common" },
        flags: {},
        toObject() {
          return {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system),
            flags: {}
          };
        }
      },
      {
        id: "a1",
        name: "Leather Armor",
        type: "equipment",
        img: "icons/svg/armor.svg",
        system: { quantity: 1, type: { value: "light" }, price: { value: 10, denomination: "gp" }, description: { value: "<p>Leather.</p>" }, rarity: "common" },
        flags: {},
        toObject() {
          return {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system),
            flags: {}
          };
        }
      },
      {
        id: "s1",
        name: "Shield",
        type: "equipment",
        img: "icons/svg/shield.svg",
        system: { quantity: 1, type: { value: "shield" }, price: { value: 10, denomination: "gp" }, description: { value: "<p>Shield.</p>" }, rarity: "common" },
        flags: {},
        toObject() {
          return {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system),
            flags: {}
          };
        }
      }
    ]
  }
};

if (classifyInventoryItem(fakeActor.items.contents[0]) !== "weapon") {
  throw new Error("Scimitar should classify as weapon");
}
if (classifyInventoryItem(fakeActor.items.contents[1]) !== "armor") {
  throw new Error("Leather Armor should classify as armor");
}
if (classifyInventoryItem(fakeActor.items.contents[2]) !== "shield") {
  throw new Error("Shield should classify as shield");
}

const quality = pickEquipmentQuality({ broken: 1, worn: 0, standard: 0, fine: 0, masterwork: 0 });
if (quality !== "broken") throw new Error("Weighted quality pick failed");
const qData = applyEquipmentQuality({
  name: "Scimitar",
  type: "weapon",
  system: { price: { value: 25, denomination: "gp" }, description: { value: "<p>A scimitar.</p>" }, quantity: 1 },
  flags: {}
}, "broken");
if (qData.name !== "Broken Scimitar") throw new Error(`Expected Broken Scimitar, got ${qData.name}`);
if (Number(qData.system.price.value) >= 25) throw new Error("Broken quality should reduce price");

const goblinLoot = await generateCreatureLoot({
  context: {
    name: "Goblin",
    creatureType: "humanoid",
    creatureSubtype: "goblinoid",
    size: "sm",
    challengeRating: 0.25,
    isWolf: false,
    isBoss: false,
    isNamed: false
  },
  survivalTotal: 18,
  naturalDie: 12,
  isNatural20: false,
  actor: fakeActor
});
if (goblinLoot.profileId !== "goblin") throw new Error("Goblin generation used wrong profile");
if (!goblinLoot.items.length) throw new Error("Goblin generation produced no items");
const hasPart = goblinLoot.items.some((i) => String(i.definitionId || "").startsWith("goblin-"));
if (!hasPart) throw new Error("Goblin loot missing monster parts");
const currencyTotal = aggregateCurrencyFromItems(goblinLoot.items);
const currencySum = Object.values(currencyTotal).reduce((a, b) => a + b, 0);
if (currencySum <= 0) throw new Error("Goblin loot should usually include some currency at total 18");
const hasEquip = goblinLoot.items.some((i) => i.kind === "equipment");
// Equipment is chance-based; with three items and high chances it should often drop, but not guaranteed.
// Force-check that equipment entries, when present, carry itemData + quality.
for (const entry of goblinLoot.items.filter((i) => i.kind === "equipment")) {
  if (!entry.itemData) throw new Error("Equipment entry missing itemData snapshot");
  if (!entry.equipmentQuality) throw new Error("Equipment entry missing quality");
  if (!entry.baseItemData) throw new Error("Equipment entry missing baseItemData");
}
void hasEquip;

const fakeOrc = {
  id: "orc1",
  name: "Orc",
  items: {
    contents: [
      {
        id: "w1",
        name: "Greataxe",
        type: "weapon",
        img: "icons/svg/sword.svg",
        system: {
          quantity: 1,
          type: { value: "martialM" },
          price: { value: 30, denomination: "gp" },
          description: { value: "<p>A greataxe.</p>" },
          rarity: "common"
        },
        flags: {},
        toObject() {
          return {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system),
            flags: {}
          };
        }
      },
      {
        id: "w2",
        name: "Javelin",
        type: "weapon",
        img: "icons/svg/sword.svg",
        system: {
          quantity: 3,
          type: { value: "simpleR" },
          price: { value: 5, denomination: "sp" },
          description: { value: "<p>A javelin.</p>" },
          rarity: "common"
        },
        flags: {},
        toObject() {
          return {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system),
            flags: {}
          };
        }
      },
      {
        id: "a1",
        name: "Hide Armor",
        type: "equipment",
        img: "icons/svg/armor.svg",
        system: {
          quantity: 1,
          type: { value: "medium" },
          price: { value: 10, denomination: "gp" },
          description: { value: "<p>Hide armor.</p>" },
          rarity: "common"
        },
        flags: {},
        toObject() {
          return {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system),
            flags: {}
          };
        }
      }
    ]
  }
};

const orcLoot = await generateCreatureLoot({
  context: {
    name: "Orc",
    creatureType: "humanoid",
    creatureSubtype: "orc",
    size: "med",
    challengeRating: 0.5,
    isWolf: false,
    isBoss: false,
    isNamed: false
  },
  survivalTotal: 18,
  naturalDie: 12,
  isNatural20: false,
  actor: fakeOrc
});
if (orcLoot.profileId !== "orc") throw new Error("Orc generation used wrong profile");
if (!orcLoot.items.length) throw new Error("Orc generation produced no items");
const hasOrcPart = orcLoot.items.some((i) => String(i.definitionId || "").startsWith("orc-"));
if (!hasOrcPart) throw new Error("Orc loot missing monster parts");
if (orcLoot.items.some((i) => String(i.definitionId || "").includes("goblin"))) {
  throw new Error("Orc generation leaked goblin definitions");
}
const orcCurrency = aggregateCurrencyFromItems(orcLoot.items);
const orcCurrencySum = Object.values(orcCurrency).reduce((a, b) => a + b, 0);
if (orcCurrencySum <= 0) throw new Error("Orc loot should usually include some currency at total 18");
for (const entry of orcLoot.items.filter((i) => i.kind === "equipment")) {
  if (!entry.itemData) throw new Error("Orc equipment entry missing itemData snapshot");
  if (!entry.equipmentQuality) throw new Error("Orc equipment entry missing quality");
  if (!entry.baseItemData) throw new Error("Orc equipment entry missing baseItemData");
}

const phaseSpider = resolveCreatureProfile({
  name: "Phase Spider",
  creatureType: "monstrosity",
  creatureSubtype: ""
});
if (phaseSpider?.id !== "spider") {
  throw new Error(`Expected spider profile for Phase Spider, got ${phaseSpider?.id}`);
}
if (spider?.pools?.monsterParts?.type !== "definitions") {
  throw new Error("Spider profile should be multi-pool with monsterParts");
}

const fakeSpider = {
  id: "sp1",
  name: "Giant Spider",
  items: {
    contents: [
      {
        id: "w1",
        name: "Shortsword",
        type: "weapon",
        img: "icons/svg/sword.svg",
        system: {
          quantity: 1,
          type: { value: "martialM" },
          price: { value: 10, denomination: "gp" },
          description: { value: "<p>A shortsword.</p>" },
          rarity: "common"
        },
        flags: {},
        toObject() {
          return {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system),
            flags: {}
          };
        }
      },
      {
        id: "p1",
        name: "Potion of Healing",
        type: "consumable",
        img: "icons/svg/acid.svg",
        system: {
          quantity: 1,
          type: { value: "potion" },
          price: { value: 50, denomination: "gp" },
          description: { value: "<p>A potion.</p>" },
          rarity: "common"
        },
        flags: {},
        toObject() {
          return {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system),
            flags: {}
          };
        }
      }
    ]
  }
};

const spiderLoot = await generateCreatureLoot({
  context: {
    name: "Giant Spider",
    creatureType: "beast",
    creatureSubtype: "",
    size: "large",
    challengeRating: 1,
    isWolf: false,
    isBoss: false,
    isNamed: false
  },
  survivalTotal: 18,
  naturalDie: 12,
  isNatural20: false,
  actor: fakeSpider
});
if (spiderLoot.profileId !== "spider") throw new Error("Spider generation used wrong profile");
if (!spiderLoot.items.length) throw new Error("Spider generation produced no items");
const hasSpiderPart = spiderLoot.items.some((i) =>
  ["spider-silk", "spider-fang", "spider-venom-gland", "spider-eye", "spider-chitin", "spinneret"].includes(
    String(i.definitionId || "")
  )
);
if (!hasSpiderPart) throw new Error("Spider loot missing monster parts");
if (spiderLoot.items.some((i) => String(i.definitionId || "").includes("goblin") || String(i.definitionId || "").includes("orc-"))) {
  throw new Error("Spider generation leaked humanoid definitions");
}
for (const entry of spiderLoot.items.filter((i) => i.kind === "equipment")) {
  if (!entry.itemData) throw new Error("Spider equipment entry missing itemData snapshot");
  if (!entry.equipmentQuality) throw new Error("Spider equipment entry missing quality");
  if (!entry.baseItemData) throw new Error("Spider equipment entry missing baseItemData");
}

const sumPartQty = (loot) => loot.items
  .filter((i) => String(i.definitionId || "").startsWith("dragon-"))
  .reduce((n, i) => n + Number(i.quantity || 0), 0);

async function sampleDragonParts(name, size, cr, isBoss, runs = 8) {
  let total = 0;
  for (let i = 0; i < runs; i += 1) {
    const loot = await generateCreatureLoot({
      context: {
        name,
        creatureType: "dragon",
        creatureSubtype: "",
        size,
        challengeRating: cr,
        isWolf: false,
        isBoss,
        isNamed: false
      },
      survivalTotal: 18,
      naturalDie: 12,
      isNatural20: false,
      actor: null
    });
    if (loot.profileId !== "dragon") throw new Error(`${name} used wrong profile`);
    total += sumPartQty(loot);
  }
  return total / runs;
}

const wyrmAvg = await sampleDragonParts("Red Dragon Wyrmling", "med", 4, false);
const ancientAvg = await sampleDragonParts("Ancient Red Dragon", "grg", 24, true);
if (!(ancientAvg > wyrmAvg * 1.5)) {
  throw new Error(
    `Ancient dragons should average far more parts than wyrmlings (ancient=${ancientAvg}, wyrmling=${wyrmAvg})`
  );
}

const ancientLoot = await generateCreatureLoot({
  context: {
    name: "Ancient Red Dragon",
    creatureType: "dragon",
    creatureSubtype: "",
    size: "grg",
    challengeRating: 24,
    isWolf: false,
    isBoss: true,
    isNamed: false
  },
  survivalTotal: 18,
  naturalDie: 12,
  isNatural20: false,
  actor: {
    id: "dr1",
    name: "Ancient Red Dragon",
    items: {
      contents: [
        {
          id: "w1",
          name: "Flame Tongue",
          type: "weapon",
          img: "icons/svg/sword.svg",
          system: {
            quantity: 1,
            type: { value: "martialM" },
            price: { value: 5000, denomination: "gp" },
            description: { value: "<p>A flame tongue.</p>" },
            rarity: "rare"
          },
          flags: {},
          toObject() {
            return {
              name: this.name,
              type: this.type,
              img: this.img,
              system: structuredClone(this.system),
              flags: {}
            };
          }
        }
      ]
    }
  }
});
if (ancientLoot.profileId !== "dragon") throw new Error("Ancient dragon used wrong profile");
if (!ancientLoot.items.length) throw new Error("Ancient dragon generation produced no items");
const hasDragonPart = ancientLoot.items.some((i) => String(i.definitionId || "").startsWith("dragon-"));
if (!hasDragonPart) throw new Error("Dragon loot missing monster parts");
const ancientCurrency = aggregateCurrencyFromItems(ancientLoot.items);
const ancientCurrencySum = Object.values(ancientCurrency).reduce((a, b) => a + b, 0);
if (ancientCurrencySum <= 0) throw new Error("Ancient dragon should usually include hoard currency");


const bugbear = resolveCreatureProfile({ name: "Bugbear", creatureType: "humanoid", creatureSubtype: "goblinoid" });
const zombie = resolveCreatureProfile({ name: "Zombie", creatureType: "undead", creatureSubtype: "" });
const skeleton = resolveCreatureProfile({ name: "Skeleton", creatureType: "undead", creatureSubtype: "" });
const mummy = resolveCreatureProfile({ name: "Mummy", creatureType: "undead", creatureSubtype: "" });
const mummyLord = resolveCreatureProfile({ name: "Mummy Lord", creatureType: "undead", creatureSubtype: "" });
const lich = resolveCreatureProfile({ name: "Lich", creatureType: "undead", creatureSubtype: "" });
const demilich = resolveCreatureProfile({ name: "Demilich", creatureType: "undead", creatureSubtype: "" });
if (bugbear?.id !== "bugbear") throw new Error(`Expected bugbear profile, got ${bugbear?.id}`);
if (zombie?.id !== "zombie") throw new Error(`Expected zombie profile, got ${zombie?.id}`);
if (skeleton?.id !== "skeleton") throw new Error(`Expected skeleton profile, got ${skeleton?.id}`);
if (mummy?.id !== "mummy") throw new Error(`Expected mummy profile, got ${mummy?.id}`);
if (mummyLord?.id !== "mummy") throw new Error(`Expected mummy profile for Mummy Lord, got ${mummyLord?.id}`);
if (lich?.id !== "lich") throw new Error(`Expected lich profile, got ${lich?.id}`);
if (demilich?.id !== "lich") throw new Error(`Expected lich profile for Demilich, got ${demilich?.id}`);
if (resolveLootScale(lich, { name: "Demilich", size: "tiny" }) !== 0.65) {
  throw new Error("Demilich lootScale should be 0.65");
}
if (resolveLootScale(lich, { name: "Archlich", size: "med" }) !== 1.35) {
  throw new Error("Archlich lootScale should be 1.35");
}

const bugbearLoot = await generateCreatureLoot({
  context: { name: "Bugbear", creatureType: "humanoid", creatureSubtype: "goblinoid", size: "med", challengeRating: 1, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (bugbearLoot.profileId !== "bugbear") throw new Error("Bugbear generation used wrong profile");
if (!bugbearLoot.items.some((i) => String(i.definitionId || "").startsWith("bugbear-"))) {
  throw new Error("Bugbear loot missing bugbear parts");
}

const zombieLoot = await generateCreatureLoot({
  context: { name: "Zombie", creatureType: "undead", creatureSubtype: "", size: "med", challengeRating: 0.25, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 16, naturalDie: 10, isNatural20: false, actor: null
});
if (zombieLoot.profileId !== "zombie") throw new Error("Zombie generation used wrong profile");
if (!zombieLoot.items.some((i) => ["rotten-flesh","zombie-tooth","zombie-hand","grave-dirt"].includes(String(i.definitionId || "")))) {
  throw new Error("Zombie loot missing parts");
}

const skeletonLoot = await generateCreatureLoot({
  context: { name: "Skeleton", creatureType: "undead", creatureSubtype: "", size: "med", challengeRating: 0.25, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 16, naturalDie: 10, isNatural20: false, actor: null
});
if (skeletonLoot.profileId !== "skeleton") throw new Error("Skeleton generation used wrong profile");

const mummyLoot = await generateCreatureLoot({
  context: { name: "Mummy", creatureType: "undead", creatureSubtype: "", size: "med", challengeRating: 3, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (mummyLoot.profileId !== "mummy") throw new Error("Mummy generation used wrong profile");

const lichLoot = await generateCreatureLoot({
  context: { name: "Lich", creatureType: "undead", creatureSubtype: "", size: "med", challengeRating: 21, isWolf: false, isBoss: true, isNamed: false },
  survivalTotal: 20, naturalDie: 15, isNatural20: false,
  actor: {
    id: "lich1", name: "Lich",
    items: { contents: [{
      id: "st1", name: "Staff of Power", type: "weapon", img: "icons/svg/sword.svg",
      system: { quantity: 1, type: { value: "simpleM" }, price: { value: 10000, denomination: "gp" }, description: { value: "<p>Staff.</p>" }, rarity: "very rare" },
      flags: {},
      toObject() { return { name: this.name, type: this.type, img: this.img, system: structuredClone(this.system), flags: {} }; }
    }] }
  }
});
if (lichLoot.profileId !== "lich") throw new Error("Lich generation used wrong profile");
if (!lichLoot.items.some((i) => ["lich-dust","necrotic-crystal","soul-ash","phylactery-shard","ectoplasm-vial"].includes(String(i.definitionId || "")))) {
  throw new Error("Lich loot missing high-tier parts");
}
const lichCurrency = aggregateCurrencyFromItems(lichLoot.items);
const lichGp = Number(lichCurrency.gp || 0) + Number(lichCurrency.pp || 0) * 10;
if (lichGp < 20) throw new Error(`Lich should drop serious coin, got gp-equivalent ${lichGp}`);

const zombieCurrency = aggregateCurrencyFromItems(zombieLoot.items);
const zombieGp = Number(zombieCurrency.gp || 0) + Number(zombieCurrency.pp || 0) * 10 + Number(zombieCurrency.sp || 0) / 10;
if (lichGp <= zombieGp) {
  throw new Error(`Lich coin should exceed zombie coin (lich=${lichGp}, zombie=${zombieGp})`);
}



const human = resolveCreatureProfile({ name: "Human Bandit", creatureType: "humanoid", creatureSubtype: "human" });
const elf = resolveCreatureProfile({ name: "Wood Elf", creatureType: "humanoid", creatureSubtype: "elf" });
const drow = resolveCreatureProfile({ name: "Drow", creatureType: "humanoid", creatureSubtype: "elf" });
const dwarf = resolveCreatureProfile({ name: "Dwarf", creatureType: "humanoid", creatureSubtype: "dwarf" });
const halfling = resolveCreatureProfile({ name: "Halfling", creatureType: "humanoid", creatureSubtype: "halfling" });
const halfElf = resolveCreatureProfile({ name: "Half-Elf Scout", creatureType: "humanoid", creatureSubtype: "half-elf" });
const duergar = resolveCreatureProfile({ name: "Duergar", creatureType: "humanoid", creatureSubtype: "dwarf" });
if (human?.id !== "human") throw new Error(`Expected human profile, got ${human?.id}`);
if (elf?.id !== "elf") throw new Error(`Expected elf profile for Wood Elf, got ${elf?.id}`);
if (drow?.id !== "elf") throw new Error(`Expected elf profile for Drow, got ${drow?.id}`);
if (dwarf?.id !== "dwarf") throw new Error(`Expected dwarf profile, got ${dwarf?.id}`);
if (halfling?.id !== "halfling") throw new Error(`Expected halfling profile, got ${halfling?.id}`);
if (halfElf?.id === "elf" || halfElf?.id === "human") throw new Error("Half-elf must not resolve to elf or human profile");
if (duergar?.id === "dwarf") throw new Error("Duergar must not resolve to dwarf profile");

const humanLoot = await generateCreatureLoot({
  context: { name: "Human Bandit", creatureType: "humanoid", creatureSubtype: "human", size: "med", challengeRating: 0.25, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (humanLoot.profileId !== "human") throw new Error("Human generation used wrong profile");
if (!humanLoot.items.some((i) => String(i.definitionId || "").startsWith("human-"))) {
  throw new Error("Human loot missing human parts");
}

const elfLoot = await generateCreatureLoot({
  context: { name: "High Elf", creatureType: "humanoid", creatureSubtype: "elf", size: "med", challengeRating: 0.5, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (elfLoot.profileId !== "elf") throw new Error("Elf generation used wrong profile");

const dwarfLoot = await generateCreatureLoot({
  context: { name: "Dwarf Guard", creatureType: "humanoid", creatureSubtype: "dwarf", size: "med", challengeRating: 0.5, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (dwarfLoot.profileId !== "dwarf") throw new Error("Dwarf generation used wrong profile");
if (!dwarfLoot.items.some((i) => String(i.definitionId || "").includes("dwarf"))) {
  throw new Error("Dwarf loot missing dwarf parts");
}

const halflingLoot = await generateCreatureLoot({
  context: { name: "Halfling", creatureType: "humanoid", creatureSubtype: "halfling", size: "sm", challengeRating: 0, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 16, naturalDie: 10, isNatural20: false, actor: null
});
if (halflingLoot.profileId !== "halfling") throw new Error("Halfling generation used wrong profile");



const fiend = resolveCreatureProfile({ name: "Barbed Devil", creatureType: "fiend", creatureSubtype: "devil", size: "med" });
const imp = resolveCreatureProfile({ name: "Imp", creatureType: "fiend", creatureSubtype: "devil", size: "tiny" });
const quasit = resolveCreatureProfile({ name: "Quasit", creatureType: "fiend", creatureSubtype: "demon", size: "tiny" });
const hellHound = resolveCreatureProfile({ name: "Hell Hound", creatureType: "fiend", creatureSubtype: "", size: "med" });
const pitFiend = resolveCreatureProfile({ name: "Pit Fiend", creatureType: "fiend", creatureSubtype: "devil", size: "lg" });
const balor = resolveCreatureProfile({ name: "Balor", creatureType: "fiend", creatureSubtype: "demon", size: "huge" });
if (fiend?.id !== "fiend") throw new Error(`Expected fiend profile for Barbed Devil, got ${fiend?.id}`);
if (imp?.id !== "fiend") throw new Error(`Expected fiend profile for Imp, got ${imp?.id}`);
if (quasit?.id !== "fiend") throw new Error(`Expected fiend profile for Quasit, got ${quasit?.id}`);
if (hellHound?.id !== "fiend") throw new Error(`Expected fiend profile for Hell Hound, got ${hellHound?.id}`);
if (pitFiend?.id !== "fiend") throw new Error(`Expected fiend profile for Pit Fiend, got ${pitFiend?.id}`);
if (balor?.id !== "fiend") throw new Error(`Expected fiend profile for Balor, got ${balor?.id}`);

if (resolveLootScale(fiend, { name: "Imp", size: "tiny" }) !== 0.4) {
  throw new Error("Imp lootScale should be 0.4");
}
if (resolveLootScale(fiend, { name: "Quasit", size: "tiny" }) !== 0.4) {
  throw new Error("Quasit lootScale should be 0.4");
}
if (resolveLootScale(fiend, { name: "Hell Hound", size: "med" }) !== 0.7) {
  throw new Error("Hell Hound lootScale should be 0.7");
}
if (resolveLootScale(fiend, { name: "Bearded Devil", size: "med" }) !== 0.9) {
  throw new Error("Bearded Devil lootScale should be 0.9");
}
if (resolveLootScale(fiend, { name: "Barbed Devil", size: "med" }) !== 1.1) {
  throw new Error("Barbed Devil lootScale should be 1.1");
}
if (resolveLootScale(fiend, { name: "Chain Devil", size: "med" }) !== 1.2) {
  throw new Error("Chain Devil lootScale should be 1.2");
}
if (resolveLootScale(fiend, { name: "Bone Devil", size: "lg" }) !== 1.3) {
  throw new Error("Bone Devil lootScale should be 1.3");
}
if (resolveLootScale(fiend, { name: "Horned Devil", size: "lg" }) !== 1.45) {
  throw new Error("Horned Devil lootScale should be 1.45");
}
if (resolveLootScale(fiend, { name: "Pit Fiend", size: "lg" }) !== 1.85) {
  throw new Error("Pit Fiend lootScale should be 1.85");
}
if (resolveLootScale(fiend, { name: "Balor", size: "huge" }) !== 1.9) {
  throw new Error("Balor lootScale should be 1.9");
}

const impLoot = await generateCreatureLoot({
  context: { name: "Imp", creatureType: "fiend", creatureSubtype: "devil", size: "tiny", challengeRating: 1, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 16, naturalDie: 10, isNatural20: false, actor: null
});
if (impLoot.profileId !== "fiend") throw new Error("Imp generation used wrong profile");
if (!impLoot.items.some((i) => ["fiend-ichor","fiend-horn","brimstone-chunk","imp-wing"].includes(String(i.definitionId || "")))) {
  throw new Error("Imp loot missing fiend parts");
}

const balorLoot = await generateCreatureLoot({
  context: { name: "Balor", creatureType: "fiend", creatureSubtype: "demon", size: "huge", challengeRating: 19, isWolf: false, isBoss: true, isNamed: false },
  survivalTotal: 22, naturalDie: 18, isNatural20: false,
  actor: {
    id: "balor1", name: "Balor",
    items: { contents: [{
      id: "w1", name: "Longsword", type: "weapon", img: "icons/svg/sword.svg",
      system: { quantity: 1, type: { value: "martialM" }, price: { value: 15, denomination: "gp" }, description: { value: "<p>Sword.</p>" }, rarity: "common" },
      flags: {},
      toObject() { return { name: this.name, type: this.type, img: this.img, system: structuredClone(this.system), flags: {} }; }
    }] }
  }
});
if (balorLoot.profileId !== "fiend") throw new Error("Balor generation used wrong profile");
if (!balorLoot.items.some((i) => String(i.definitionId || "").match(/fiend|brimstone|balor|pit-fiend|horn|ichor/))) {
  throw new Error("Balor loot missing fiend parts");
}

let impPartSum = 0;
let balorPartSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: { name: "Imp", creatureType: "fiend", creatureSubtype: "devil", size: "tiny", challengeRating: 1, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const b = await generateCreatureLoot({
    context: { name: "Balor", creatureType: "fiend", creatureSubtype: "demon", size: "huge", challengeRating: 19, isWolf: false, isBoss: true, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  impPartSum += a.items.filter((it) => ["monster-part","part"].includes(String(it.category || "")) || String(it.definitionId || "").match(/fiend|brimstone|hellhound|imp|quasit|barbed|devil-chain|bone-spur|pit-fiend|balor/)).reduce((s, it) => s + Number(it.quantity || 1), 0);
  balorPartSum += b.items.filter((it) => String(it.definitionId || "").match(/fiend|brimstone|hellhound|imp|quasit|barbed|devil-chain|bone-spur|pit-fiend|balor/)).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const impAvg = impPartSum / 40;
const balorAvg = balorPartSum / 40;
if (balorAvg <= impAvg * 1.3) {
  throw new Error(`Balor should average more scaled parts than Imp (balor=${balorAvg}, imp=${impAvg})`);
}



const fey = resolveCreatureProfile({ name: "Dryad", creatureType: "fey", creatureSubtype: "", size: "med" });
const pixie = resolveCreatureProfile({ name: "Pixie", creatureType: "fey", creatureSubtype: "", size: "tiny" });
const satyr = resolveCreatureProfile({ name: "Satyr", creatureType: "fey", creatureSubtype: "", size: "med" });
const redcap = resolveCreatureProfile({ name: "Redcap", creatureType: "fey", creatureSubtype: "", size: "sm" });
const greenHag = resolveCreatureProfile({ name: "Green Hag", creatureType: "fey", creatureSubtype: "", size: "med" });
const nightHag = resolveCreatureProfile({ name: "Night Hag", creatureType: "fiend", creatureSubtype: "", size: "med" });
if (fey?.id !== "fey") throw new Error(`Expected fey profile for Dryad, got ${fey?.id}`);
if (pixie?.id !== "fey") throw new Error(`Expected fey profile for Pixie, got ${pixie?.id}`);
if (satyr?.id !== "fey") throw new Error(`Expected fey profile for Satyr, got ${satyr?.id}`);
if (redcap?.id !== "fey") throw new Error(`Expected fey profile for Redcap, got ${redcap?.id}`);
if (greenHag?.id !== "fey") throw new Error(`Expected fey profile for Green Hag, got ${greenHag?.id}`);
if (nightHag?.id !== "fey") throw new Error(`Expected fey profile for Night Hag, got ${nightHag?.id}`);

if (resolveLootScale(fey, { name: "Pixie", size: "tiny" }) !== 0.4) {
  throw new Error("Pixie lootScale should be 0.4");
}
if (resolveLootScale(fey, { name: "Satyr", size: "med" }) !== 0.55) {
  throw new Error("Satyr lootScale should be 0.55");
}
if (resolveLootScale(fey, { name: "Dryad", size: "med" }) !== 0.75) {
  throw new Error("Dryad lootScale should be 0.75");
}
if (resolveLootScale(fey, { name: "Redcap", size: "sm" }) !== 0.95) {
  throw new Error("Redcap lootScale should be 0.95");
}
if (resolveLootScale(fey, { name: "Green Hag", size: "med" }) !== 1.1) {
  throw new Error("Green Hag lootScale should be 1.1");
}
if (resolveLootScale(fey, { name: "Night Hag", size: "med" }) !== 1.4) {
  throw new Error("Night Hag lootScale should be 1.4");
}
if (resolveLootScale(fey, { name: "Hag", size: "med" }) !== 1.15) {
  throw new Error("Hag lootScale should be 1.15");
}

const pixieLoot = await generateCreatureLoot({
  context: { name: "Pixie", creatureType: "fey", creatureSubtype: "", size: "tiny", challengeRating: 0.25, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 16, naturalDie: 10, isNatural20: false, actor: null
});
if (pixieLoot.profileId !== "fey") throw new Error("Pixie generation used wrong profile");
if (!pixieLoot.items.some((i) => ["fey-dust","fey-blood-vial","pixie-wing","dryad-bark","satyr-horn","redcap-tooth","hag-hair","hag-eye"].includes(String(i.definitionId || "")))) {
  throw new Error("Pixie loot missing fey parts");
}

const nightHagLoot = await generateCreatureLoot({
  context: { name: "Night Hag", creatureType: "fiend", creatureSubtype: "", size: "med", challengeRating: 5, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 20, naturalDie: 15, isNatural20: false, actor: null
});
if (nightHagLoot.profileId !== "fey") throw new Error("Night Hag generation used wrong profile");

let pixiePartSum = 0;
let nightPartSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: { name: "Pixie", creatureType: "fey", creatureSubtype: "", size: "tiny", challengeRating: 0.25, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const b = await generateCreatureLoot({
    context: { name: "Night Hag", creatureType: "fiend", creatureSubtype: "", size: "med", challengeRating: 5, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const partRe = /fey|pixie|dryad|satyr|redcap|hag/;
  pixiePartSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  nightPartSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const pixieAvg = pixiePartSum / 40;
const nightAvg = nightPartSum / 40;
if (nightAvg <= pixieAvg * 1.25) {
  throw new Error(`Night Hag should average more scaled parts than Pixie (night=${nightAvg}, pixie=${pixieAvg})`);
}



const monstrosity = resolveCreatureProfile({ name: "Owlbear", creatureType: "monstrosity", creatureSubtype: "", size: "lg" });
const cockatrice = resolveCreatureProfile({ name: "Cockatrice", creatureType: "monstrosity", creatureSubtype: "", size: "sm" });
const griffon = resolveCreatureProfile({ name: "Griffon", creatureType: "monstrosity", creatureSubtype: "", size: "lg" });
const griffin = resolveCreatureProfile({ name: "Griffin", creatureType: "monstrosity", creatureSubtype: "", size: "lg" });
const hydra = resolveCreatureProfile({ name: "Hydra", creatureType: "monstrosity", creatureSubtype: "", size: "huge" });
const purpleWorm = resolveCreatureProfile({ name: "Purple Worm", creatureType: "monstrosity", creatureSubtype: "", size: "gargantuan" });
const mimic = resolveCreatureProfile({ name: "Mimic", creatureType: "monstrosity", creatureSubtype: "", size: "med" });
const roper = resolveCreatureProfile({ name: "Roper", creatureType: "monstrosity", creatureSubtype: "", size: "lg" });
if (monstrosity?.id !== "monstrosity") throw new Error(`Expected monstrosity for Owlbear, got ${monstrosity?.id}`);
if (cockatrice?.id !== "monstrosity") throw new Error(`Expected monstrosity for Cockatrice, got ${cockatrice?.id}`);
if (griffon?.id !== "monstrosity") throw new Error(`Expected monstrosity for Griffon, got ${griffon?.id}`);
if (griffin?.id !== "monstrosity") throw new Error(`Expected monstrosity for Griffin, got ${griffin?.id}`);
if (hydra?.id !== "monstrosity") throw new Error(`Expected monstrosity for Hydra, got ${hydra?.id}`);
if (purpleWorm?.id !== "monstrosity") throw new Error(`Expected monstrosity for Purple Worm, got ${purpleWorm?.id}`);
if (mimic?.id !== "monstrosity") throw new Error(`Expected monstrosity for Mimic, got ${mimic?.id}`);
if (roper?.id !== "monstrosity") throw new Error(`Expected monstrosity for Roper, got ${roper?.id}`);

if (resolveLootScale(monstrosity, { name: "Cockatrice", size: "sm" }) !== 0.4) throw new Error("Cockatrice lootScale should be 0.4");
if (resolveLootScale(monstrosity, { name: "Owlbear", size: "lg" }) !== 0.8) throw new Error("Owlbear lootScale should be 0.8");
if (resolveLootScale(monstrosity, { name: "Basilisk", size: "med" }) !== 0.85) throw new Error("Basilisk lootScale should be 0.85");
if (resolveLootScale(monstrosity, { name: "Chimera", size: "lg" }) !== 1.3) throw new Error("Chimera lootScale should be 1.3");
if (resolveLootScale(monstrosity, { name: "Hydra", size: "huge" }) !== 1.5) throw new Error("Hydra lootScale should be 1.5");
if (resolveLootScale(monstrosity, { name: "Bulette", size: "lg" }) !== 1.15) throw new Error("Bulette lootScale should be 1.15");
if (resolveLootScale(monstrosity, { name: "Ankheg", size: "lg" }) !== 0.65) throw new Error("Ankheg lootScale should be 0.65");
if (resolveLootScale(monstrosity, { name: "Purple Worm", size: "grg" }) !== 1.9) throw new Error("Purple Worm lootScale should be 1.9");
if (resolveLootScale(monstrosity, { name: "Manticore", size: "lg" }) !== 0.95) throw new Error("Manticore lootScale should be 0.95");

const owlbearLoot = await generateCreatureLoot({
  context: { name: "Owlbear", creatureType: "monstrosity", creatureSubtype: "", size: "lg", challengeRating: 3, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (owlbearLoot.profileId !== "monstrosity") throw new Error("Owlbear generation used wrong profile");
if (!owlbearLoot.items.some((i) => ["monstrosity-hide","monstrosity-fang","owlbear-feather","owlbear-claw"].includes(String(i.definitionId || "")))) {
  throw new Error("Owlbear loot missing monstrosity parts");
}

const purpleLoot = await generateCreatureLoot({
  context: { name: "Purple Worm", creatureType: "monstrosity", creatureSubtype: "", size: "grg", challengeRating: 15, isWolf: false, isBoss: true, isNamed: false },
  survivalTotal: 22, naturalDie: 18, isNatural20: false, actor: null
});
if (purpleLoot.profileId !== "monstrosity") throw new Error("Purple Worm generation used wrong profile");

let cockSum = 0;
let wormSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: { name: "Cockatrice", creatureType: "monstrosity", creatureSubtype: "", size: "sm", challengeRating: 0.5, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const b = await generateCreatureLoot({
    context: { name: "Purple Worm", creatureType: "monstrosity", creatureSubtype: "", size: "grg", challengeRating: 15, isWolf: false, isBoss: true, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const partRe = /monstrosity|owlbear|basilisk|cockatrice|chimera|griffon|manticore|hydra|bulette|ankheg|purple-worm|mimic|roper/;
  cockSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  wormSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const cockAvg = cockSum / 40;
const wormAvg = wormSum / 40;
if (wormAvg <= cockAvg * 1.3) {
  throw new Error(`Purple Worm should average more scaled parts than Cockatrice (worm=${wormAvg}, cockatrice=${cockAvg})`);
}


console.log("Offline pack verification passed.");
console.log(`module.json version: ${moduleJson.version}`);
console.log(`pack label: ${packDecl.label}`);
console.log(`definitions: ${listLootDefinitions().length}`);
console.log(
  `wolf items: ${wolfLoot.items.length}; goblin items: ${goblinLoot.items.length}; orc items: ${orcLoot.items.length}; spider items: ${spiderLoot.items.length}; wyrmling avg parts: ${wyrmAvg.toFixed(1)}; ancient avg parts: ${ancientAvg.toFixed(1)}`
);
console.log("Exact shipped LevelDB files:");
for (const name of shipped) {
  const size = statSync(path.join(packDir, name)).size;
  console.log(`  packs/loot-items/${name} (${size} bytes)`);
}
