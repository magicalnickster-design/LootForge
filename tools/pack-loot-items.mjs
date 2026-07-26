/**
 * Compile packs/src/loot-items/*.json into packs/loot-items LevelDB.
 *
 * Usage: node tools/pack-loot-items.mjs
 */
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "packs/src/loot-items");
const dest = path.join(root, "packs/loot-items");

await rm(dest, { recursive: true, force: true });
await compilePack(src, dest, { log: true });
console.log(`Packed LootForge Items → ${dest}`);
