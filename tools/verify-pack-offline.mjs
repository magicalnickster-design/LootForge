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

if (moduleJson.version !== "0.2.2") {
  throw new Error(`Expected module version 0.2.2, got ${moduleJson.version}`);
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

// Open a TEMPORARY copy so verification never dirties the release pack.
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

  if (items.length !== 5) throw new Error(`Expected 5 pack items, found ${items.length}`);

  const requiredFlagKeys = ["definitionId", "category", "rarity", "tags", "stackingKey"];
  const expectedNames = new Set([
    "Wolf Pelt",
    "Wolf Fang",
    "Wolf Meat",
    "Wolf Claw",
    "Alpha Wolf Fang"
  ]);
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

// Fallback transfer helpers without Foundry.
const { buildFallbackItemData, getLootDefinition, resolveItemDataForTransfer } = await import(
  "../scripts/data/loot-definitions.js"
);

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

console.log("Offline pack verification passed.");
console.log(`module.json version: ${moduleJson.version}`);
console.log(`pack label: ${packDecl.label}`);
console.log("Exact shipped LevelDB files:");
for (const name of shipped) {
  const size = statSync(path.join(packDir, name)).size;
  console.log(`  packs/loot-items/${name} (${size} bytes)`);
}
