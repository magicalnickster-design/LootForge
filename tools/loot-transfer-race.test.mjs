import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const transferSrc = readFileSync(join(root, "scripts/modules/loot-transfer.js"), "utf8");
const socketSrc = readFileSync(join(root, "scripts/modules/socket-manager.js"), "utf8");

test("take-all and take-item share one corpse transfer lock", () => {
  assert.match(transferSrc, /corpseTransferLockKey/);
  assert.match(transferSrc, /:TRANSFER/);
  assert.doesNotMatch(transferSrc, /uuid\}:ALL/);
  assert.doesNotMatch(transferSrc, /uuid\}:\$\{entryId\}/);
});

test("take-all claims corpse items before granting to actors", () => {
  const takeAllBlock = transferSrc.slice(
    transferSrc.indexOf("export async function takeAllCorpseItems"),
    transferSrc.indexOf("export async function depositRemainingToCorpse")
  );
  const claimIdx = takeAllBlock.indexOf("items: []");
  const grantIdx = takeAllBlock.indexOf("grantEntryToActor");
  assert.ok(claimIdx > 0, "takeAll must clear corpse items");
  assert.ok(grantIdx > claimIdx, "grant must happen after corpse claim/clear");
});

test("take-item claims corpse quantity before granting", () => {
  const takeItemBlock = transferSrc.slice(
    transferSrc.indexOf("export async function takeCorpseItem"),
    transferSrc.indexOf("export async function takeAllCorpseItems")
  );
  const claimIdx = takeItemBlock.indexOf("updateCorpseState");
  const grantIdx = takeItemBlock.indexOf("grantEntryToActor");
  assert.ok(claimIdx > 0);
  assert.ok(grantIdx > claimIdx, "takeItem must update corpse before grantEntryToActor");
});

test("socket manager rejects concurrent loot-all for same corpse", () => {
  assert.match(socketSrc, /TAKE_ALL:\$\{payload\.tokenUuid\}/);
  assert.match(socketSrc, /Ignoring concurrent Loot All/);
});
