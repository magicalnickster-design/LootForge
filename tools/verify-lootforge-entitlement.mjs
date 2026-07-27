#!/usr/bin/env node
/**
 * Production verification for GET /api/entitlements/lootforge
 *
 * Usage:
 *   node tools/verify-lootforge-entitlement.mjs
 *   node tools/verify-lootforge-entitlement.mjs --token "$ACCESS_TOKEN"
 *   node tools/verify-lootforge-entitlement.mjs --base https://gambitsforge.online --token "$ACCESS_TOKEN"
 */

const args = process.argv.slice(2);
function readArg(name, fallback = "") {
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && args[idx + 1]) return args[idx + 1];
  return fallback;
}

const base = String(readArg("base", "https://gambitsforge.online")).replace(/\/+$/, "");
const token = readArg("token", process.env.GAMBITS_ACCESS_TOKEN || "");
const url = `${base}/api/entitlements/lootforge`;

const headers = { Accept: "application/json" };
if (token) headers.Authorization = `Bearer ${token}`;

const response = await fetch(url, { headers });
const text = await response.text();
let json = null;
try {
  json = JSON.parse(text);
} catch {
  json = null;
}

const summary = {
  url,
  status: response.status,
  contentType: response.headers.get("content-type"),
  authenticated: Boolean(token),
  body: json ?? text.slice(0, 300),
  routeDeployed: !(response.status === 404 && /Cannot GET/i.test(text)),
  canCacheEntitlement: Boolean(json?.allowed === true && json?.expiresAt)
};

console.log(JSON.stringify(summary, null, 2));

if (!summary.routeDeployed) {
  console.error("\nFAIL: production still returns 404 for /api/entitlements/lootforge");
  process.exit(2);
}

if (!token) {
  if (response.status !== 401) {
    console.error("\nFAIL: unauthenticated probe expected HTTP 401 JSON");
    process.exit(1);
  }
  console.error("\nOK: route exists (401 without token). Re-run with --token to check paid/free accounts.");
  process.exit(0);
}

if (![200, 403].includes(response.status) || !json) {
  console.error("\nFAIL: authenticated entitlement response was not 200/403 JSON");
  process.exit(1);
}

console.error(`\nOK: authenticated entitlement returned HTTP ${response.status}`);
process.exit(0);
