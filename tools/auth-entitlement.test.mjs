import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_ID } from "../scripts/auth/auth-constants.js";
import {
  normalizeSessionPayload,
  stateFromError
} from "../scripts/auth/auth-client.js";

test("product id is lootforge", () => {
  assert.equal(PRODUCT_ID, "lootforge");
});

test("normalizeSessionPayload maps lootforge entitlement", () => {
  const normalized = normalizeSessionPayload(
    {
      accessToken: "a",
      refreshToken: "r",
      expiresAt: "2099-01-01T00:00:00.000Z",
      user: { id: "u1", email: "gm@example.com" }
    },
    {
      allowed: true,
      subscriptionStatus: "active",
      plan: "tier1",
      expiresAt: "2099-02-01T00:00:00.000Z"
    }
  );
  assert.equal(normalized.entitlement.productId, "lootforge");
  assert.equal(normalized.entitlement.allowed, true);
  assert.equal(normalized.subscription.plan, "tier1");
  assert.equal(normalized.user.email, "gm@example.com");
  assert.equal(normalized.accessToken, "a");
});

test("stateFromError maps known codes", () => {
  assert.equal(stateFromError({ errorCode: "AUTH_REQUIRED" }), "signed_out");
  assert.equal(stateFromError({ errorCode: "SUBSCRIPTION_INACTIVE" }), "subscription_inactive");
  assert.equal(stateFromError({ errorCode: "ENTITLEMENT_DENIED" }), "entitlement_denied");
  assert.equal(stateFromError({ status: 404 }), "entitlement_denied");
  assert.equal(stateFromError({ errorCode: "BACKEND_UNAVAILABLE" }), "backend_offline");
});

test("auth client requests lootforge entitlement path", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        allowed: true,
        entitled: true,
        subscriptionStatus: "active",
        plan: "tier2",
        expiresAt: "2099-01-01T00:00:00.000Z"
      })
    };
  };
  try {
    const { getEntitlement } = await import("../scripts/auth/auth-client.js");
    const result = await getEntitlement("token-1");
    assert.equal(result.ok, true);
    assert.match(calls[0].url, /\/api\/entitlements\/lootforge$/);
    assert.equal(calls[0].init.headers.Authorization, "Bearer token-1");
    assert.equal(result.payload.plan, "tier2");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("auth client falls back to /api/subscription when lootforge entitlement is missing", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    calls.push(String(url));
    if (String(url).endsWith("/api/entitlements/lootforge")) {
      return { ok: false, status: 404, text: async () => "Cannot GET" };
    }
    if (String(url).endsWith("/api/subscription")) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          status: "active",
          plan: { slug: "adventurer", name: "Adventurer" },
          currentPeriodEnd: "2099-01-01T00:00:00.000Z",
          generationsRemaining: 0,
          generationsTotal: 50
        })
      };
    }
    return { ok: false, status: 500, text: async () => "{}" };
  };
  try {
    const { getEntitlement } = await import("../scripts/auth/auth-client.js");
    const result = await getEntitlement("token-2");
    assert.equal(result.ok, true);
    assert.equal(result.payload.allowed, true);
    assert.equal(result.payload.product, "lootforge");
    assert.equal(result.payload.tier, 1);
    assert.equal(result.payload.plan, "adventurer");
    assert.ok(calls.some((u) => u.endsWith("/api/subscription")));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("subscription fallback denies free accounts", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/api/entitlements/lootforge")) {
      return { ok: false, status: 404, text: async () => "Cannot GET" };
    }
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        status: "inactive",
        plan: { slug: "free", name: "Free" }
      })
    };
  };
  try {
    const { getEntitlement } = await import("../scripts/auth/auth-client.js");
    const result = await getEntitlement("token-free");
    assert.equal(result.ok, false);
    assert.equal(result.status, 403);
    assert.equal(result.payload.reason, "subscription_required");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("subscription fallback caps expiresAt at 30 days", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/api/entitlements/lootforge")) {
      return { ok: false, status: 404, text: async () => "Cannot GET" };
    }
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        status: "active",
        plan: { slug: "founder", name: "Founder" },
        currentPeriodEnd: "2035-01-01T00:00:00.000Z"
      })
    };
  };
  try {
    const { getEntitlement } = await import("../scripts/auth/auth-client.js");
    const before = Date.now();
    const result = await getEntitlement("token-founder");
    const after = Date.now();
    assert.equal(result.ok, true);
    const expiresMs = Date.parse(result.payload.expiresAt);
    const maxMs = 30 * 24 * 60 * 60 * 1000;
    assert.ok(expiresMs - before <= maxMs + 1000);
    assert.ok(expiresMs - after <= maxMs);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
