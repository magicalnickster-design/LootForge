import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("loot range constant is 10 feet", async () => {
  const src = readFileSync(join(root, "scripts/modules/constants.js"), "utf8");
  assert.match(src, /LOOT_RANGE_FEET\s*=\s*10/);
});

test("player loot paths enforce range checks", () => {
  const workflow = readFileSync(join(root, "scripts/modules/loot-workflow.js"), "utf8");
  const sockets = readFileSync(join(root, "scripts/modules/socket-manager.js"), "utf8");
  assert.match(workflow, /assertPlayerLootRange/);
  assert.match(sockets, /assertPlayerLootRange/);
  assert.match(sockets, /requestTakeAll[\s\S]*assertPlayerLootRange/);
});

test("loot release no longer auto-opens every player window", () => {
  const sockets = readFileSync(join(root, "scripts/modules/socket-manager.js"), "utf8");
  const releaseBlock = sockets.slice(
    sockets.indexOf("export async function releaseLootForEveryone"),
    sockets.indexOf("export async function requestTakeItem")
  );
  assert.doesNotMatch(releaseBlock, /OPEN_PLAYER_WINDOW/);
  assert.match(releaseBlock, /LootReadyApproach|approach to loot/);
});

test("double-click loot registers token patch and canvas fallback", () => {
  const dbl = readFileSync(join(root, "scripts/ui/token-dblclick.js"), "utf8");
  assert.match(dbl, /_onClickLeft2/);
  assert.match(dbl, /bindCanvasDoubleClickFallback/);
  assert.match(dbl, /addEventListener\("dblclick"/);
});
