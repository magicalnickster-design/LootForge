const MAX_ENTITLEMENT_MS = 30 * 24 * 60 * 60 * 1000;

const PLAN_TIERS = Object.freeze({
  adventurer: { tier: 1, tierName: "Adventurer", plan: "adventurer" },
  "dungeon-master": { tier: 2, tierName: "Dungeon Master", plan: "dungeon-master" },
  dungeonmaster: { tier: 2, tierName: "Dungeon Master", plan: "dungeon-master" },
  founder: { tier: 3, tierName: "Founder", plan: "founder" },
  tier1: { tier: 1, tierName: "Adventurer", plan: "adventurer" },
  tier2: { tier: 2, tierName: "Dungeon Master", plan: "dungeon-master" },
  tier3: { tier: 3, tierName: "Founder", plan: "founder" },
  subscriber: { tier: 1, tierName: "Adventurer", plan: "adventurer" }
});

const PRODUCT_CONFIG = Object.freeze({
  "sceneforge-ai": {
    slug: "sceneforge-ai",
    minTier: 1,
    usageBased: true,
    requireGenerationBalance: true
  },
  lootforge: {
    slug: "lootforge",
    minTier: 1,
    usageBased: false,
    requireGenerationBalance: false
  }
});

function nowIso(date = new Date()) {
  return date.toISOString();
}

function parseTime(value) {
  const ms = Date.parse(String(value ?? ""));
  return Number.isFinite(ms) ? ms : NaN;
}

function normalizePlanKey(subscription = {}) {
  const raw = String(
    subscription?.plan?.slug
    ?? subscription?.plan?.id
    ?? subscription?.planSlug
    ?? subscription?.plan
    ?? subscription?.tier
    ?? ""
  )
    .trim()
    .toLowerCase()
    .replace(/^plan_/, "")
    .replace(/\s+/g, "-");
  return raw;
}

function resolveTier(subscription = {}) {
  const key = normalizePlanKey(subscription);
  if (PLAN_TIERS[key]) return PLAN_TIERS[key];
  const numeric = Number(subscription?.tier ?? subscription?.plan?.tier);
  if (Number.isFinite(numeric) && numeric >= 3) return PLAN_TIERS.founder;
  if (Number.isFinite(numeric) && numeric >= 2) return PLAN_TIERS["dungeon-master"];
  if (Number.isFinite(numeric) && numeric >= 1) return PLAN_TIERS.adventurer;
  const name = String(subscription?.plan?.name ?? "").trim().toLowerCase();
  if (name.includes("founder")) return PLAN_TIERS.founder;
  if (name.includes("dungeon")) return PLAN_TIERS["dungeon-master"];
  if (name.includes("adventurer")) return PLAN_TIERS.adventurer;
  return { tier: 0, tierName: "Free", plan: "free" };
}

function resolveSubscriptionStatus(subscription = {}) {
  const status = String(subscription?.status ?? subscription?.subscriptionStatus ?? "")
    .trim()
    .toLowerCase();
  if (!status) {
    if (subscription?.active === true) return "active";
    return "inactive";
  }
  return status;
}

function computeExpiresAt(subscription = {}, checkedAt = new Date()) {
  const maxMs = checkedAt.getTime() + MAX_ENTITLEMENT_MS;
  const periodEndMs = parseTime(subscription?.currentPeriodEnd ?? subscription?.expiresAt);
  const expiresMs = Number.isFinite(periodEndMs) ? Math.min(periodEndMs, maxMs) : maxMs;
  return new Date(expiresMs).toISOString();
}

function deniedPayload(product, reason, extra = {}) {
  return {
    product,
    allowed: false,
    entitled: false,
    reason,
    subscriptionStatus: extra.subscriptionStatus ?? "inactive",
    checkedAt: extra.checkedAt ?? nowIso(),
    ...extra.fields
  };
}

function allowedPayload(product, subscription, tierInfo, checkedAt = new Date()) {
  return {
    product,
    allowed: true,
    entitled: true,
    plan: tierInfo.plan,
    tier: tierInfo.tier,
    tierName: tierInfo.tierName,
    subscriptionStatus: "active",
    expiresAt: computeExpiresAt(subscription, checkedAt),
    checkedAt: nowIso(checkedAt)
  };
}

function evaluateProductEntitlement(productSlug, subscription = {}, options = {}) {
  const checkedAt = options.checkedAt ?? new Date();
  const product = PRODUCT_CONFIG[productSlug];
  if (!product) {
    return {
      status: 404,
      body: {
        error: "Unknown product",
        code: "UNKNOWN_PRODUCT",
        product: productSlug
      }
    };
  }

  if (options.accountSuspended) {
    return {
      status: 403,
      body: deniedPayload(product.slug, "account_suspended", {
        checkedAt: nowIso(checkedAt),
        subscriptionStatus: "suspended"
      })
    };
  }

  if (options.entitlementRevoked) {
    return {
      status: 403,
      body: deniedPayload(product.slug, "entitlement_revoked", {
        checkedAt: nowIso(checkedAt)
      })
    };
  }

  const status = resolveSubscriptionStatus(subscription);
  if (status === "suspended") {
    return {
      status: 403,
      body: deniedPayload(product.slug, "account_suspended", {
        checkedAt: nowIso(checkedAt),
        subscriptionStatus: "suspended"
      })
    };
  }

  const tierInfo = resolveTier(subscription);
  const periodEndMs = parseTime(subscription?.currentPeriodEnd ?? subscription?.expiresAt);
  const expired =
    status === "expired"
    || status === "canceled" && Number.isFinite(periodEndMs) && periodEndMs <= checkedAt.getTime()
    || (Number.isFinite(periodEndMs) && periodEndMs <= checkedAt.getTime() && status !== "active");

  if (expired || status === "expired") {
    return {
      status: 403,
      body: deniedPayload(product.slug, "subscription_expired", {
        checkedAt: nowIso(checkedAt),
        subscriptionStatus: "expired"
      })
    };
  }

  if (status !== "active" && status !== "trialing") {
    return {
      status: 403,
      body: deniedPayload(product.slug, "subscription_required", {
        checkedAt: nowIso(checkedAt),
        subscriptionStatus: status || "inactive",
        fields: {
          plan: tierInfo.plan,
          tier: tierInfo.tier,
          tierName: tierInfo.tierName
        }
      })
    };
  }

  if (tierInfo.tier < product.minTier) {
    return {
      status: 403,
      body: deniedPayload(product.slug, "tier_too_low", {
        checkedAt: nowIso(checkedAt),
        subscriptionStatus: status,
        fields: {
          plan: tierInfo.plan,
          tier: tierInfo.tier,
          tierName: tierInfo.tierName
        }
      })
    };
  }

  if (product.requireGenerationBalance) {
    const remaining = Number(subscription?.generationsRemaining);
    const total = Number(subscription?.generationsTotal);
    if (Number.isFinite(total) && total > 0 && Number.isFinite(remaining) && remaining <= 0) {
      return {
        status: 403,
        body: {
          ...deniedPayload(product.slug, "usage_exhausted", {
            checkedAt: nowIso(checkedAt),
            subscriptionStatus: status
          }),
          allowed: false,
          entitled: false,
          error: "Generation limit reached",
          code: "USAGE_EXHAUSTED",
          plan: tierInfo.plan,
          tier: tierInfo.tier
        }
      };
    }
  }

  return {
    status: 200,
    body: allowedPayload(product.slug, subscription, tierInfo, checkedAt)
  };
}

function createEntitlementsRouter({
  requireAuth,
  loadSubscription,
  expressRouter
}) {
  const router = expressRouter;
  router.get("/:productSlug", requireAuth, async (req, res) => {
    try {
      const productSlug = String(req.params.productSlug || "").trim().toLowerCase();
      if (!PRODUCT_CONFIG[productSlug]) {
        return res.status(404).json({
          error: "Unknown product",
          code: "UNKNOWN_PRODUCT",
          product: productSlug
        });
      }

      const subscriptionResult = await loadSubscription(req);
      if (subscriptionResult?.error) {
        return res.status(subscriptionResult.status || 401).json(subscriptionResult.error);
      }

      const evaluated = evaluateProductEntitlement(
        productSlug,
        subscriptionResult?.subscription ?? {},
        {
          accountSuspended: Boolean(subscriptionResult?.accountSuspended),
          entitlementRevoked: Boolean(subscriptionResult?.revokedProducts?.includes?.(productSlug))
        }
      );
      return res.status(evaluated.status).json(evaluated.body);
    } catch (error) {
      return res.status(500).json({
        error: "Entitlement check failed",
        code: "BACKEND_UNAVAILABLE",
        message: String(error?.message || "unknown error")
      });
    }
  });

  router.post("/:productSlug/consume", requireAuth, async (req, res) => {
    const productSlug = String(req.params.productSlug || "").trim().toLowerCase();
    const product = PRODUCT_CONFIG[productSlug];
    if (!product) {
      return res.status(404).json({ error: "Unknown product", code: "UNKNOWN_PRODUCT" });
    }
    if (!product.usageBased) {
      return res.status(400).json({
        error: "This product does not consume generations",
        code: "USAGE_NOT_SUPPORTED",
        product: productSlug
      });
    }
    return res.status(501).json({
      error: "Consume is not implemented on this service",
      code: "NOT_IMPLEMENTED",
      product: productSlug
    });
  });

  return router;
}

module.exports = {
  PRODUCT_CONFIG,
  PLAN_TIERS,
  MAX_ENTITLEMENT_MS,
  evaluateProductEntitlement,
  createEntitlementsRouter,
  resolveTier,
  computeExpiresAt,
  normalizePlanKey
};
