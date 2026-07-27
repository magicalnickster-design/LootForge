import { ClassicLevel } from "classic-level";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packDir = path.join(root, "packs/loot-items");
const moduleJson = JSON.parse(readFileSync(path.join(root, "module.json"), "utf8"));

if (moduleJson.version !== "0.6.1") {
  throw new Error(`Expected module version 0.6.1, got ${moduleJson.version}`);
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
  "Worm Tunnel Chart",
  "Giant Tooth",
  "Giant Knuckle Bone",
  "Giant Hair Lock",
  "Hill Giant Throwing Rock",
  "Stone Giant Chip",
  "Frost Giant Ice Shard",
  "Fire Giant Slag",
  "Cloud Giant Silk Scrap",
  "Storm Spark Stone",
  "Giant Thumb Ring",
  "Boulder Charm",
  "Rune-Carved Pebble",
  "Giant Boot Scrap",
  "Crushed Wagon Spoke",
  "Greasy Sack Scrap",
  "Cracked Boulder Chunk",
  "Tribute List",
  "Giant Clan Mark",
  "Storm Omen Note",
  "Raiding Map",
  "Elemental Essence",
  "Fire Ember Core",
  "Water Brine Pearl",
  "Earth Living Stone",
  "Air Wind Whorl",
  "Scorched Cinder",
  "Tidal Foam Vial",
  "Gravel Cluster",
  "Gust Ribbon",
  "Myrmidon Plate Shard",
  "Bound Element Sigil",
  "Planar Ash Charm",
  "Storm Glass Bead",
  "Cooled Slag Lump",
  "Puddle Residue",
  "Cracked Dirt Clod",
  "Spent Breeze Pouch",
  "Summoning Circle Scrap",
  "Elemental Binding Note",
  "Planar Rift Map",
  "Aberration Ichor",
  "Tentacle Scrap",
  "Illithid Tentacle",
  "Elder Brain Matter",
  "Intellect Devourer Brain",
  "Beholder Eyestalk",
  "Central Eye Lens",
  "Death Tyrant Tooth",
  "Aboleth Mucus",
  "Aboleth Tentacle Tip",
  "Carrion Crawler Tentacle",
  "Chuul Pincer",
  "Gibbering Flesh",
  "Psionic Crystal Chip",
  "Aberrant Eye Amulet",
  "Slime Residue",
  "Chitin Flake",
  "Broken Thrall Collar",
  "Colony Orders",
  "Underdark Chart",
  "Stolen Memory Fragment",
  "Ooze Residue",
  "Corrosive Enzyme",
  "Gray Ooze Sample",
  "Cube Jelly",
  "Black Pudding Blob",
  "Ochre Jelly Blob",
  "Protoplasm Core",
  "Acid-Scarred Coin",
  "Undigested Ring",
  "Slime-Coated Gem",
  "Dissolved Boot Sole",
  "Etched Metal Scrap",
  "Sticky Film",
  "Partially Digested Note",
  "Dungeon Warning Scrap",
  "Ooze Lair Map",
  "Construct Gears",
  "Arcane Core Shard",
  "Flying Sword Hilt",
  "Helmed Horror Plume",
  "Helmed Horror Plate",
  "Flesh Golem Stitching",
  "Clay Golem Chunk",
  "Stone Golem Chip",
  "Iron Golem Plate",
  "Guardian Amulet Shard",
  "Clockwork Spring",
  "Binding Rune Plate",
  "Rusted Rivet",
  "Scorched Wiring",
  "Bent Armor Joint",
  "Creator Schematic Scrap",
  "Activation Phrase Note",
  "Golem Manual Page",
  "Plant Fiber",
  "Living Sap Vial",
  "Twig Blight Twig",
  "Needle Blight Needle",
  "Vine Blight Tendril",
  "Myconid Spore Sac",
  "Shambling Vine Mass",
  "Treant Bark Plate",
  "Heartwood Core",
  "Dry Leaf Clump",
  "Thorn Cluster",
  "Moldy Root",
  "Spore Dust Pouch",
  "Blossom Charm",
  "Amber Sap Bead",
  "Fungal Lantern Cap",
  "Grove Warning Scrap",
  "Blight Circle Map",
  "Treant Oath Bark",
  "Celestial Feather",
  "Radiant Essence Vial",
  "Pegasus Feather",
  "Unicorn Horn Shard",
  "Couatl Scale",
  "Planetar Plume",
  "Solar Wing Feather",
  "Angelic Blood Vial",
  "Solar Halo Shard",
  "Shed Down Clump",
  "Cracked Holy Charm",
  "Faded Prayer Ribbon",
  "Incense Ash Pouch",
  "Dawn Pearl",
  "Celestial Sigil Seal",
  "Silvered Holy Chip",
  "Heavenly Mandate Scrap",
  "Planar Gate Chart",
  "Solar Edict Fragment",
  "Boss Trophy Crest",
  "Legendary Craft Essence",
  "Boss Chronicle Page",
  "Ancient Red Dragon Scale",
  "Ancient Dragon Heartfire",
  "Crimson Wyrm Fang",
  "Hoard Crown Shard",
  "Scorched Throne Edict",
  "Kraken Tentacle",
  "Kraken Ink Sac",
  "Abyssal Eye Lens",
  "Drowned Captain Sigil",
  "Sunken Empire Chart",
  "Tarrasque Carapace Plate",
  "Tarrasque Fang",
  "World-Eater Bile",
  "Titanic Bone Shard",
  "Apocalypse Scar Map",
  "Demon Lord Horn",
  "Abyssal Crown Fragment",
  "Demonic Ichor Concentrate",
  "Soul Contract Vellum",
  "Abyss Gate Key Shard",
  "Archmage Spellbook Page",
  "Archmage Focus Crystal",
  "Woven Arcane Thread",
  "Planar Seal Ring",
  "Tower Ward Schematic",
  "Lich King Phylactery Core",
  "Crown of Bones Shard",
  "Royal Lich Dust",
  "Death Decree Scroll",
  "Soul Throne Fragment",
  "Assassin Garrote Cord",
  "Bandit Mask Scrap",
  "Barracks Roster",
  "Berserker Rage Totem",
  "Bounty Board Scrap",
  "Calloused Knuckle Bone",
  "Captain's Purse Clasp",
  "Cult Brand Mark",
  "Cult Cell Roster",
  "Gladiator Arena Token",
  "Guard Watch Badge",
  "Hobgoblin Banner Scrap",
  "Hobgoblin Blood Vial",
  "Hobgoblin Boot Nail",
  "Hobgoblin Ear",
  "Hobgoblin Legion Badge",
  "Hobgoblin Marching Orders",
  "Hobgoblin Ration Tin",
  "Hobgoblin Tooth",
  "Letter of Marque",
  "Mage Component Scrap",
  "Mercenary Blood Vial",
  "Noble Signet Wax",
  "Priest Prayer Bead",
  "Scout Trail Chalk",
  "Thug's Brass Knuckle",
  "Veteran's Service Pin",
  "Bear Claw",
  "Beast Claw",
  "Beast Fang",
  "Beast Hide",
  "Beast Lair Scratching",
  "Beast Meat",
  "Beast Tooth Necklace",
  "Bloody Fur Tuft",
  "Boar Tusk",
  "Cracked Claw Sheath",
  "Crocodile Hide Scrap",
  "Fishbone Cluster",
  "Frog Poison Sac",
  "Giant Eagle Feather",
  "Giant Owl Feather",
  "Giant Rat Tail",
  "Great Cat Fang",
  "Hunter Trail Map",
  "Nest Twig Bundle",
  "Polished Fang Charm",
  "Ranger Warning Scrap",
  "Scorpion Stinger",
  "Shark Tooth",
  "Snake Skin Shed"
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
if (listLootDefinitions().length < 420) {
  throw new Error("Expected expanded definition registry");
}
if (!getLootDefinition("construct-gears") || !getLootDefinition("iron-golem-plate") || !getLootDefinition("golem-manual-page")) {
  throw new Error("Missing construct loot definitions");
}
if (!getLootDefinition("plant-fiber") || !getLootDefinition("treant-bark-plate") || !getLootDefinition("heartwood-core")) {
  throw new Error("Missing plant loot definitions");
}
if (!getLootDefinition("celestial-feather") || !getLootDefinition("solar-wing-feather") || !getLootDefinition("solar-halo-shard")) {
  throw new Error("Missing celestial loot definitions");
}
if (!getLootDefinition("boss-trophy-crest") || !getLootDefinition("legendary-craft-essence") || !getLootDefinition("lich-king-phylactery-core")) {
  throw new Error("Missing boss loot definitions");
}
if (!getLootDefinition("hobgoblin-ear") || !getLootDefinition("mercenary-blood-vial") || !getLootDefinition("assassin-garrote-cord")) {
  throw new Error("Missing hobgoblin/stock-humanoid loot definitions");
}
if (!getLootDefinition("beast-hide") || !getLootDefinition("scorpion-stinger") || !getLootDefinition("shark-tooth")) {
  throw new Error("Missing beast loot definitions");
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
if (resolveLootScale(dragon, { name: "Ancient Blue Dragon", size: "grg" }) !== 1.85) {
  throw new Error("Ancient (non-red) dragon lootScale should be 1.85");
}

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
const ancientAvg = await sampleDragonParts("Ancient Blue Dragon", "grg", 23, true);
if (!(ancientAvg > wyrmAvg * 1.5)) {
  throw new Error(
    `Ancient dragons should average far more parts than wyrmlings (ancient=${ancientAvg}, wyrmling=${wyrmAvg})`
  );
}

const ancientLoot = await generateCreatureLoot({
  context: {
    name: "Adult Red Dragon",
    creatureType: "dragon",
    creatureSubtype: "",
    size: "huge",
    challengeRating: 17,
    isWolf: false,
    isBoss: true,
    isNamed: false
  },
  survivalTotal: 18,
  naturalDie: 12,
  isNatural20: false,
  actor: {
    id: "dr1",
    name: "Adult Red Dragon",
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
if (ancientLoot.profileId !== "dragon") throw new Error("Adult dragon used wrong profile");
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

const human = resolveCreatureProfile({ name: "Human Commoner", creatureType: "humanoid", creatureSubtype: "human" });
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
  context: { name: "Human Commoner", creatureType: "humanoid", creatureSubtype: "human", size: "med", challengeRating: 0, isWolf: false, isBoss: false, isNamed: false },
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
if (!impLoot.items.some((i) => /fiend|brimstone|imp-wing|hellhound|quasit|barbed|devil-chain|bone-spur|pit-fiend|balor/.test(String(i.definitionId || "")))) {
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

const hillGiant = resolveCreatureProfile({ name: "Hill Giant", creatureType: "giant", creatureSubtype: "", size: "huge" });
const stoneGiant = resolveCreatureProfile({ name: "Stone Giant", creatureType: "giant", creatureSubtype: "", size: "huge" });
const frostGiant = resolveCreatureProfile({ name: "Frost Giant", creatureType: "giant", creatureSubtype: "", size: "huge" });
const fireGiant = resolveCreatureProfile({ name: "Fire Giant", creatureType: "giant", creatureSubtype: "", size: "huge" });
const cloudGiant = resolveCreatureProfile({ name: "Cloud Giant", creatureType: "giant", creatureSubtype: "", size: "huge" });
const stormGiant = resolveCreatureProfile({ name: "Storm Giant", creatureType: "giant", creatureSubtype: "", size: "huge" });
const giantSpider = resolveCreatureProfile({ name: "Giant Spider", creatureType: "beast", creatureSubtype: "", size: "lg" });
if (hillGiant?.id !== "giant") throw new Error(`Expected giant for Hill Giant, got ${hillGiant?.id}`);
if (stoneGiant?.id !== "giant") throw new Error(`Expected giant for Stone Giant, got ${stoneGiant?.id}`);
if (frostGiant?.id !== "giant") throw new Error(`Expected giant for Frost Giant, got ${frostGiant?.id}`);
if (fireGiant?.id !== "giant") throw new Error(`Expected giant for Fire Giant, got ${fireGiant?.id}`);
if (cloudGiant?.id !== "giant") throw new Error(`Expected giant for Cloud Giant, got ${cloudGiant?.id}`);
if (stormGiant?.id !== "giant") throw new Error(`Expected giant for Storm Giant, got ${stormGiant?.id}`);
if (giantSpider?.id === "giant") throw new Error("Giant Spider must not resolve to giant profile");
if (giantSpider?.id !== "spider") throw new Error(`Expected spider for Giant Spider, got ${giantSpider?.id}`);

if (resolveLootScale(hillGiant, { name: "Hill Giant", size: "huge" }) !== 0.85) throw new Error("Hill Giant lootScale should be 0.85");
if (resolveLootScale(stoneGiant, { name: "Stone Giant", size: "huge" }) !== 1) throw new Error("Stone Giant lootScale should be 1");
if (resolveLootScale(frostGiant, { name: "Frost Giant", size: "huge" }) !== 1.1) throw new Error("Frost Giant lootScale should be 1.1");
if (resolveLootScale(fireGiant, { name: "Fire Giant", size: "huge" }) !== 1.2) throw new Error("Fire Giant lootScale should be 1.2");
if (resolveLootScale(cloudGiant, { name: "Cloud Giant", size: "huge" }) !== 1.3) throw new Error("Cloud Giant lootScale should be 1.3");
if (resolveLootScale(stormGiant, { name: "Storm Giant", size: "huge" }) !== 1.6) throw new Error("Storm Giant lootScale should be 1.6");

const hillLoot = await generateCreatureLoot({
  context: { name: "Hill Giant", creatureType: "giant", creatureSubtype: "", size: "huge", challengeRating: 5, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false,
  actor: {
    id: "hg1", name: "Hill Giant",
    items: { contents: [{
      id: "w1", name: "Greatclub", type: "weapon", img: "icons/svg/sword.svg",
      system: { quantity: 1, type: { value: "martialM" }, price: { value: 0, denomination: "gp" }, description: { value: "<p>Club.</p>" }, rarity: "common" },
      flags: {},
      toObject() { return { name: this.name, type: this.type, img: this.img, system: structuredClone(this.system), flags: {} }; }
    }] }
  }
});
if (hillLoot.profileId !== "giant") throw new Error("Hill Giant generation used wrong profile");
if (!hillLoot.items.some((i) => ["giant-tooth","giant-knuckle","giant-hair-lock","hill-giant-rock"].includes(String(i.definitionId || "")))) {
  throw new Error("Hill Giant loot missing giant parts");
}

const stormLoot = await generateCreatureLoot({
  context: { name: "Storm Giant", creatureType: "giant", creatureSubtype: "", size: "huge", challengeRating: 13, isWolf: false, isBoss: true, isNamed: false },
  survivalTotal: 22, naturalDie: 18, isNatural20: false, actor: null
});
if (stormLoot.profileId !== "giant") throw new Error("Storm Giant generation used wrong profile");

let hillSum = 0;
let stormSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: { name: "Hill Giant", creatureType: "giant", creatureSubtype: "", size: "huge", challengeRating: 5, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const b = await generateCreatureLoot({
    context: { name: "Storm Giant", creatureType: "giant", creatureSubtype: "", size: "huge", challengeRating: 13, isWolf: false, isBoss: true, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const partRe = /giant|hill-giant|stone-giant|frost-giant|fire-giant|cloud-giant|storm-spark/;
  hillSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  stormSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const hillAvg = hillSum / 40;
const stormAvg = stormSum / 40;
if (stormAvg <= hillAvg * 1.2) {
  throw new Error(`Storm Giant should average more scaled parts than Hill Giant (storm=${stormAvg}, hill=${hillAvg})`);
}

const fireEl = resolveCreatureProfile({ name: "Fire Elemental", creatureType: "elemental", creatureSubtype: "fire", size: "lg" });
const waterEl = resolveCreatureProfile({ name: "Water Elemental", creatureType: "elemental", creatureSubtype: "water", size: "lg" });
const earthEl = resolveCreatureProfile({ name: "Earth Elemental", creatureType: "elemental", creatureSubtype: "earth", size: "lg" });
const airEl = resolveCreatureProfile({ name: "Air Elemental", creatureType: "elemental", creatureSubtype: "air", size: "lg" });
const myrmidon = resolveCreatureProfile({ name: "Fire Elemental Myrmidon", creatureType: "elemental", creatureSubtype: "fire", size: "med" });
const fireGiantVsElemental = resolveCreatureProfile({ name: "Fire Giant", creatureType: "giant", creatureSubtype: "", size: "huge" });
if (fireEl?.id !== "elemental") throw new Error(`Expected elemental for Fire Elemental, got ${fireEl?.id}`);
if (waterEl?.id !== "elemental") throw new Error(`Expected elemental for Water Elemental, got ${waterEl?.id}`);
if (earthEl?.id !== "elemental") throw new Error(`Expected elemental for Earth Elemental, got ${earthEl?.id}`);
if (airEl?.id !== "elemental") throw new Error(`Expected elemental for Air Elemental, got ${airEl?.id}`);
if (myrmidon?.id !== "elemental") throw new Error(`Expected elemental for Myrmidon, got ${myrmidon?.id}`);
if (fireGiantVsElemental?.id !== "giant") throw new Error(`Fire Giant must stay on giant profile, got ${fireGiantVsElemental?.id}`);

if (resolveLootScale(fireEl, { name: "Fire Elemental", size: "lg" }) !== 1) throw new Error("Fire Elemental lootScale should be 1");
if (resolveLootScale(myrmidon, { name: "Fire Elemental Myrmidon", size: "med" }) !== 1.35) throw new Error("Fire Elemental Myrmidon lootScale should be 1.35");
if (resolveLootScale(myrmidon, { name: "Air Myrmidon", size: "med" }) !== 1.3) throw new Error("Air Myrmidon lootScale should be 1.3");

const fireLoot = await generateCreatureLoot({
  context: { name: "Fire Elemental", creatureType: "elemental", creatureSubtype: "fire", size: "lg", challengeRating: 5, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (fireLoot.profileId !== "elemental") throw new Error("Fire Elemental generation used wrong profile");
if (!fireLoot.items.some((i) => ["elemental-essence","fire-ember-core","scorched-cinder","water-brine-pearl","earth-living-stone","air-wind-whorl"].includes(String(i.definitionId || "")))) {
  throw new Error("Fire Elemental loot missing elemental parts");
}

const myrLoot = await generateCreatureLoot({
  context: { name: "Earth Elemental Myrmidon", creatureType: "elemental", creatureSubtype: "earth", size: "med", challengeRating: 7, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 20, naturalDie: 15, isNatural20: false,
  actor: {
    id: "myr1", name: "Earth Elemental Myrmidon",
    items: { contents: [{
      id: "w1", name: "Maul", type: "weapon", img: "icons/svg/sword.svg",
      system: { quantity: 1, type: { value: "martialM" }, price: { value: 10, denomination: "gp" }, description: { value: "<p>Maul.</p>" }, rarity: "common" },
      flags: {},
      toObject() { return { name: this.name, type: this.type, img: this.img, system: structuredClone(this.system), flags: {} }; }
    }] }
  }
});
if (myrLoot.profileId !== "elemental") throw new Error("Myrmidon generation used wrong profile");

let elSum = 0;
let myrSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: { name: "Air Elemental", creatureType: "elemental", creatureSubtype: "air", size: "lg", challengeRating: 5, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const b = await generateCreatureLoot({
    context: { name: "Air Elemental Myrmidon", creatureType: "elemental", creatureSubtype: "air", size: "med", challengeRating: 7, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const partRe = /elemental|fire-ember|water-brine|earth-living|air-wind|scorched-cinder|tidal-foam|gravel|gust-ribbon|myrmidon/;
  elSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  myrSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const elAvg = elSum / 40;
const myrAvg = myrSum / 40;
if (myrAvg <= elAvg * 1.15) {
  throw new Error(`Myrmidon should average more scaled parts than base elemental (myrmidon=${myrAvg}, elemental=${elAvg})`);
}

const mindFlayer = resolveCreatureProfile({ name: "Mind Flayer", creatureType: "aberration", creatureSubtype: "", size: "med" });
const intellect = resolveCreatureProfile({ name: "Intellect Devourer", creatureType: "aberration", creatureSubtype: "", size: "tiny" });
const beholder = resolveCreatureProfile({ name: "Beholder", creatureType: "aberration", creatureSubtype: "", size: "lg" });
const deathTyrant = resolveCreatureProfile({ name: "Death Tyrant", creatureType: "undead", creatureSubtype: "", size: "lg" });
const aboleth = resolveCreatureProfile({ name: "Aboleth", creatureType: "aberration", creatureSubtype: "", size: "lg" });
const crawler = resolveCreatureProfile({ name: "Carrion Crawler", creatureType: "monstrosity", creatureSubtype: "", size: "lg" });
const chuul = resolveCreatureProfile({ name: "Chuul", creatureType: "aberration", creatureSubtype: "", size: "lg" });
const mouther = resolveCreatureProfile({ name: "Gibbering Mouther", creatureType: "aberration", creatureSubtype: "", size: "med" });
if (mindFlayer?.id !== "aberration") throw new Error(`Expected aberration for Mind Flayer, got ${mindFlayer?.id}`);
if (intellect?.id !== "aberration") throw new Error(`Expected aberration for Intellect Devourer, got ${intellect?.id}`);
if (beholder?.id !== "aberration") throw new Error(`Expected aberration for Beholder, got ${beholder?.id}`);
if (deathTyrant?.id !== "aberration") throw new Error(`Expected aberration for Death Tyrant, got ${deathTyrant?.id}`);
if (aboleth?.id !== "aberration") throw new Error(`Expected aberration for Aboleth, got ${aboleth?.id}`);
if (crawler?.id !== "aberration") throw new Error(`Expected aberration for Carrion Crawler, got ${crawler?.id}`);
if (chuul?.id !== "aberration") throw new Error(`Expected aberration for Chuul, got ${chuul?.id}`);
if (mouther?.id !== "aberration") throw new Error(`Expected aberration for Gibbering Mouther, got ${mouther?.id}`);

if (resolveLootScale(mindFlayer, { name: "Intellect Devourer", size: "tiny" }) !== 0.55) throw new Error("Intellect Devourer lootScale should be 0.55");
if (resolveLootScale(mindFlayer, { name: "Gibbering Mouther", size: "med" }) !== 0.6) throw new Error("Gibbering Mouther lootScale should be 0.6");
if (resolveLootScale(mindFlayer, { name: "Carrion Crawler", size: "lg" }) !== 0.65) throw new Error("Carrion Crawler lootScale should be 0.65");
if (resolveLootScale(mindFlayer, { name: "Chuul", size: "lg" }) !== 0.9) throw new Error("Chuul lootScale should be 0.9");
if (resolveLootScale(mindFlayer, { name: "Mind Flayer", size: "med" }) !== 1.15) throw new Error("Mind Flayer lootScale should be 1.15");
if (resolveLootScale(mindFlayer, { name: "Aboleth", size: "lg" }) !== 1.45) throw new Error("Aboleth lootScale should be 1.45");
if (resolveLootScale(mindFlayer, { name: "Beholder", size: "lg" }) !== 1.55) throw new Error("Beholder lootScale should be 1.55");
if (resolveLootScale(mindFlayer, { name: "Death Tyrant", size: "lg" }) !== 1.65) throw new Error("Death Tyrant lootScale should be 1.65");

const mfLoot = await generateCreatureLoot({
  context: { name: "Mind Flayer", creatureType: "aberration", creatureSubtype: "", size: "med", challengeRating: 7, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (mfLoot.profileId !== "aberration") throw new Error("Mind Flayer generation used wrong profile");
if (!mfLoot.items.some((i) => /aberration|tentacle|illithid|elder-brain|intellect|beholder|central-eye|death-tyrant|aboleth|crawler|chuul|gibbering/.test(String(i.definitionId || "")))) {
  throw new Error("Mind Flayer loot missing aberration parts");
}

const beholderLoot = await generateCreatureLoot({
  context: { name: "Beholder", creatureType: "aberration", creatureSubtype: "", size: "lg", challengeRating: 13, isWolf: false, isBoss: true, isNamed: false },
  survivalTotal: 22, naturalDie: 18, isNatural20: false, actor: null
});
if (beholderLoot.profileId !== "aberration") throw new Error("Beholder generation used wrong profile");

let lowSum = 0;
let highSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: { name: "Intellect Devourer", creatureType: "aberration", creatureSubtype: "", size: "tiny", challengeRating: 2, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const b = await generateCreatureLoot({
    context: { name: "Beholder", creatureType: "aberration", creatureSubtype: "", size: "lg", challengeRating: 13, isWolf: false, isBoss: true, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const partRe = /aberration|tentacle|illithid|elder-brain|intellect|beholder|central-eye|death-tyrant|aboleth|crawler|chuul|gibbering/;
  lowSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  highSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const lowAvg = lowSum / 40;
const highAvg = highSum / 40;
if (highAvg <= lowAvg * 1.3) {
  throw new Error(`Beholder should average more scaled parts than Intellect Devourer (beholder=${highAvg}, devourer=${lowAvg})`);
}

const grayOoze = resolveCreatureProfile({ name: "Gray Ooze", creatureType: "ooze", creatureSubtype: "", size: "med" });
const greyOoze = resolveCreatureProfile({ name: "Grey Ooze", creatureType: "ooze", creatureSubtype: "", size: "med" });
const cube = resolveCreatureProfile({ name: "Gelatinous Cube", creatureType: "ooze", creatureSubtype: "", size: "lg" });
const pudding = resolveCreatureProfile({ name: "Black Pudding", creatureType: "ooze", creatureSubtype: "", size: "lg" });
const jelly = resolveCreatureProfile({ name: "Ochre Jelly", creatureType: "ooze", creatureSubtype: "", size: "lg" });
if (grayOoze?.id !== "ooze") throw new Error(`Expected ooze for Gray Ooze, got ${grayOoze?.id}`);
if (greyOoze?.id !== "ooze") throw new Error(`Expected ooze for Grey Ooze, got ${greyOoze?.id}`);
if (cube?.id !== "ooze") throw new Error(`Expected ooze for Gelatinous Cube, got ${cube?.id}`);
if (pudding?.id !== "ooze") throw new Error(`Expected ooze for Black Pudding, got ${pudding?.id}`);
if (jelly?.id !== "ooze") throw new Error(`Expected ooze for Ochre Jelly, got ${jelly?.id}`);

if (resolveLootScale(grayOoze, { name: "Gray Ooze", size: "med" }) !== 0.45) throw new Error("Gray Ooze lootScale should be 0.45");
if (resolveLootScale(jelly, { name: "Ochre Jelly", size: "lg" }) !== 0.8) throw new Error("Ochre Jelly lootScale should be 0.8");
if (resolveLootScale(cube, { name: "Gelatinous Cube", size: "lg" }) !== 0.85) throw new Error("Gelatinous Cube lootScale should be 0.85");
if (resolveLootScale(pudding, { name: "Black Pudding", size: "lg" }) !== 1.25) throw new Error("Black Pudding lootScale should be 1.25");

const cubeLoot = await generateCreatureLoot({
  context: { name: "Gelatinous Cube", creatureType: "ooze", creatureSubtype: "", size: "lg", challengeRating: 2, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false,
  actor: {
    id: "cube1", name: "Gelatinous Cube",
    items: { contents: [{
      id: "w1", name: "Longsword", type: "weapon", img: "icons/svg/sword.svg",
      system: { quantity: 1, type: { value: "martialM" }, price: { value: 15, denomination: "gp" }, description: { value: "<p>Sword.</p>" }, rarity: "common" },
      flags: {},
      toObject() { return { name: this.name, type: this.type, img: this.img, system: structuredClone(this.system), flags: {} }; }
    }] }
  }
});
if (cubeLoot.profileId !== "ooze") throw new Error("Gelatinous Cube generation used wrong profile");
if (!cubeLoot.items.some((i) => /ooze|corrosive|gray-ooze|cube-jelly|black-pudding|ochre-jelly|protoplasm/.test(String(i.definitionId || "")))) {
  throw new Error("Gelatinous Cube loot missing ooze parts");
}

let graySum = 0;
let pudSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: { name: "Gray Ooze", creatureType: "ooze", creatureSubtype: "", size: "med", challengeRating: 0.5, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const b = await generateCreatureLoot({
    context: { name: "Black Pudding", creatureType: "ooze", creatureSubtype: "", size: "lg", challengeRating: 4, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const partRe = /ooze|corrosive|gray-ooze|cube-jelly|black-pudding|ochre-jelly|protoplasm/;
  graySum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  pudSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const grayAvg = graySum / 40;
const pudAvg = pudSum / 40;
if (pudAvg <= grayAvg * 1.3) {
  throw new Error(`Black Pudding should average more scaled parts than Gray Ooze (pudding=${pudAvg}, gray=${grayAvg})`);
}

const animatedArmorStill = resolveCreatureProfile({
  name: "Animated Armor",
  creatureType: "construct",
  creatureSubtype: "",
  size: "med"
});
const flyingSword = resolveCreatureProfile({
  name: "Flying Sword",
  creatureType: "construct",
  creatureSubtype: "",
  size: "sm"
});
const helmedHorror = resolveCreatureProfile({
  name: "Helmed Horror",
  creatureType: "construct",
  creatureSubtype: "",
  size: "med"
});
const fleshGolem = resolveCreatureProfile({
  name: "Flesh Golem",
  creatureType: "construct",
  creatureSubtype: "golem",
  size: "med"
});
const clayGolem = resolveCreatureProfile({
  name: "Clay Golem",
  creatureType: "construct",
  creatureSubtype: "golem",
  size: "lg"
});
const stoneGolem = resolveCreatureProfile({
  name: "Stone Golem",
  creatureType: "construct",
  creatureSubtype: "golem",
  size: "lg"
});
const ironGolem = resolveCreatureProfile({
  name: "Iron Golem",
  creatureType: "construct",
  creatureSubtype: "golem",
  size: "lg"
});
const shieldGuardian = resolveCreatureProfile({
  name: "Shield Guardian",
  creatureType: "construct",
  creatureSubtype: "",
  size: "lg"
});
const genericGolem = resolveCreatureProfile({
  name: "Golem",
  creatureType: "construct",
  creatureSubtype: "golem",
  size: "lg"
});
if (animatedArmorStill?.id !== "animated-armor") {
  throw new Error(`Expected animated-armor for Animated Armor, got ${animatedArmorStill?.id}`);
}
if (flyingSword?.id !== "construct") throw new Error(`Expected construct for Flying Sword, got ${flyingSword?.id}`);
if (helmedHorror?.id !== "construct") throw new Error(`Expected construct for Helmed Horror, got ${helmedHorror?.id}`);
if (fleshGolem?.id !== "construct") throw new Error(`Expected construct for Flesh Golem, got ${fleshGolem?.id}`);
if (clayGolem?.id !== "construct") throw new Error(`Expected construct for Clay Golem, got ${clayGolem?.id}`);
if (stoneGolem?.id !== "construct") throw new Error(`Expected construct for Stone Golem, got ${stoneGolem?.id}`);
if (ironGolem?.id !== "construct") throw new Error(`Expected construct for Iron Golem, got ${ironGolem?.id}`);
if (shieldGuardian?.id !== "construct") throw new Error(`Expected construct for Shield Guardian, got ${shieldGuardian?.id}`);
if (genericGolem?.id !== "construct") throw new Error(`Expected construct for Golem, got ${genericGolem?.id}`);

if (resolveLootScale(flyingSword, { name: "Flying Sword", size: "sm" }) !== 0.4) {
  throw new Error("Flying Sword lootScale should be 0.4");
}
if (resolveLootScale(helmedHorror, { name: "Helmed Horror", size: "med" }) !== 1) {
  throw new Error("Helmed Horror lootScale should be 1");
}
if (resolveLootScale(fleshGolem, { name: "Flesh Golem", size: "med" }) !== 1.05) {
  throw new Error("Flesh Golem lootScale should be 1.05");
}
if (resolveLootScale(clayGolem, { name: "Clay Golem", size: "lg" }) !== 1.25) {
  throw new Error("Clay Golem lootScale should be 1.25");
}
if (resolveLootScale(stoneGolem, { name: "Stone Golem", size: "lg" }) !== 1.35) {
  throw new Error("Stone Golem lootScale should be 1.35");
}
if (resolveLootScale(ironGolem, { name: "Iron Golem", size: "lg" }) !== 1.65) {
  throw new Error("Iron Golem lootScale should be 1.65");
}
if (resolveLootScale(shieldGuardian, { name: "Shield Guardian", size: "lg" }) !== 1.2) {
  throw new Error("Shield Guardian lootScale should be 1.2");
}
if (resolveLootScale(genericGolem, { name: "Golem", size: "lg" }) !== 1.2) {
  throw new Error("Generic Golem lootScale should be 1.2");
}

const ironLoot = await generateCreatureLoot({
  context: {
    name: "Iron Golem",
    creatureType: "construct",
    creatureSubtype: "golem",
    size: "lg",
    challengeRating: 16,
    isWolf: false,
    isBoss: true,
    isNamed: false
  },
  survivalTotal: 18,
  naturalDie: 12,
  isNatural20: false,
  actor: null
});
if (ironLoot.profileId !== "construct") throw new Error("Iron Golem generation used wrong profile");
if (!ironLoot.items.some((i) => /construct|arcane-core|golem|helmed|flying-sword|guardian|rivet|wiring|schematic|manual|activation|clockwork|binding|bent-armor/.test(String(i.definitionId || "")))) {
  throw new Error("Iron Golem loot missing construct parts");
}

let swordSum = 0;
let ironSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: {
      name: "Flying Sword",
      creatureType: "construct",
      creatureSubtype: "",
      size: "sm",
      challengeRating: 0.25,
      isWolf: false,
      isBoss: false,
      isNamed: false
    },
    survivalTotal: 18,
    naturalDie: 12,
    isNatural20: false,
    actor: null
  });
  const b = await generateCreatureLoot({
    context: {
      name: "Iron Golem",
      creatureType: "construct",
      creatureSubtype: "golem",
      size: "lg",
      challengeRating: 16,
      isWolf: false,
      isBoss: true,
      isNamed: false
    },
    survivalTotal: 18,
    naturalDie: 12,
    isNatural20: false,
    actor: null
  });
  const partRe = /construct|arcane-core|golem|helmed|flying-sword|guardian|rivet|wiring|schematic|manual|activation|clockwork|binding|bent-armor/;
  swordSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  ironSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const swordAvg = swordSum / 40;
const ironAvg = ironSum / 40;
if (ironAvg <= swordAvg * 1.3) {
  throw new Error(`Iron Golem should average more scaled parts than Flying Sword (iron=${ironAvg}, sword=${swordAvg})`);
}

const twigBlight = resolveCreatureProfile({
  name: "Twig Blight",
  creatureType: "plant",
  creatureSubtype: "",
  size: "sm"
});
const needleBlight = resolveCreatureProfile({
  name: "Needle Blight",
  creatureType: "plant",
  creatureSubtype: "",
  size: "med"
});
const vineBlight = resolveCreatureProfile({
  name: "Vine Blight",
  creatureType: "plant",
  creatureSubtype: "",
  size: "med"
});
const myconid = resolveCreatureProfile({
  name: "Myconid Adult",
  creatureType: "plant",
  creatureSubtype: "",
  size: "med"
});
const shambling = resolveCreatureProfile({
  name: "Shambling Mound",
  creatureType: "plant",
  creatureSubtype: "",
  size: "lg"
});
const treant = resolveCreatureProfile({
  name: "Treant",
  creatureType: "plant",
  creatureSubtype: "",
  size: "huge"
});
if (twigBlight?.id !== "plant") throw new Error(`Expected plant for Twig Blight, got ${twigBlight?.id}`);
if (needleBlight?.id !== "plant") throw new Error(`Expected plant for Needle Blight, got ${needleBlight?.id}`);
if (vineBlight?.id !== "plant") throw new Error(`Expected plant for Vine Blight, got ${vineBlight?.id}`);
if (myconid?.id !== "plant") throw new Error(`Expected plant for Myconid Adult, got ${myconid?.id}`);
if (shambling?.id !== "plant") throw new Error(`Expected plant for Shambling Mound, got ${shambling?.id}`);
if (treant?.id !== "plant") throw new Error(`Expected plant for Treant, got ${treant?.id}`);

if (resolveLootScale(twigBlight, { name: "Twig Blight", size: "sm" }) !== 0.35) {
  throw new Error("Twig Blight lootScale should be 0.35");
}
if (resolveLootScale(needleBlight, { name: "Needle Blight", size: "med" }) !== 0.55) {
  throw new Error("Needle Blight lootScale should be 0.55");
}
if (resolveLootScale(vineBlight, { name: "Vine Blight", size: "med" }) !== 0.7) {
  throw new Error("Vine Blight lootScale should be 0.7");
}
if (resolveLootScale(myconid, { name: "Myconid Adult", size: "med" }) !== 0.75) {
  throw new Error("Myconid lootScale should be 0.75");
}
if (resolveLootScale(shambling, { name: "Shambling Mound", size: "lg" }) !== 1.35) {
  throw new Error("Shambling Mound lootScale should be 1.35");
}
if (resolveLootScale(treant, { name: "Treant", size: "huge" }) !== 1.7) {
  throw new Error("Treant lootScale should be 1.7");
}

const treantLoot = await generateCreatureLoot({
  context: {
    name: "Treant",
    creatureType: "plant",
    creatureSubtype: "",
    size: "huge",
    challengeRating: 9,
    isWolf: false,
    isBoss: true,
    isNamed: false
  },
  survivalTotal: 18,
  naturalDie: 12,
  isNatural20: false,
  actor: null
});
if (treantLoot.profileId !== "plant") throw new Error("Treant generation used wrong profile");
if (!treantLoot.items.some((i) => /plant|sap|blight|myconid|shambling|treant|heartwood|leaf|thorn|moldy|spore|blossom|amber|fungal|grove/.test(String(i.definitionId || "")))) {
  throw new Error("Treant loot missing plant parts");
}

let twigSum = 0;
let treantSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: {
      name: "Twig Blight",
      creatureType: "plant",
      creatureSubtype: "",
      size: "sm",
      challengeRating: 0.125,
      isWolf: false,
      isBoss: false,
      isNamed: false
    },
    survivalTotal: 18,
    naturalDie: 12,
    isNatural20: false,
    actor: null
  });
  const b = await generateCreatureLoot({
    context: {
      name: "Treant",
      creatureType: "plant",
      creatureSubtype: "",
      size: "huge",
      challengeRating: 9,
      isWolf: false,
      isBoss: true,
      isNamed: false
    },
    survivalTotal: 18,
    naturalDie: 12,
    isNatural20: false,
    actor: null
  });
  const partRe = /plant|sap|blight|myconid|shambling|treant|heartwood|leaf|thorn|moldy|spore|blossom|amber|fungal|grove/;
  twigSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  treantSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const twigAvg = twigSum / 40;
const treantAvg = treantSum / 40;
if (treantAvg <= twigAvg * 1.3) {
  throw new Error(`Treant should average more scaled parts than Twig Blight (treant=${treantAvg}, twig=${twigAvg})`);
}

const pegasus = resolveCreatureProfile({
  name: "Pegasus",
  creatureType: "celestial",
  creatureSubtype: "",
  size: "lg"
});
const unicorn = resolveCreatureProfile({
  name: "Unicorn",
  creatureType: "celestial",
  creatureSubtype: "",
  size: "lg"
});
const couatl = resolveCreatureProfile({
  name: "Couatl",
  creatureType: "celestial",
  creatureSubtype: "",
  size: "med"
});
const planetar = resolveCreatureProfile({
  name: "Planetar",
  creatureType: "celestial",
  creatureSubtype: "",
  size: "lg"
});
const solar = resolveCreatureProfile({
  name: "Solar",
  creatureType: "celestial",
  creatureSubtype: "",
  size: "lg"
});
const solarDragon = resolveCreatureProfile({
  name: "Adult Solar Dragon",
  creatureType: "dragon",
  creatureSubtype: "",
  size: "huge"
});
if (pegasus?.id !== "celestial") throw new Error(`Expected celestial for Pegasus, got ${pegasus?.id}`);
if (unicorn?.id !== "celestial") throw new Error(`Expected celestial for Unicorn, got ${unicorn?.id}`);
if (couatl?.id !== "celestial") throw new Error(`Expected celestial for Couatl, got ${couatl?.id}`);
if (planetar?.id !== "celestial") throw new Error(`Expected celestial for Planetar, got ${planetar?.id}`);
if (solar?.id !== "celestial") throw new Error(`Expected celestial for Solar, got ${solar?.id}`);
if (solarDragon?.id === "celestial") throw new Error("Adult Solar Dragon should not use celestial profile");

if (resolveLootScale(pegasus, { name: "Pegasus", size: "lg" }) !== 0.55) {
  throw new Error("Pegasus lootScale should be 0.55");
}
if (resolveLootScale(unicorn, { name: "Unicorn", size: "lg" }) !== 0.85) {
  throw new Error("Unicorn lootScale should be 0.85");
}
if (resolveLootScale(couatl, { name: "Couatl", size: "med" }) !== 1.05) {
  throw new Error("Couatl lootScale should be 1.05");
}
if (resolveLootScale(planetar, { name: "Planetar", size: "lg" }) !== 1.55) {
  throw new Error("Planetar lootScale should be 1.55");
}
if (resolveLootScale(solar, { name: "Solar", size: "lg" }) !== 1.9) {
  throw new Error("Solar lootScale should be 1.9");
}

const solarLoot = await generateCreatureLoot({
  context: {
    name: "Solar",
    creatureType: "celestial",
    creatureSubtype: "",
    size: "lg",
    challengeRating: 21,
    isWolf: false,
    isBoss: true,
    isNamed: false
  },
  survivalTotal: 18,
  naturalDie: 12,
  isNatural20: false,
  actor: null
});
if (solarLoot.profileId !== "celestial") throw new Error("Solar generation used wrong profile");
if (!solarLoot.items.some((i) => /celestial|radiant|pegasus|unicorn|couatl|planetar|solar|angelic|dawn|heavenly|planar-gate|shed-down|prayer|incense|silvered-holy/.test(String(i.definitionId || "")))) {
  throw new Error("Solar loot missing celestial parts");
}

let pegSum = 0;
let solSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: {
      name: "Pegasus",
      creatureType: "celestial",
      creatureSubtype: "",
      size: "lg",
      challengeRating: 2,
      isWolf: false,
      isBoss: false,
      isNamed: false
    },
    survivalTotal: 18,
    naturalDie: 12,
    isNatural20: false,
    actor: null
  });
  const b = await generateCreatureLoot({
    context: {
      name: "Solar",
      creatureType: "celestial",
      creatureSubtype: "",
      size: "lg",
      challengeRating: 21,
      isWolf: false,
      isBoss: true,
      isNamed: false
    },
    survivalTotal: 18,
    naturalDie: 12,
    isNatural20: false,
    actor: null
  });
  const partRe = /celestial|radiant|pegasus|unicorn|couatl|planetar|solar|angelic|dawn|heavenly|planar-gate|shed-down|prayer|incense|silvered-holy/;
  pegSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  solSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const pegAvg = pegSum / 40;
const solAvg = solSum / 40;
if (solAvg <= pegAvg * 1.3) {
  throw new Error(`Solar should average more scaled parts than Pegasus (solar=${solAvg}, pegasus=${pegAvg})`);
}

const ancientRed = resolveCreatureProfile({ name: "Ancient Red Dragon", creatureType: "dragon", creatureSubtype: "", size: "grg" });
const adultRed = resolveCreatureProfile({ name: "Adult Red Dragon", creatureType: "dragon", creatureSubtype: "", size: "huge" });
const krakenBoss = resolveCreatureProfile({ name: "Kraken", creatureType: "monstrosity", creatureSubtype: "", size: "grg" });
const tarrasqueBoss = resolveCreatureProfile({ name: "Tarrasque", creatureType: "monstrosity", creatureSubtype: "", size: "grg" });
const demonLordBoss = resolveCreatureProfile({ name: "Demon Lord", creatureType: "fiend", creatureSubtype: "demon", size: "huge" });
const orcusBoss = resolveCreatureProfile({ name: "Orcus", creatureType: "fiend", creatureSubtype: "demon", size: "huge" });
const balorStill = resolveCreatureProfile({ name: "Balor", creatureType: "fiend", creatureSubtype: "demon", size: "huge" });
const archmageBoss = resolveCreatureProfile({ name: "Archmage", creatureType: "humanoid", creatureSubtype: "human", size: "med" });
const lichKingBoss = resolveCreatureProfile({ name: "Lich King", creatureType: "undead", creatureSubtype: "lich", size: "med" });
const plainLich = resolveCreatureProfile({ name: "Lich", creatureType: "undead", creatureSubtype: "lich", size: "med" });
if (ancientRed?.id !== "ancient-red-dragon") throw new Error(`Expected ancient-red-dragon, got ${ancientRed?.id}`);
if (adultRed?.id !== "dragon") throw new Error(`Expected dragon for Adult Red Dragon, got ${adultRed?.id}`);
if (krakenBoss?.id !== "kraken") throw new Error(`Expected kraken, got ${krakenBoss?.id}`);
if (tarrasqueBoss?.id !== "tarrasque") throw new Error(`Expected tarrasque, got ${tarrasqueBoss?.id}`);
if (demonLordBoss?.id !== "demon-lord") throw new Error(`Expected demon-lord, got ${demonLordBoss?.id}`);
if (orcusBoss?.id !== "demon-lord") throw new Error(`Expected demon-lord for Orcus, got ${orcusBoss?.id}`);
if (balorStill?.id !== "fiend") throw new Error(`Expected fiend for Balor, got ${balorStill?.id}`);
if (archmageBoss?.id !== "archmage") throw new Error(`Expected archmage, got ${archmageBoss?.id}`);
if (lichKingBoss?.id !== "lich-king") throw new Error(`Expected lich-king, got ${lichKingBoss?.id}`);
if (plainLich?.id !== "lich") throw new Error(`Expected lich for plain Lich, got ${plainLich?.id}`);

async function assertBossGuarantees(name, type, subtype, size, cr, profileId, requiredIds) {
  const loot = await generateCreatureLoot({
    context: {
      name, creatureType: type, creatureSubtype: subtype, size,
      challengeRating: cr, isWolf: false, isBoss: true, isNamed: false
    },
    survivalTotal: 20, naturalDie: 15, isNatural20: false, actor: null
  });
  if (loot.profileId !== profileId) throw new Error(`${name} used wrong profile ${loot.profileId}`);
  const ids = new Set(loot.items.map((i) => String(i.definitionId || "")));
  for (const req of requiredIds) {
    if (!ids.has(req)) throw new Error(`${name} missing guaranteed drop ${req}; got ${[...ids].join(", ")}`);
  }
  if (loot.items.length < 5) throw new Error(`${name} should drop multiple items, got ${loot.items.length}`);
}

await assertBossGuarantees("Ancient Red Dragon", "dragon", "", "grg", 24, "ancient-red-dragon", [
  "ancient-red-dragon-scale", "ancient-dragon-heartfire", "crimson-wyrm-fang"
]);
await assertBossGuarantees("Kraken", "monstrosity", "", "grg", 23, "kraken", [
  "kraken-tentacle", "kraken-ink-sac", "abyssal-eye-lens"
]);
await assertBossGuarantees("Tarrasque", "monstrosity", "", "grg", 30, "tarrasque", [
  "tarrasque-carapace-plate", "tarrasque-fang", "world-eater-bile", "titanic-bone-shard"
]);
await assertBossGuarantees("Demon Lord", "fiend", "demon", "huge", 26, "demon-lord", [
  "demon-lord-horn", "demonic-ichor-concentrate", "abyssal-crown-fragment"
]);
await assertBossGuarantees("Archmage", "humanoid", "human", "med", 12, "archmage", [
  "archmage-focus-crystal", "woven-arcane-thread", "archmage-spellbook-page"
]);
await assertBossGuarantees("Lich King", "undead", "lich", "med", 21, "lich-king", [
  "lich-king-phylactery-core", "crown-of-bones-shard", "royal-lich-dust", "soul-throne-fragment"
]);

const hobgoblinStock = resolveCreatureProfile({ name: "Hobgoblin", creatureType: "humanoid", creatureSubtype: "goblinoid", size: "med" });
if (hobgoblinStock?.id !== "hobgoblin") throw new Error(`Expected hobgoblin, got ${hobgoblinStock?.id}`);

const stockRoles = [
  "Bandit", "Bandit Captain", "Guard", "Scout", "Veteran", "Cultist", "Cult Fanatic",
  "Noble", "Mage", "Priest", "Assassin", "Thug", "Gladiator", "Berserker"
];
for (const role of stockRoles) {
  const p = resolveCreatureProfile({ name: role, creatureType: "humanoid", creatureSubtype: "", size: "med" });
  if (p?.id !== "stock-humanoid") throw new Error(`Expected stock-humanoid for ${role}, got ${p?.id}`);
}
const humanBandit = resolveCreatureProfile({ name: "Human Bandit", creatureType: "humanoid", creatureSubtype: "human", size: "med" });
if (humanBandit?.id !== "stock-humanoid") throw new Error(`Expected stock-humanoid for Human Bandit, got ${humanBandit?.id}`);
const plainHuman = resolveCreatureProfile({ name: "Human", creatureType: "humanoid", creatureSubtype: "human", size: "med" });
if (plainHuman?.id !== "human") throw new Error(`Expected human for Human, got ${plainHuman?.id}`);
const mageNotArch = resolveCreatureProfile({ name: "Mage", creatureType: "humanoid", creatureSubtype: "", size: "med" });
const archStill = resolveCreatureProfile({ name: "Archmage", creatureType: "humanoid", creatureSubtype: "", size: "med" });
if (mageNotArch?.id !== "stock-humanoid") throw new Error(`Expected stock-humanoid for Mage, got ${mageNotArch?.id}`);
if (archStill?.id !== "archmage") throw new Error(`Expected archmage for Archmage, got ${archStill?.id}`);

const stockProfile = resolveCreatureProfile({ name: "Assassin", creatureType: "humanoid", creatureSubtype: "", size: "med" });
if (resolveLootScale(stockProfile, { name: "Cultist", size: "med" }) !== 0.55) throw new Error("Cultist lootScale should be 0.55");
if (resolveLootScale(stockProfile, { name: "Bandit", size: "med" }) !== 0.65) throw new Error("Bandit lootScale should be 0.65");
if (resolveLootScale(stockProfile, { name: "Bandit Captain", size: "med" }) !== 1.15) throw new Error("Bandit Captain lootScale should be 1.15");
if (resolveLootScale(stockProfile, { name: "Assassin", size: "med" }) !== 1.35) throw new Error("Assassin lootScale should be 1.35");
if (resolveLootScale(stockProfile, { name: "Gladiator", size: "med" }) !== 1.3) throw new Error("Gladiator lootScale should be 1.3");

const hobLoot = await generateCreatureLoot({
  context: { name: "Hobgoblin", creatureType: "humanoid", creatureSubtype: "hobgoblin", size: "med", challengeRating: 0.5, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (hobLoot.profileId !== "hobgoblin") throw new Error("Hobgoblin generation used wrong profile");
if (!hobLoot.items.some((i) => String(i.definitionId || "").startsWith("hobgoblin-"))) {
  throw new Error("Hobgoblin loot missing hobgoblin parts");
}

const assassinLoot = await generateCreatureLoot({
  context: { name: "Assassin", creatureType: "humanoid", creatureSubtype: "", size: "med", challengeRating: 8, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (assassinLoot.profileId !== "stock-humanoid") throw new Error("Assassin generation used wrong profile");
if (!assassinLoot.items.some((i) => /mercenary|calloused|bandit-mask|cult-brand|mage-component|assassin|thugs-brass|guard-watch|veteran|noble-signet|priest-prayer|gladiator|berserker|bounty|cult-cell|barracks|letter-of-marque|captains-purse|scout-trail/.test(String(i.definitionId || "")))) {
  throw new Error("Assassin loot missing stock-humanoid parts");
}

let cultSum = 0;
let assassinSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: { name: "Cultist", creatureType: "humanoid", creatureSubtype: "", size: "med", challengeRating: 0.125, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const b = await generateCreatureLoot({
    context: { name: "Assassin", creatureType: "humanoid", creatureSubtype: "", size: "med", challengeRating: 8, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const partRe = /mercenary|calloused|bandit-mask|cult-brand|mage-component|assassin|thugs-brass|guard-watch|veteran|noble-signet|priest-prayer|gladiator|berserker|bounty|cult-cell|barracks|letter-of-marque|captains-purse|scout-trail/;
  cultSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  assassinSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const cultAvg = cultSum / 40;
const assassinAvg = assassinSum / 40;
if (assassinAvg <= cultAvg * 1.25) {
  throw new Error(`Assassin should average more scaled parts than Cultist (assassin=${assassinAvg}, cultist=${cultAvg})`);
}

const beastBoar = resolveCreatureProfile({ name: "Boar", creatureType: "beast", creatureSubtype: "", size: "med" });
const beastBear = resolveCreatureProfile({ name: "Brown Bear", creatureType: "beast", creatureSubtype: "", size: "lg" });
const beastTiger = resolveCreatureProfile({ name: "Tiger", creatureType: "beast", creatureSubtype: "", size: "lg" });
const beastRat = resolveCreatureProfile({ name: "Giant Rat", creatureType: "beast", creatureSubtype: "", size: "sm" });
const beastScorp = resolveCreatureProfile({ name: "Giant Scorpion", creatureType: "beast", creatureSubtype: "", size: "lg" });
const beastFrog = resolveCreatureProfile({ name: "Giant Frog", creatureType: "beast", creatureSubtype: "", size: "med" });
const beastShark = resolveCreatureProfile({ name: "Giant Shark", creatureType: "beast", creatureSubtype: "", size: "huge" });
const beastWolfStill = resolveCreatureProfile({ name: "Wolf", creatureType: "beast", creatureSubtype: "", size: "med" });
const beastSpiderStill = resolveCreatureProfile({ name: "Giant Spider", creatureType: "beast", creatureSubtype: "", size: "lg" });
const beastDireWolf = resolveCreatureProfile({ name: "Dire Wolf", creatureType: "beast", creatureSubtype: "", size: "lg" });
const hillGiantStill = resolveCreatureProfile({ name: "Hill Giant", creatureType: "giant", creatureSubtype: "", size: "huge" });
if (beastBoar?.id !== "beast") throw new Error(`Expected beast for Boar, got ${beastBoar?.id}`);
if (beastBear?.id !== "beast") throw new Error(`Expected beast for Brown Bear, got ${beastBear?.id}`);
if (beastTiger?.id !== "beast") throw new Error(`Expected beast for Tiger, got ${beastTiger?.id}`);
if (beastRat?.id !== "beast") throw new Error(`Expected beast for Giant Rat, got ${beastRat?.id}`);
if (beastScorp?.id !== "beast") throw new Error(`Expected beast for Giant Scorpion, got ${beastScorp?.id}`);
if (beastFrog?.id !== "beast") throw new Error(`Expected beast for Giant Frog, got ${beastFrog?.id}`);
if (beastShark?.id !== "beast") throw new Error(`Expected beast for Giant Shark, got ${beastShark?.id}`);
if (beastWolfStill?.id !== "wolf") throw new Error(`Expected wolf for Wolf, got ${beastWolfStill?.id}`);
if (beastSpiderStill?.id !== "spider") throw new Error(`Expected spider for Giant Spider, got ${beastSpiderStill?.id}`);
if (beastDireWolf?.id !== "wolf") throw new Error(`Expected wolf for Dire Wolf, got ${beastDireWolf?.id}`);
if (hillGiantStill?.id !== "giant") throw new Error(`Expected giant for Hill Giant, got ${hillGiantStill?.id}`);

if (resolveLootScale(beastBoar, { name: "Giant Rat", size: "sm" }) !== 0.4) throw new Error("Giant Rat lootScale should be 0.4");
if (resolveLootScale(beastBoar, { name: "Boar", size: "med" }) !== 0.65) throw new Error("Boar lootScale should be 0.65");
if (resolveLootScale(beastBoar, { name: "Giant Scorpion", size: "lg" }) !== 1.2) throw new Error("Giant Scorpion lootScale should be 1.2");
if (resolveLootScale(beastBoar, { name: "Giant Shark", size: "huge" }) !== 1.35) throw new Error("Giant Shark lootScale should be 1.35");

const scorpLoot = await generateCreatureLoot({
  context: { name: "Giant Scorpion", creatureType: "beast", creatureSubtype: "", size: "lg", challengeRating: 3, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (scorpLoot.profileId !== "beast") throw new Error("Giant Scorpion generation used wrong profile");
if (!scorpLoot.items.some((i) => /beast-|boar-|bear-|great-cat|giant-rat|scorpion|snake-skin|frog-poison|eagle-feather|owl-feather|crocodile|shark-tooth|bloody-fur|claw-sheath|nest-twig|fishbone|fang-charm|tooth-necklace|hunter-trail|beast-lair|ranger-warning/.test(String(i.definitionId || "")))) {
  throw new Error("Giant Scorpion loot missing beast parts");
}

let ratSum = 0;
let sharkSum = 0;
for (let i = 0; i < 40; i++) {
  const a = await generateCreatureLoot({
    context: { name: "Giant Rat", creatureType: "beast", creatureSubtype: "", size: "sm", challengeRating: 0.125, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const b = await generateCreatureLoot({
    context: { name: "Giant Shark", creatureType: "beast", creatureSubtype: "", size: "huge", challengeRating: 5, isWolf: false, isBoss: false, isNamed: false },
    survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
  });
  const partRe = /beast-|boar-|bear-|great-cat|giant-rat|scorpion|snake-skin|frog-poison|eagle-feather|owl-feather|crocodile|shark-tooth|bloody-fur|claw-sheath|nest-twig|fishbone|fang-charm|tooth-necklace|hunter-trail|beast-lair|ranger-warning/;
  ratSum += a.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
  sharkSum += b.items.filter((it) => partRe.test(String(it.definitionId || ""))).reduce((s, it) => s + Number(it.quantity || 1), 0);
}
const ratAvg = ratSum / 40;
const sharkAvg = sharkSum / 40;
if (sharkAvg <= ratAvg * 1.3) {
  throw new Error(`Giant Shark should average more scaled parts than Giant Rat (shark=${sharkAvg}, rat=${ratAvg})`);
}

const blinkDog = resolveCreatureProfile({ name: "Blink Dog", creatureType: "fey", creatureSubtype: "", size: "med" });
const unknownBeast = resolveCreatureProfile({ name: "Unknown Beast", creatureType: "beast", creatureSubtype: "", size: "med" });
const weirdThing = resolveCreatureProfile({ name: "Weird Thing", creatureType: "aberration", creatureSubtype: "", size: "med" });
const wight = resolveCreatureProfile({ name: "Wight", creatureType: "undead", creatureSubtype: "", size: "med" });
const specter = resolveCreatureProfile({ name: "Specter", creatureType: "", creatureSubtype: "", size: "med" });
const mysteryHumanoid = resolveCreatureProfile({ name: "Mysterious Stranger", creatureType: "humanoid", creatureSubtype: "", size: "med" });
const swarmInsects = resolveCreatureProfile({ name: "Swarm of Insects", creatureType: "swarm", creatureSubtype: "", size: "med" });
const noType = resolveCreatureProfile({ name: "No Type Creature", creatureType: "", creatureSubtype: "", size: "med" });
const wolfStillType = resolveCreatureProfile({ name: "Wolf", creatureType: "beast", creatureSubtype: "", size: "med" });
const archStillType = resolveCreatureProfile({ name: "Archmage", creatureType: "humanoid", creatureSubtype: "", size: "med" });
const lichKingStill = resolveCreatureProfile({ name: "Lich King", creatureType: "undead", creatureSubtype: "", size: "med" });
const zombieStill = resolveCreatureProfile({ name: "Zombie", creatureType: "undead", creatureSubtype: "", size: "med" });
const assassinStill = resolveCreatureProfile({ name: "Assassin", creatureType: "humanoid", creatureSubtype: "", size: "med" });
if (blinkDog?.id !== "fey") throw new Error(`Expected fey type fallback for Blink Dog, got ${blinkDog?.id}`);
if (unknownBeast?.id !== "beast") throw new Error(`Expected beast type fallback for Unknown Beast, got ${unknownBeast?.id}`);
if (weirdThing?.id !== "aberration") throw new Error(`Expected aberration type fallback for Weird Thing, got ${weirdThing?.id}`);
if (wight?.id !== "generic-undead") throw new Error(`Expected generic-undead for Wight, got ${wight?.id}`);
if (specter?.id !== "generic-undead") throw new Error(`Expected generic-undead for Specter, got ${specter?.id}`);
if (mysteryHumanoid?.id !== "generic-humanoid") throw new Error(`Expected generic-humanoid for Mysterious Stranger, got ${mysteryHumanoid?.id}`);
if (swarmInsects?.id !== "beast") throw new Error(`Expected beast swarm fallback, got ${swarmInsects?.id}`);
if (noType?.id !== "unknown") throw new Error(`Expected unknown fallback for creature with no type, got ${noType?.id}`);
const typeUnknown = resolveCreatureProfile({ name: "Mystery Critter", creatureType: "unknown", creatureSubtype: "", size: "med" });
const typeBogus = resolveCreatureProfile({ name: "Mystery Critter", creatureType: "totally-made-up", creatureSubtype: "", size: "med" });
if (typeUnknown?.id !== "unknown") throw new Error(`Expected unknown for type "unknown", got ${typeUnknown?.id}`);
if (typeBogus?.id !== "unknown") throw new Error(`Expected unknown for unrecognized type, got ${typeBogus?.id}`);
if (wolfStillType?.id !== "wolf") throw new Error(`Type fallback must not steal Wolf, got ${wolfStillType?.id}`);
if (archStillType?.id !== "archmage") throw new Error(`Type fallback must not steal Archmage, got ${archStillType?.id}`);
if (lichKingStill?.id !== "lich-king") throw new Error(`Type fallback must not steal Lich King, got ${lichKingStill?.id}`);
if (zombieStill?.id !== "zombie") throw new Error(`Type fallback must not steal Zombie, got ${zombieStill?.id}`);
if (assassinStill?.id !== "stock-humanoid") throw new Error(`Type fallback must not steal Assassin, got ${assassinStill?.id}`);

const wightLoot = await generateCreatureLoot({
  context: { name: "Wight", creatureType: "undead", creatureSubtype: "", size: "med", challengeRating: 3, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (wightLoot.profileId !== "generic-undead") throw new Error("Wight generation used wrong profile");
if (!wightLoot.items.some((i) => /rotten-flesh|bone-shard|grave-dirt|ectoplasm|burial|coffin|holy-symbol|unfinished-will/.test(String(i.definitionId || "")))) {
  throw new Error("Wight loot missing generic undead parts");
}

const mysteryLoot = await generateCreatureLoot({
  context: { name: "Mysterious Stranger", creatureType: "humanoid", creatureSubtype: "", size: "med", challengeRating: 1, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (mysteryLoot.profileId !== "generic-humanoid") throw new Error("Mysterious Stranger generation used wrong profile");
if (!mysteryLoot.items.some((i) => /mercenary-blood|calloused-knuckle|dirty-rag|empty-bottle|worn-insignia|copper-ring|wanted-poster|scribbled-note|bounty-board/.test(String(i.definitionId || "")))) {
  throw new Error("Mysterious Stranger loot missing generic humanoid parts");
}

const blinkLoot = await generateCreatureLoot({
  context: { name: "Blink Dog", creatureType: "fey", creatureSubtype: "", size: "med", challengeRating: 0.25, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (blinkLoot.profileId !== "fey") throw new Error("Blink Dog generation used wrong profile");
if (!blinkLoot.items.some((i) => /fey-|pixie-|dryad-|satyr-|redcap-|hag-|wilted|fairy|bargain|coven/.test(String(i.definitionId || "")))) {
  throw new Error("Blink Dog loot missing fey family parts");
}

const unknownLoot = await generateCreatureLoot({
  context: { name: "No Type Creature", creatureType: "", creatureSubtype: "", size: "med", challengeRating: 1, isWolf: false, isBoss: false, isNamed: false },
  survivalTotal: 18, naturalDie: 12, isNatural20: false, actor: null
});
if (unknownLoot.profileId !== "unknown") throw new Error("Unidentified creature generation used wrong profile");
const unknownHasStory = unknownLoot.items.some((i) => /scribbled-note|crude-map|wanted-poster|hunter-trail-map|ranger-warning|bounty-board/.test(String(i.definitionId || "")));
const unknownCurrency = unknownLoot.currency ?? {};
const unknownHasCoin = ["cp", "sp", "gp"].some((k) => Number(unknownCurrency[k] || 0) > 0)
  || unknownLoot.items.some((i) => i.kind === "currency");
if (!unknownHasStory) throw new Error("Unidentified creature loot missing story scraps");
if (!unknownHasCoin) throw new Error("Unidentified creature loot missing money");
if (unknownLoot.items.some((i) => /fang|claw|hide|blood-vial|scale|tooth|ichor|heart/.test(String(i.definitionId || "")))) {
  throw new Error("Unidentified creature should not drop monster parts");
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
