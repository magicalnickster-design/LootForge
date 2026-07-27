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
        subscriptionStatus: "active",
        plan: "tier2",
        expiresAt: "2099-01-01T00:00:00.000Z"
      })
    };
  };
  try {
    const { getEntitlement, getAuthBaseUrl } = await import("../scripts/auth/auth-client.js");
    // getAuthBaseUrl is in constants; call getEntitlement directly
    const result = await getEntitlement("token-1");
    assert.equal(result.ok, true);
    assert.match(calls[0].url, /\/api\/entitlements\/lootforge$/);
    assert.equal(calls[0].init.headers.Authorization, "Bearer token-1");
    assert.equal(result.payload.plan, "tier2");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
