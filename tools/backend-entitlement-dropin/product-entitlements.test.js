const test = require("node:test");
const assert = require("node:assert/strict");
const {
  evaluateProductEntitlement,
  computeExpiresAt,
  PRODUCT_CONFIG,
  MAX_ENTITLEMENT_MS
} = require("../src/lib/productEntitlements");

const checkedAt = new Date("2026-07-27T12:00:00.000Z");

test("unknown product returns 404", () => {
  const result = evaluateProductEntitlement("nope", { status: "active", plan: { slug: "adventurer" } });
  assert.equal(result.status, 404);
  assert.equal(result.body.code, "UNKNOWN_PRODUCT");
});

test("unauthenticated caller is handled by middleware contract via subscription_required when empty", () => {
  const result = evaluateProductEntitlement("lootforge", {});
  assert.equal(result.status, 403);
  assert.equal(result.body.reason, "subscription_required");
  assert.equal(result.body.allowed, false);
  assert.equal(result.body.entitled, false);
});

test("active tier1 adventurer is allowed for lootforge", () => {
  const result = evaluateProductEntitlement(
    "lootforge",
    {
      status: "active",
      plan: { slug: "adventurer", name: "Adventurer" },
      currentPeriodEnd: "2026-09-01T00:00:00.000Z",
      generationsRemaining: 0,
      generationsTotal: 50
    },
    { checkedAt }
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.allowed, true);
  assert.equal(result.body.entitled, true);
  assert.equal(result.body.product, "lootforge");
  assert.equal(result.body.tier, 1);
  assert.equal(result.body.plan, "adventurer");
  assert.equal(result.body.subscriptionStatus, "active");
});

test("active tier2 and tier3 are allowed for lootforge", () => {
  for (const slug of ["dungeon-master", "founder"]) {
    const result = evaluateProductEntitlement(
      "lootforge",
      { status: "active", plan: { slug }, currentPeriodEnd: "2026-09-01T00:00:00.000Z" },
      { checkedAt }
    );
    assert.equal(result.status, 200, slug);
    assert.equal(result.body.allowed, true, slug);
  }
});

test("free user is denied", () => {
  const result = evaluateProductEntitlement("lootforge", {
    status: "inactive",
    plan: { slug: "free", name: "Free" }
  });
  assert.equal(result.status, 403);
  assert.equal(result.body.reason, "subscription_required");
});

test("expired subscriber is denied", () => {
  const result = evaluateProductEntitlement(
    "lootforge",
    {
      status: "expired",
      plan: { slug: "adventurer" },
      currentPeriodEnd: "2026-01-01T00:00:00.000Z"
    },
    { checkedAt }
  );
  assert.equal(result.status, 403);
  assert.equal(result.body.reason, "subscription_expired");
});

test("suspended account is denied", () => {
  const result = evaluateProductEntitlement(
    "lootforge",
    { status: "active", plan: { slug: "adventurer" } },
    { accountSuspended: true, checkedAt }
  );
  assert.equal(result.status, 403);
  assert.equal(result.body.reason, "account_suspended");
});

test("zero SceneForgeAI generations does not affect LootForge", () => {
  const result = evaluateProductEntitlement(
    "lootforge",
    {
      status: "active",
      plan: { slug: "adventurer" },
      generationsRemaining: 0,
      generationsTotal: 50,
      currentPeriodEnd: "2026-09-01T00:00:00.000Z"
    },
    { checkedAt }
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.allowed, true);
});

test("sceneforge-ai still evaluates with usage rules", () => {
  const ok = evaluateProductEntitlement(
    "sceneforge-ai",
    {
      status: "active",
      plan: { slug: "adventurer" },
      generationsRemaining: 5,
      generationsTotal: 50,
      currentPeriodEnd: "2026-09-01T00:00:00.000Z"
    },
    { checkedAt }
  );
  assert.equal(ok.status, 200);

  const exhausted = evaluateProductEntitlement(
    "sceneforge-ai",
    {
      status: "active",
      plan: { slug: "adventurer" },
      generationsRemaining: 0,
      generationsTotal: 50,
      currentPeriodEnd: "2026-09-01T00:00:00.000Z"
    },
    { checkedAt }
  );
  assert.equal(exhausted.status, 403);
  assert.equal(exhausted.body.code, "USAGE_EXHAUSTED");
});

test("entitlement expiration is at most 30 days", () => {
  const farFuture = "2030-01-01T00:00:00.000Z";
  const expiresAt = computeExpiresAt(
    { currentPeriodEnd: farFuture },
    checkedAt
  );
  const expiresMs = Date.parse(expiresAt);
  assert.ok(expiresMs - checkedAt.getTime() <= MAX_ENTITLEMENT_MS);
  assert.equal(expiresAt, new Date(checkedAt.getTime() + MAX_ENTITLEMENT_MS).toISOString());
});

test("earlier subscription period end wins over 30 day cap", () => {
  const soon = "2026-08-01T00:00:00.000Z";
  const expiresAt = computeExpiresAt({ currentPeriodEnd: soon }, checkedAt);
  assert.equal(expiresAt, soon);
});

test("lootforge product config is not usage based", () => {
  assert.equal(PRODUCT_CONFIG.lootforge.usageBased, false);
  assert.equal(PRODUCT_CONFIG.lootforge.requireGenerationBalance, false);
  assert.equal(PRODUCT_CONFIG.lootforge.minTier, 1);
});

test("revoked product entitlement is denied", () => {
  const result = evaluateProductEntitlement(
    "lootforge",
    { status: "active", plan: { slug: "founder" } },
    { entitlementRevoked: true, checkedAt }
  );
  assert.equal(result.status, 403);
  assert.equal(result.body.reason, "entitlement_revoked");
});
