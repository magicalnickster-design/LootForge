/**
 * PIXI loot-bag overlay above corpses with remaining loot.
 * Interactive for assigned owners + GM only. Does not require token ownership.
 */

import { LOOT_BAG_ICON, MODULE_ID } from "./constants.js";
import { log } from "./logger.js";
import { canUserAccessAssignedLoot } from "./ownership.js";
import { getSetting } from "./settings.js";
import {
  getCorpseState,
  hasRemainingLoot,
  isCorpseLooted,
  isLootGenerated
} from "./loot-storage.js";

/** @type {Map<string, PIXI.Container>} token id → overlay container */
const overlays = new Map();

let hooksRegistered = false;
let texturePromise = null;

/**
 * @returns {Promise<PIXI.Texture|null>}
 */
async function loadBagTexture() {
  if (!texturePromise) {
    texturePromise = (async () => {
      try {
        if (typeof foundry?.canvas?.loadTexture === "function") {
          return await foundry.canvas.loadTexture(LOOT_BAG_ICON);
        }
        if (typeof loadTexture === "function") {
          return await loadTexture(LOOT_BAG_ICON);
        }
        return PIXI.Texture.from(LOOT_BAG_ICON);
      } catch (err) {
        log.warn("Failed to load loot-bag texture", LOOT_BAG_ICON, err);
        return null;
      }
    })();
  }
  return texturePromise;
}

/**
 * Whether this client should render an interactive loot bag on the token.
 * @param {TokenDocument} tokenDoc
 */
export function shouldShowLootIndicator(tokenDoc) {
  if (!tokenDoc || !getSetting("showLootIndicators")) return false;
  if (!isLootGenerated(tokenDoc) || isCorpseLooted(tokenDoc) || !hasRemainingLoot(tokenDoc)) {
    return false;
  }

  const state = getCorpseState(tokenDoc);
  if (game.user.isGM) return true;
  // Unassigned: players never see the bag.
  if (!state.assignedActorId) return false;
  return canUserAccessAssignedLoot(state, game.user);
}

/**
 * Whether the bag should accept pointer events for this user.
 * @param {TokenDocument} tokenDoc
 */
export function canInteractWithLootIndicator(tokenDoc) {
  if (!shouldShowLootIndicator(tokenDoc)) return false;
  if (game.user.isGM) return true;
  return canUserAccessAssignedLoot(getCorpseState(tokenDoc), game.user);
}

/**
 * Legacy flag sync (HUD labels). Best-effort; players cannot update enemy tokens.
 * @param {TokenDocument} tokenDoc
 */
export async function syncLootIndicator(tokenDoc) {
  if (!tokenDoc) return;
  await refreshLootIndicators({ tokenDoc });
}

/**
 * @param {{ tokenDoc?: TokenDocument, tokenUuid?: string }} [scope]
 */
export async function refreshLootIndicators(scope = {}) {
  if (!canvas?.ready || !canvas.tokens) return;

  let tokens = canvas.tokens.placeables ?? [];
  if (scope.tokenDoc) {
    const id = scope.tokenDoc.id;
    tokens = tokens.filter((t) => t.document?.id === id || t.id === id);
  } else if (scope.tokenUuid) {
    tokens = tokens.filter((t) => t.document?.uuid === scope.tokenUuid);
  }

  for (const token of tokens) {
    await upsertOverlay(token);
  }

  // Drop overlays for tokens no longer present when doing a full refresh.
  if (!scope.tokenDoc && !scope.tokenUuid) {
    const live = new Set(tokens.map((t) => t.id));
    for (const [id, container] of overlays) {
      if (!live.has(id)) destroyOverlay(id, container);
    }
  }
}

/**
 * @param {Token} token
 */
async function upsertOverlay(token) {
  const tokenDoc = token?.document;
  if (!tokenDoc) return;

  const show = shouldShowLootIndicator(tokenDoc);
  const existing = overlays.get(token.id);

  if (!show) {
    if (existing) destroyOverlay(token.id, existing);
    return;
  }

  const texture = await loadBagTexture();
  if (!texture) return;

  let container = existing;
  if (!container) {
    container = new PIXI.Container();
    container.eventMode = "static";
    container.cursor = "pointer";
    container.zIndex = 1000;

    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.name = "lootforgeBag";
    container.addChild(sprite);

    container.on("pointerover", () => {
      if (!canInteractWithLootIndicator(token.document)) return;
      sprite.scale.set(1.18);
      sprite.alpha = 1;
      sprite.tint = 0xffe08a;
    });
    container.on("pointerout", () => {
      sprite.scale.set(1);
      sprite.alpha = 0.95;
      sprite.tint = 0xffffff;
    });
    container.on("pointerdown", (event) => {
      // Prevent token drag / measurement from eating the click.
      event.stopPropagation?.();
      event.data?.originalEvent?.stopPropagation?.();
    });
    container.on("pointertap", async (event) => {
      event.stopPropagation?.();
      await onBagClicked(token);
    });
    // Foundry / PIXI version variance: also listen for click.
    container.on("click", async (event) => {
      event.stopPropagation?.();
      await onBagClicked(token);
    });

    // Prefer attaching to the token container so it tracks movement.
    const parent = token;
    parent.addChild?.(container);
    overlays.set(token.id, container);
  }

  const sprite = container.children.find((c) => c.name === "lootforgeBag") ?? container.children[0];
  const size = Math.max(28, Math.min(40, (token.w ?? token.document.width * canvas.grid.size) * 0.45));
  if (sprite) {
    sprite.width = size;
    sprite.height = size;
    sprite.alpha = 0.95;
  }

  // Sit above the token.
  const h = token.h ?? token.document.height * canvas.grid.size;
  container.position.set((token.w ?? size) / 2, -Math.max(18, h * 0.15) - size * 0.35);
  container.visible = true;
  container.eventMode = canInteractWithLootIndicator(tokenDoc) ? "static" : "none";
  container.cursor = canInteractWithLootIndicator(tokenDoc) ? "pointer" : "default";
  container.alpha = canInteractWithLootIndicator(tokenDoc) ? 1 : 0.55;
}

/**
 * @param {Token} token
 */
async function onBagClicked(token) {
  const tokenDoc = token.document;
  if (!canInteractWithLootIndicator(tokenDoc)) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
    log.info("Loot bag click rejected", {
      reason: "not-assigned-owner",
      tokenUuid: tokenDoc.uuid,
      userId: game.user.id
    });
    return;
  }

  log.info("Loot bag clicked — opening player window", {
    tokenUuid: tokenDoc.uuid,
    userId: game.user.id
  });

  if (game.user.isGM) {
    const { openDmLootReview } = await import("../applications/dm-loot-review.js");
    const { openPlayerLootWindow } = await import("../applications/player-loot-window.js");
    const state = getCorpseState(tokenDoc);
    if (state.assignedActorId) await openPlayerLootWindow(tokenDoc);
    else await openDmLootReview(tokenDoc);
    return;
  }

  const { openPlayerLootWindow } = await import("../applications/player-loot-window.js");
  await openPlayerLootWindow(tokenDoc);
}

/**
 * @param {string} id
 * @param {PIXI.Container} container
 */
function destroyOverlay(id, container) {
  try {
    container.removeAllListeners?.();
    container.parent?.removeChild?.(container);
    container.destroy?.({ children: true });
  } catch (err) {
    log.debug("Overlay destroy error", err);
  }
  overlays.delete(id);
}

/**
 * Register canvas/token hooks for indicator refresh.
 */
export function registerLootIndicatorHooks() {
  if (hooksRegistered) return;
  hooksRegistered = true;

  Hooks.on("canvasReady", async () => {
    await refreshLootIndicators();
  });

  Hooks.on("updateToken", async (tokenDoc, changes) => {
    if (!changes.flags?.[MODULE_ID] && !changes.x && !changes.y && changes.width === undefined && changes.height === undefined) {
      // Still refresh on any update — corpse flags may nest differently.
    }
    await refreshLootIndicators({ tokenDoc });
  });

  Hooks.on("createToken", async (tokenDoc) => {
    await refreshLootIndicators({ tokenDoc });
  });

  Hooks.on("deleteToken", (tokenDoc) => {
    const token = canvas.tokens?.get(tokenDoc.id);
    const id = token?.id ?? tokenDoc.id;
    const container = overlays.get(id);
    if (container) destroyOverlay(id, container);
  });

  Hooks.on("controlToken", async () => {
    // No-op for visibility; kept for future selection-aware UX.
  });

  // After user reconnect / ready, canvas may already be up.
  Hooks.on("ready", async () => {
    if (canvas?.ready) await refreshLootIndicators();
  });

  log.debug("Loot indicator hooks registered");
}

/**
 * CSS class helper kept for API compatibility.
 * @param {Token} token
 */
export function applyTokenLootClass(token) {
  return shouldShowLootIndicator(token?.document);
}
