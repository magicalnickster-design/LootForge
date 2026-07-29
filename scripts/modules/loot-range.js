import { LOOT_RANGE_FEET } from "./constants.js";
import { userOwnsActor } from "./ownership.js";

export function resolveLooterToken(user = game.user) {
  if (!canvas?.ready || !canvas.tokens) return null;

  const controlled = (canvas.tokens.controlled ?? []).filter((token) => {
    const actor = token?.actor;
    if (!actor) return false;
    if (user.isGM) return true;
    if (user.character?.id === actor.id) return true;
    return userOwnsActor(actor, user);
  });

  if (controlled.length === 1) return controlled[0];
  if (controlled.length > 1) {
    const preferred = controlled.find((token) => token.actor?.id === user.character?.id);
    if (preferred) return preferred;
    return controlled[0];
  }

  try {
    const active = user.character?.getActiveTokens?.(true)?.[0]
      ?? user.character?.getActiveTokens?.()?.[0]
      ?? null;
    if (active) return active;
  } catch {
    // ignore
  }

  return null;
}

function tokenCenter(token) {
  if (!token) return null;
  if (token.center && Number.isFinite(token.center.x) && Number.isFinite(token.center.y)) {
    return { x: token.center.x, y: token.center.y };
  }
  const doc = token.document ?? token;
  const width = Number(doc.width ?? 1);
  const height = Number(doc.height ?? 1);
  const size = Number(canvas?.grid?.size ?? 100);
  return {
    x: Number(doc.x ?? 0) + (width * size) / 2,
    y: Number(doc.y ?? 0) + (height * size) / 2
  };
}

function tokenHalfFeet(token) {
  const doc = token?.document ?? token;
  const width = Number(doc?.width ?? 1);
  const unit = Number(canvas?.scene?.grid?.distance ?? 5);
  return (width * unit) / 2;
}

export function measureTokenDistanceFeet(tokenA, tokenB) {
  const a = tokenCenter(tokenA);
  const b = tokenCenter(tokenB);
  if (!a || !b) return Infinity;

  let centerDist = NaN;
  try {
    if (typeof canvas?.grid?.measurePath === "function") {
      const measured = canvas.grid.measurePath([a, b]);
      centerDist = Number(measured?.distance);
    } else if (typeof canvas?.grid?.measureDistance === "function") {
      centerDist = Number(canvas.grid.measureDistance(a, b));
    }
  } catch {
    centerDist = NaN;
  }

  if (!Number.isFinite(centerDist)) {
    const size = Number(canvas?.grid?.size ?? 100);
    const unit = Number(canvas?.scene?.grid?.distance ?? 5);
    centerDist = (Math.hypot(a.x - b.x, a.y - b.y) / size) * unit;
  }

  // Edge-aware: standing next to a Large corpse should still count as in range.
  const edgeDist = Math.max(0, centerDist - tokenHalfFeet(tokenA) - tokenHalfFeet(tokenB));
  return edgeDist;
}

export function isWithinLootRange(looterToken, corpseToken, rangeFeet = LOOT_RANGE_FEET) {
  if (!looterToken || !corpseToken) return false;
  return measureTokenDistanceFeet(looterToken, corpseToken) <= Number(rangeFeet);
}

export function assertPlayerLootRange(corpseTokenOrDoc, {
  user = game.user,
  looterToken = null,
  rangeFeet = LOOT_RANGE_FEET
} = {}) {
  if (user?.isGM) return { ok: true, skipped: true };

  const corpseToken = corpseTokenOrDoc?.center
    ? corpseTokenOrDoc
    : canvas?.tokens?.placeables?.find?.((t) => t.document?.uuid === corpseTokenOrDoc?.uuid)
      ?? canvas?.tokens?.get?.(corpseTokenOrDoc?.id)
      ?? null;

  if (!corpseToken) {
    return {
      ok: false,
      error: game.i18n.format("LOOTFORGE.Notify.TooFarToLoot", { range: rangeFeet })
    };
  }

  const looter = looterToken ?? resolveLooterToken(user);
  if (!looter) {
    return {
      ok: false,
      error: game.i18n.localize("LOOTFORGE.Notify.NeedNearbyCharacter")
    };
  }

  const distance = measureTokenDistanceFeet(looter, corpseToken);
  if (distance > Number(rangeFeet)) {
    return {
      ok: false,
      distance,
      error: game.i18n.format("LOOTFORGE.Notify.TooFarToLoot", { range: rangeFeet })
    };
  }

  return { ok: true, distance, looterToken: looter };
}

export function findLooterTokenForActor(actor, user = game.user) {
  if (!actor || !canvas?.tokens) return resolveLooterToken(user);
  const owned = (canvas.tokens.placeables ?? []).filter((token) => token.actor?.id === actor.id);
  if (!owned.length) return resolveLooterToken(user);
  const controlled = owned.find((token) => token.controlled);
  return controlled ?? owned[0];
}
