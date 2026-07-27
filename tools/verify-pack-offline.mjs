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

if (moduleJson.version !== "0.5.7") {
  throw new Error(`Expected module version 0.5.7, got ${moduleJson.version}`);
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
  "Scorched Map"
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
if (listLootDefinitions().length < 70) {
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
