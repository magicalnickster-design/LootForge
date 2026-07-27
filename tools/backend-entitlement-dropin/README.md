# LootForge entitlement drop-in

Mount on the Gambits Forge account API (gambitsforge.online):

```js
import express from "express";
import { createEntitlementsRouter, PRODUCT_CONFIG } from "./productEntitlements.js";

const router = express.Router();
createEntitlementsRouter({
  expressRouter: router,
  requireAuth: requireSessionAuth, // existing middleware
  loadSubscription: async (req) => ({
    subscription: await loadUserSubscription(req.user.id),
    accountSuspended: Boolean(req.user.suspended),
    revokedProducts: req.user.revokedProducts || []
  })
});

app.use("/api/entitlements", router);
```

Product slug: `lootforge` (min tier 1, no generation usage).
