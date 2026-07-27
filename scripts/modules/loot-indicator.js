import { MODULE_ID } from "./constants.js";
import { isLootableTarget } from "./creature-context.js";
import { log } from "./logger.js";
import { getSetting } from "./settings.js";
import {
  getCorpseState,
  hasRemainingLoot,
  isCorpseLooted,
  isLootGenerated
} from "./loot-storage.js";

const overlays = new Map();

const tickers = new Map();

let hooksRegistered = false;
let starTexture = null;

const STAR_COUNT = 10;

function getStarTexture() {
  if (starTexture) return starTexture;

  const size = 16;
  const canvasEl = document.createElement("canvas");
  canvasEl.width = size;
  canvasEl.height = size;
  const ctx = canvasEl.getContext("2d");

  const glow = ctx.createRadialGradient(8, 8, 0, 8, 8, 7);
  glow.addColorStop(0, "rgba(255,255,255,0.95)");
  glow.addColorStop(0.35, "rgba(255,255,240,0.55)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(7, 1, 2, 14);
  ctx.fillRect(1, 7, 14, 2);
  ctx.fillRect(6, 6, 4, 4);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(5, 7, 1, 2);
  ctx.fillRect(10, 7, 1, 2);
  ctx.fillRect(7, 5, 2, 1);
  ctx.fillRect(7, 10, 2, 1);

  starTexture = PIXI.Texture.from(canvasEl);
  return starTexture;
}

export function shouldShowLootIndicator(tokenDoc) {
  if (!tokenDoc || !getSetting("showLootIndicators")) return false;
  if (!isLootableTarget(tokenDoc, tokenDoc.actor)) return false;
  if (isCorpseLooted(tokenDoc) && !hasRemainingLoot(tokenDoc)) return false;
  const state = getCorpseState(tokenDoc);
  if (state.looted && !hasRemainingLoot(tokenDoc)) return false;
  return true;
}

export function canInteractWithLootIndicator(tokenDoc) {
  return false;
}

export async function syncLootedCorpseVisibility(tokenDoc) {
  if (!game.user.isGM || !tokenDoc) return;

  const state = getCorpseState(tokenDoc);
  const wasCorpse = Boolean(state.generated || state.looted)
    || isLootableTarget(tokenDoc, tokenDoc.actor);
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

export async function syncLootIndicator(tokenDoc) {
  if (!tokenDoc) return;
  await refreshLootIndicators({ tokenDoc });
}

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

function layoutSparkles(token, container) {
  const w = token.w ?? token.document.width * canvas.grid.size;
  const h = token.h ?? token.document.height * canvas.grid.size;
  const stars = container.children.filter((c) => c.name?.startsWith("lootforgeSparkle"));

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
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

  const hit = container.children.find((c) => c.name === "lootforgeHit");
  if (hit) {
    container.removeChild(hit);
    hit.destroy?.();
  }

  container.position.set(w / 2, h / 2);
}

function startSparkleAnimation(tokenId, container) {
  stopSparkleAnimation(tokenId);

  const ticker = PIXI?.Ticker?.shared;
  if (!ticker?.add) return;

  let elapsed = 0;
  const tick = (tickerDelta) => {
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
    container.eventMode = "none";
    container.cursor = "default";
    container.zIndex = 1000;
    container.sortableChildren = true;
    container.interactiveChildren = false;

    for (let i = 0; i < STAR_COUNT; i++) {
      const star = new PIXI.Sprite(texture);
      star.name = `lootforgeSparkle${i}`;
      star.anchor.set(0.5);
      star.eventMode = "none";
      container.addChild(star);
    }

    token.addChild?.(container);
    overlays.set(token.id, container);
    startSparkleAnimation(token.id, container);
  }

  layoutSparkles(token, container);
  container.visible = true;
  container.eventMode = "none";
  container.interactiveChildren = false;
  container.cursor = "default";
  container.alpha = 1;

  if (!tickers.has(token.id)) {
    startSparkleAnimation(token.id, container);
  }
}

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

async function refreshIndicatorsForActor(actor) {
  if (!actor || !canvas?.ready || !canvas.tokens) return;
  const tokens = canvas.tokens.placeables.filter((t) => t.actor?.id === actor.id);
  for (const token of tokens) {
    await upsertOverlay(token);
  }
}

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

  Hooks.on("updateActor", async (actor, changes) => {
    const hp = changes?.system?.attributes?.hp;
    if (hp === undefined && !changes?.system?.attributes) return;
    await refreshIndicatorsForActor(actor);
  });

  Hooks.on("createActiveEffect", async (effect) => {
    const label = String(effect.name ?? effect.id ?? "");
    const statuses = effect.statuses;
    const isDead = effect.id === "dead"
      || (typeof statuses?.has === "function" && statuses.has("dead"))
      || (Array.isArray(statuses) && statuses.includes("dead"))
      || /dead|defeated/i.test(label);
    if (!isDead) return;
    const actor = effect.parent?.documentName === "Actor"
      ? effect.parent
      : effect.parent?.actor ?? null;
    if (actor) await refreshIndicatorsForActor(actor);
  });

  Hooks.on("deleteActiveEffect", async (effect) => {
    const label = String(effect.name ?? effect.id ?? "");
    if (!/dead|defeated/i.test(label) && effect.id !== "dead") return;
    const actor = effect.parent?.documentName === "Actor"
      ? effect.parent
      : effect.parent?.actor ?? null;
    if (actor) await refreshIndicatorsForActor(actor);
  });

  Hooks.on("ready", async () => {
    if (canvas?.ready) await refreshLootIndicators();
  });

  log.debug("Loot sparkle hooks registered");
}

export function applyTokenLootClass(token) {
  return shouldShowLootIndicator(token?.document);
}
