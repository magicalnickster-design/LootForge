/**
 * WoW-style loot sparkles around corpses with remaining loot.
 * Small white pixel stars twinkle around the body; cleared when empty.
 * Fully looted corpses are hidden from the canvas (GM-authoritative).
 */

import { MODULE_ID } from "./constants.js";
import { isCreatureDead } from "./creature-context.js";
import { log } from "./logger.js";
import { canUserAccessAssignedLoot, canUserLootCorpse } from "./ownership.js";
import { getSetting } from "./settings.js";
import {
  getCorpseState,
  hasRemainingLoot,
  isLootSessionLocked
} from "./loot-storage.js";

/** @type {Map<string, PIXI.Container>} token id → overlay container */
const overlays = new Map();

/** @type {Map<string, Function>} token id → ticker callback */
const tickers = new Map();

let hooksRegistered = false;
let starTexture = null;

const STAR_COUNT = 10;

/**
 * Tiny white cross/star texture (canvas-generated — Pixi 7/8 safe).
 * @returns {PIXI.Texture}
 */
function getStarTexture() {
  if (starTexture) return starTexture;

  const size = 16;
  const canvasEl = document.createElement("canvas");
  canvasEl.width = size;
  canvasEl.height = size;
  const ctx = canvasEl.getContext("2d");

  // Soft glow
  const glow = ctx.createRadialGradient(8, 8, 0, 8, 8, 7);
  glow.addColorStop(0, "rgba(255,255,255,0.95)");
  glow.addColorStop(0.35, "rgba(255,255,240,0.55)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Pixel cross (WoW-like sparkle)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(7, 1, 2, 14);
  ctx.fillRect(1, 7, 14, 2);
  // Center diamond nub
  ctx.fillRect(6, 6, 4, 4);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(5, 7, 1, 2);
  ctx.fillRect(10, 7, 1, 2);
  ctx.fillRect(7, 5, 2, 1);
  ctx.fillRect(7, 10, 2, 1);

  starTexture = PIXI.Texture.from(canvasEl);
  return starTexture;
}

/**
 * Whether this client should render loot sparkles on the token.
 * Only dead corpses with remaining loot — never living player characters.
 * @param {TokenDocument} tokenDoc
 */
export function shouldShowLootIndicator(tokenDoc) {
  if (!tokenDoc || !getSetting("showLootIndicators")) return false;
  if (!isCreatureDead(tokenDoc, tokenDoc.actor)) return false;
  if (!hasRemainingLoot(tokenDoc)) return false;

  const state = getCorpseState(tokenDoc);
  if (game.user.isGM) return true;

  if (getSetting("allowAllPlayersToLoot")) return true;
  if (state.activeLooterUserId === game.user.id) return true;
  if (canUserAccessAssignedLoot(state, game.user)) return true;
  return canUserLootCorpse(tokenDoc, game.user);
}

/**
 * Whether sparkles should accept pointer events for this user.
 * @param {TokenDocument} tokenDoc
 */
export function canInteractWithLootIndicator(tokenDoc) {
  if (!shouldShowLootIndicator(tokenDoc)) return false;
  if (game.user.isGM) return true;
  const state = getCorpseState(tokenDoc);
  if (isLootSessionLocked(state) && state.activeLooterUserId !== game.user.id) {
    return false;
  }
  return canUserLootCorpse(tokenDoc, game.user);
}

/**
 * Hide fully-looted corpses; restore visibility if LootForge previously hid them.
 * GM-only — players cannot update enemy tokens.
 * @param {TokenDocument} tokenDoc
 */
export async function syncLootedCorpseVisibility(tokenDoc) {
  if (!game.user.isGM || !tokenDoc) return;

  const state = getCorpseState(tokenDoc);
  const wasCorpse = Boolean(state.generated || state.looted)
    || isCreatureDead(tokenDoc, tokenDoc.actor);
  const fullyLooted = wasCorpse
    && Boolean(state.generated || state.looted)
    && !hasRemainingLoot(tokenDoc);
  const flagged = Boolean(tokenDoc.getFlag(MODULE_ID, "hiddenByLootForge"));

  try {
    if (fullyLooted) {
      if (!tokenDoc.hidden || !flagged) {
        await tokenDoc.update({
          hidden: true,
          [`flags.${MODULE_ID}.hiddenByLootForge`]: true
        });
        log.info("Hid fully looted corpse", tokenDoc.uuid);
      }
    } else if (flagged) {
      await tokenDoc.update({
        hidden: false,
        [`flags.${MODULE_ID}.hiddenByLootForge`]: false
      });
      log.info("Restored visibility for reset corpse", tokenDoc.uuid);
    }
  } catch (err) {
    log.warn("Failed to sync corpse visibility", err);
  }
}

/**
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

  if (!scope.tokenDoc && !scope.tokenUuid) {
    const live = new Set(tokens.map((t) => t.id));
    for (const [id, container] of overlays) {
      if (!live.has(id)) destroyOverlay(id, container);
    }
  }
}

/**
 * @param {Token} token
 * @param {PIXI.Container} container
 */
function layoutSparkles(token, container) {
  const w = token.w ?? token.document.width * canvas.grid.size;
  const h = token.h ?? token.document.height * canvas.grid.size;
  const stars = container.children.filter((c) => c.name?.startsWith("lootforgeSparkle"));

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    // Scatter around the token silhouette (ellipse ring).
    const angle = (i / stars.length) * Math.PI * 2 + (i % 3) * 0.35;
    const rx = w * (0.28 + (i % 4) * 0.08);
    const ry = h * (0.22 + (i % 3) * 0.1);
    const ox = Math.cos(angle) * rx;
    const oy = Math.sin(angle) * ry - h * 0.05;
    const base = 0.55 + (i % 5) * 0.12;

    star._lfOx = ox;
    star._lfOy = oy;
    star._lfPhase = i * 0.9;
    star._lfSpeed = 1.1 + (i % 4) * 0.35;
    star._lfBaseScale = base;
    star.anchor?.set?.(0.5);
    star.position.set(ox, oy);
    star.scale.set(base);
    star.alpha = 0.85;
    star.tint = i % 2 === 0 ? 0xffffff : 0xfff6d0;
  }

  // Invisible hit target covering the token so sparkles remain clickable.
  let hit = container.children.find((c) => c.name === "lootforgeHit");
  if (!hit) {
    hit = new PIXI.Graphics();
    hit.name = "lootforgeHit";
    hit.eventMode = "static";
    container.addChildAt(hit, 0);
  }
  hit.clear?.();
  if (typeof hit.beginFill === "function") {
    hit.beginFill(0xffffff, 0.001);
    hit.drawEllipse(0, 0, w * 0.55, h * 0.55);
    hit.endFill();
  } else if (typeof hit.ellipse === "function") {
    hit.ellipse(0, 0, w * 0.55, h * 0.55).fill({ color: 0xffffff, alpha: 0.001 });
  } else {
    hit.hitArea = new PIXI.Ellipse(0, 0, w * 0.55, h * 0.55);
  }

  container.position.set(w / 2, h / 2);
}

/**
 * @param {string} tokenId
 * @param {PIXI.Container} container
 */
function startSparkleAnimation(tokenId, container) {
  stopSparkleAnimation(tokenId);

  const ticker = PIXI?.Ticker?.shared;
  if (!ticker?.add) return;

  let elapsed = 0;
  const tick = (tickerDelta) => {
    // Pixi 7 passes delta time; Pixi 8 may pass ticker instance.
    const delta = typeof tickerDelta === "number"
      ? tickerDelta
      : (tickerDelta?.deltaTime ?? 1);
    elapsed += delta * 0.08;
    for (const child of container.children) {
      if (!child.name?.startsWith("lootforgeSparkle")) continue;
      const phase = child._lfPhase ?? 0;
      const speed = child._lfSpeed ?? 1.2;
      const base = child._lfBaseScale ?? 1;
      const twinkle = 0.5 + 0.5 * Math.sin(elapsed * speed + phase);
      child.alpha = 0.25 + 0.75 * twinkle;
      child.scale.set(base * (0.75 + 0.45 * twinkle));
      child.x = (child._lfOx ?? 0) + Math.sin(elapsed * 0.65 + phase) * 2.5;
      child.y = (child._lfOy ?? 0) + Math.cos(elapsed * 0.85 + phase) * 2.5;
    }
  };

  ticker.add(tick);
  tickers.set(tokenId, tick);
}

/**
 * @param {string} tokenId
 */
function stopSparkleAnimation(tokenId) {
  const tick = tickers.get(tokenId);
  if (!tick) return;
  try {
    PIXI?.Ticker?.shared?.remove?.(tick);
  } catch {
    // ignore
  }
  tickers.delete(tokenId);
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

  const texture = getStarTexture();
  let container = existing;

  if (!container) {
    container = new PIXI.Container();
    container.eventMode = "static";
    container.cursor = "pointer";
    container.zIndex = 1000;
    container.sortableChildren = true;

    for (let i = 0; i < STAR_COUNT; i++) {
      const star = new PIXI.Sprite(texture);
      star.name = `lootforgeSparkle${i}`;
      star.anchor.set(0.5);
      star.eventMode = "none";
      container.addChild(star);
    }

    container.on("pointerdown", (event) => {
      event.stopPropagation?.();
      event.data?.originalEvent?.stopPropagation?.();
    });
    container.on("pointertap", async (event) => {
      event.stopPropagation?.();
      await onSparkleClicked(token);
    });
    container.on("click", async (event) => {
      event.stopPropagation?.();
      await onSparkleClicked(token);
    });

    token.addChild?.(container);
    overlays.set(token.id, container);
    startSparkleAnimation(token.id, container);
  }

  layoutSparkles(token, container);
  container.visible = true;
  const interactive = canInteractWithLootIndicator(tokenDoc);
  container.eventMode = interactive ? "static" : "none";
  container.cursor = interactive ? "pointer" : "default";
  container.alpha = interactive ? 1 : 0.65;

  if (!tickers.has(token.id)) {
    startSparkleAnimation(token.id, container);
  }
}

/**
 * @param {Token} token
 */
async function onSparkleClicked(token) {
  const tokenDoc = token.document;
  if (!canInteractWithLootIndicator(tokenDoc)) {
    const state = getCorpseState(tokenDoc);
    if (isLootSessionLocked(state) && state.activeLooterUserId !== game.user.id) {
      const name = state.activeLooterName
        || game.users.get(state.activeLooterUserId)?.name
        || "Another player";
      ui.notifications.warn(game.i18n.format("LOOTFORGE.Notify.LootBusy", { name }));
    } else {
      ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
    }
    return;
  }

  log.info("Loot sparkles clicked", {
    tokenUuid: tokenDoc.uuid,
    userId: game.user.id
  });

  const { lootBody } = await import("./loot-workflow.js");
  await lootBody(token);
}

/**
 * @param {string} id
 * @param {PIXI.Container} container
 */
function destroyOverlay(id, container) {
  stopSparkleAnimation(id);
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

  Hooks.on("updateToken", async (tokenDoc) => {
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

  Hooks.on("ready", async () => {
    if (canvas?.ready) await refreshLootIndicators();
  });

  log.debug("Loot sparkle hooks registered");
}

/**
 * CSS class helper kept for API compatibility.
 * @param {Token} token
 */
export function applyTokenLootClass(token) {
  return shouldShowLootIndicator(token?.document);
}
