# LootForge entitlement drop-in (account API)

Production blocker: `GET https://gambitsforge.online/api/entitlements/lootforge` currently returns Express `404 Cannot GET`.

SceneForgeAI already works at `GET /api/entitlements/sceneforge-ai`. Mount this drop-in on the **same Gambits Forge account API** using that route's auth middleware, access-token validation, user lookup, subscription lookup, suspension checks, and error JSON format.

## Files

- `productEntitlements.cjs` — product config + evaluator + router factory
- `product-entitlements.test.cjs` — required entitlement cases

## Product config

| Field | Value |
| --- | --- |
| slug | `lootforge` |
| minTier | `1` |
| usageBased | `false` |
| requireGenerationBalance | `false` |
| max entitlement cache | 30 days (server time) |

## Mount (do not replace SceneForgeAI consume/complete/refund)

```js
const express = require("express");
const {
  createEntitlementsRouter,
  PRODUCT_CONFIG,
  evaluateProductEntitlement
} = require("./productEntitlements.cjs");

// Prefer extending the existing entitlements router if one already exists.
const router = express.Router();
createEntitlementsRouter({
  expressRouter: router,
  requireAuth: requireSessionAuth, // SAME middleware as sceneforge-ai
  loadSubscription: async (req) => ({
    subscription: await loadUserSubscription(req.user.id),
    accountSuspended: Boolean(req.user.suspended),
    revokedProducts: req.user.revokedProducts || [],
    adminOverride: Boolean(req.user.adminOverride),
    temporaryEntitlement: Boolean(req.user.temporaryEntitlement)
  })
});

app.use("/api/entitlements", router);
```

If SceneForgeAI is registered as a **hardcoded** route rather than `/:product`, add:

```js
app.get("/api/entitlements/lootforge", requireSessionAuth, async (req, res) => {
  const subscription = await loadUserSubscription(req.user.id);
  const evaluated = evaluateProductEntitlement("lootforge", subscription, {
    accountSuspended: Boolean(req.user.suspended),
    entitlementRevoked: Boolean(req.user.revokedProducts?.includes?.("lootforge"))
  });
  return res.status(evaluated.status).json(evaluated.body);
});
```

## Success body (LootForge v0.6.x)

```json
{
  "product": "lootforge",
  "allowed": true,
  "entitled": true,
  "plan": "adventurer",
  "tier": 1,
  "tierName": "Adventurer",
  "subscriptionStatus": "active",
  "expiresAt": "2026-08-26T12:00:00.000Z",
  "checkedAt": "2026-07-27T12:00:00.000Z"
}
```

## Denied body

```json
{
  "product": "lootforge",
  "allowed": false,
  "entitled": false,
  "reason": "subscription_required",
  "subscriptionStatus": "inactive",
  "checkedAt": "2026-07-27T12:00:00.000Z"
}
```

Reasons: `unauthenticated` (via auth middleware), `subscription_required`, `subscription_expired`, `tier_too_low`, `account_suspended`, `entitlement_revoked`.

## Rules

- Tier 1+ only (Adventurer / Dungeon Master / Founder)
- Never check or consume SceneForgeAI generation balances
- `expiresAt` = min(subscription period end, now+30d)
- Approved admin / temporary overrides unlock when present
- No DB migrations required for this drop-in

## Verify after deploy

```bash
# Expect 401 JSON (not HTML 404)
curl -sS -i https://gambitsforge.online/api/entitlements/lootforge | head

# With a real access token
node tools/verify-lootforge-entitlement.mjs --token "$ACCESS_TOKEN"
```

## Local tests

```bash
npm run test:entitlements
```
