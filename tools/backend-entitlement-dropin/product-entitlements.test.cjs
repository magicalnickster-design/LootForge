const test = require("node:test");
const assert = require("node:assert/strict");
const {
  evaluateProductEntitlement,
  computeExpiresAt,
  createEntitlementsRouter,
  PRODUCT_CONFIG,
  MAX_ENTITLEMENT_MS
} = require("./productEntitlements.cjs");

const checkedAt = new Date("2026-07-27T12:00:00.000Z");

function makeRouterApp(loadSubscription) {
  const routes = new Map();
  const router = {
    get(path, ...handlers) {
      routes.set(`GET ${path}`, handlers);
    },
    post(path, ...handlers) {
      routes.set(`POST ${path}`, handlers);
    }
  };

  createEntitlementsRouter({
    expressRouter: router,
    requireAuth: (req, res, next) => {
      const header = String(req.headers?.authorization || "");
      if (!header.startsWith("Bearer ") || !header.slice(7)) {
        return res.status(401).json({
          error: "Unauthorized",
          code: "AUTH_REQUIRED",
          reason: "unauthenticated"
        });
      }
      req.user = { id: "user-1" };
      return next();
    },
    loadSubscription
  });

  async function request(method, path, { authorization } = {}) {
    const key = `${method} /:productSlug${path.includes("/consume") ? "/consume" : ""}`;
    const handlers = routes.get(
      path.includes("/consume") ? `POST /:productSlug/consume` : `GET /:productSlug`
    );
    assert.ok(handlers, `missing handlers for ${key}`);

    const productSlug = path.replace(/^\/+/, "").split("/")[0];
    const req = {
      params: { productSlug },
      headers: authorization ? { authorization } : {},
      user: null
    };
    let statusCode = 200;
    let body = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        body = payload;
        return this;
      }
    };

    let index = 0;
    const next = async (err) => {
      if (err) throw err;
      const handler = handlers[index++];
      if (!handler) return;
      await handler(req, res, next);
    };
    await next();
    return { status: statusCode, body };
  }

  return { request };
}

test("1. unauthenticated request is denied", async () => {
  const app = makeRouterApp(async () => ({
    subscription: { status: "active", plan: { slug: "adventurer" } }
  }));
  const res = await app.request("GET", "/lootforge");
  assert.equal(res.status, 401);
  assert.equal(res.body.code, "AUTH_REQUIRED");
  assert.equal(res.body.reason, "unauthenticated");
});

test("2. active Tier 1 user is allowed", () => {
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
  assert.equal(result.body.tierName, "Adventurer");
  assert.equal(result.body.subscriptionStatus, "active");
  assert.equal(result.body.checkedAt, checkedAt.toISOString());
});

test("3. active Tier 2 user is allowed", () => {
  const result = evaluateProductEntitlement(
    "lootforge",
    { status: "active", plan: { slug: "dungeon-master" }, currentPeriodEnd: "2026-09-01T00:00:00.000Z" },
    { checkedAt }
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.tier, 2);
  assert.equal(result.body.allowed, true);
});

test("4. active Tier 3 user is allowed", () => {
  const result = evaluateProductEntitlement(
    "lootforge",
    { status: "active", plan: { slug: "founder" }, currentPeriodEnd: "2026-09-01T00:00:00.000Z" },
    { checkedAt }
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.tier, 3);
  assert.equal(result.body.allowed, true);
});

test("5. free user is denied", () => {
  const result = evaluateProductEntitlement("lootforge", {
    status: "inactive",
    plan: { slug: "free", name: "Free" }
  });
  assert.equal(result.status, 403);
  assert.equal(result.body.reason, "subscription_required");
  assert.equal(result.body.allowed, false);
  assert.equal(result.body.entitled, false);
});

test("6. expired subscriber is denied", () => {
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

test("7. suspended account is denied", () => {
  const result = evaluateProductEntitlement(
    "lootforge",
    { status: "active", plan: { slug: "adventurer" } },
    { accountSuspended: true, checkedAt }
  );
  assert.equal(result.status, 403);
  assert.equal(result.body.reason, "account_suspended");
});

test("8. zero SceneForgeAI generations does not affect LootForge", () => {
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

test("9. entitlement expiration is at most 30 days", () => {
  const farFuture = "2030-01-01T00:00:00.000Z";
  const expiresAt = computeExpiresAt({ currentPeriodEnd: farFuture }, checkedAt);
  const expiresMs = Date.parse(expiresAt);
  assert.ok(expiresMs - checkedAt.getTime() <= MAX_ENTITLEMENT_MS);
  assert.equal(expiresAt, new Date(checkedAt.getTime() + MAX_ENTITLEMENT_MS).toISOString());

  const soon = "2026-08-01T00:00:00.000Z";
  assert.equal(computeExpiresAt({ currentPeriodEnd: soon }, checkedAt), soon);
});

test("10. no generation usage record is created for lootforge consume", async () => {
  let loads = 0;
  const app = makeRouterApp(async () => {
    loads += 1;
    return { subscription: { status: "active", plan: { slug: "adventurer" } } };
  });
  const res = await app.request("POST", "/lootforge/consume", {
    authorization: "Bearer test-token"
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.code, "USAGE_NOT_SUPPORTED");
  assert.equal(loads, 0);
});

test("11. SceneForgeAI entitlement still works unchanged", () => {
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
  assert.equal(ok.body.product, "sceneforge-ai");

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

test("12. unknown product slugs still return the expected error", async () => {
  const unit = evaluateProductEntitlement("nope", { status: "active", plan: { slug: "adventurer" } });
  assert.equal(unit.status, 404);
  assert.equal(unit.body.code, "UNKNOWN_PRODUCT");

  const app = makeRouterApp(async () => ({
    subscription: { status: "active", plan: { slug: "adventurer" } }
  }));
  const res = await app.request("GET", "/not-a-product", {
    authorization: "Bearer test-token"
  });
  assert.equal(res.status, 404);
  assert.equal(res.body.code, "UNKNOWN_PRODUCT");
});

test("13. lootforge product route is registered (no local 404)", async () => {
  const app = makeRouterApp(async () => ({
    subscription: {
      status: "active",
      plan: { slug: "adventurer" },
      currentPeriodEnd: "2026-09-01T00:00:00.000Z"
    }
  }));
  const unauth = await app.request("GET", "/lootforge");
  assert.notEqual(unauth.status, 404);
  assert.equal(unauth.status, 401);

  const auth = await app.request("GET", "/lootforge", {
    authorization: "Bearer test-token"
  });
  assert.notEqual(auth.status, 404);
  assert.equal(auth.status, 200);
});

test("production probe: route must not 404 after account API deploy", async (t) => {
  if (process.env.VERIFY_PRODUCTION !== "1") {
    t.skip("Set VERIFY_PRODUCTION=1 to assert gambitsforge.online no longer 404s");
    return;
  }
  const response = await fetch("https://gambitsforge.online/api/entitlements/lootforge");
  const text = await response.text();
  assert.notEqual(response.status, 404, text.slice(0, 200));
  assert.equal(response.status, 401);
  assert.match(response.headers.get("content-type") || "", /json/i);
});

test("approved admin/temporary overrides unlock lootforge", () => {
  const result = evaluateProductEntitlement(
    "lootforge",
    {
      status: "inactive",
      plan: { slug: "free" },
      temporaryEntitlement: { approved: true, tier: 1, expiresAt: "2026-08-10T00:00:00.000Z" }
    },
    { checkedAt }
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.allowed, true);
  assert.equal(result.body.expiresAt, "2026-08-10T00:00:00.000Z");
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

test("lootforge product config is not usage based", () => {
  assert.equal(PRODUCT_CONFIG.lootforge.usageBased, false);
  assert.equal(PRODUCT_CONFIG.lootforge.requireGenerationBalance, false);
  assert.equal(PRODUCT_CONFIG.lootforge.minTier, 1);
});

test("authenticated route returns allowed payload for tier1", async () => {
  const app = makeRouterApp(async () => ({
    subscription: {
      status: "active",
      plan: { slug: "adventurer", name: "Adventurer" },
      currentPeriodEnd: "2026-09-01T00:00:00.000Z",
      generationsRemaining: 0,
      generationsTotal: 50
    }
  }));
  const res = await app.request("GET", "/lootforge", {
    authorization: "Bearer test-token"
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.product, "lootforge");
  assert.equal(res.body.allowed, true);
  assert.equal(res.body.entitled, true);
  assert.equal(res.body.tier, 1);
});
