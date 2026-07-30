#!/usr/bin/env node
/**
 * Build a Foundry-installable LootForge.zip with module.json at the ZIP root.
 *
 * Usage:
 *   node tools/build-release-zip.mjs
 *   node tools/build-release-zip.mjs --version 0.6.4
 *   node tools/build-release-zip.mjs --out dist
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { readdir, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readArg(name, fallback = "") {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

const outDir = path.resolve(root, readArg("out", "dist"));
const versionOverride = readArg("version", "");
const zipName = "LootForge.zip";

const INCLUDE = [
  "module.json",
  "README.md",
  "lang",
  "scripts",
  "styles",
  "templates",
  "assets",
  "packs/loot-items"
];

const EXCLUDE_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  ".github",
  "dist",
  "tools",
  "packs/src"
]);

function assertValidModuleJson(filePath) {
  const raw = readFileSync(filePath, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${filePath}: ${err.message}`);
  }
  if (!data.id || !data.version || !data.download || !data.manifest) {
    throw new Error("module.json must include id, version, manifest, and download");
  }
  if (data.downloadUrl) {
    throw new Error('module.json must use "download", not "downloadUrl"');
  }
  if (!String(data.download).endsWith("LootForge.zip")) {
    throw new Error('download URL must end with exact filename LootForge.zip');
  }
  return data;
}

function syncReleaseUrls(modulePath, version) {
  const data = assertValidModuleJson(modulePath);
  data.version = version;
  data.url = "https://github.com/magicalnickster-design/LootForge";
  data.manifest = `https://github.com/magicalnickster-design/LootForge/releases/download/${version}/module.json`;
  data.download = `https://github.com/magicalnickster-design/LootForge/releases/download/${version}/LootForge.zip`;
  writeFileSync(modulePath, `${JSON.stringify(data, null, 2)}\n`);
  return data;
}

async function pathExists(p) {
  return existsSync(p);
}

async function copyIncluded(stagingDir) {
  for (const rel of INCLUDE) {
    const src = path.join(root, rel);
    if (!(await pathExists(src))) {
      throw new Error(`Missing required release path: ${rel}`);
    }
    const dest = path.join(stagingDir, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    await cp(src, dest, {
      recursive: true,
      filter: (source) => {
        const base = path.basename(source);
        if (EXCLUDE_DIR_NAMES.has(base)) return false;
        if (source.includes(`${path.sep}packs${path.sep}src`)) return false;
        return true;
      }
    });
  }
}

function zipStaging(stagingDir, zipPath) {
  if (existsSync(zipPath)) rmSync(zipPath);
  // Zip contents of staging so module.json is at ZIP root (no parent folder).
  const result = spawnSync(
    "zip",
    ["-r", "-q", zipPath, "."],
    { cwd: stagingDir, stdio: "inherit" }
  );
  if (result.status !== 0) {
    throw new Error("zip command failed — ensure `zip` is installed");
  }
}

async function listZipRootEntries(zipPath) {
  const result = spawnSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error("unzip -Z1 failed while validating ZIP layout");
  }
  return String(result.stdout || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const stagingDir = path.join(outDir, "staging");
  const zipPath = path.join(outDir, zipName);
  const moduleOut = path.join(outDir, "module.json");

  if (existsSync(stagingDir)) rmSync(stagingDir, { recursive: true, force: true });
  mkdirSync(stagingDir, { recursive: true });

  const modulePath = path.join(root, "module.json");
  const current = assertValidModuleJson(modulePath);
  const version = versionOverride || current.version;
  const synced = syncReleaseUrls(modulePath, version);

  // Keep package.json version aligned when present.
  const pkgPath = path.join(root, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    pkg.version = version;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  await copyIncluded(stagingDir);

  // Ensure staged module.json matches synced release URLs.
  writeFileSync(path.join(stagingDir, "module.json"), `${JSON.stringify(synced, null, 2)}\n`);
  writeFileSync(moduleOut, `${JSON.stringify(synced, null, 2)}\n`);

  zipStaging(stagingDir, zipPath);
  const entries = await listZipRootEntries(zipPath);
  if (!entries.includes("module.json")) {
    throw new Error("LootForge.zip must contain module.json at the ZIP root");
  }
  if (entries.some((e) => e.startsWith("LootForge/") || e.startsWith("lootforge/"))) {
    throw new Error("LootForge.zip must not wrap files in an extra parent folder");
  }

  const bytes = statSync(zipPath).size;
  const sha = createHash("sha256").update(readFileSync(zipPath)).digest("hex");
  console.log(JSON.stringify({
    version,
    zip: zipPath,
    moduleJson: moduleOut,
    zipBytes: bytes,
    sha256: sha,
    download: synced.download,
    manifest: synced.manifest,
    rootHasModuleJson: entries.includes("module.json")
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
