/**
 * Double-click a dead creature to loot (WoW-style).
 *
 * Players usually cannot hover/control unowned enemy tokens, so Foundry never
 * sets canvas.tokens.hover and Token#_onClickLeft2 is permission-gated by
 * _canView. We patch those permissions for dead creatures and also hit-test
 * the pointer position on board double-click as a fallback.
 */

import { isCreatureDead } from "../modules/creature-context.js";
import { log } from "../modules/logger.js";
import { lootBody } from "../modules/loot-workflow.js";

let boundElement = null;
let boundHandler = null;
let patched = false;

/**
 * @returns {typeof Token|null}
 */
function getTokenClass() {
  return CONFIG?.Token?.objectClass
    ?? foundry?.canvas?.placeables?.Token
    ?? globalThis.Token
    ?? null;
}

/**
 * Canvas coords for a DOM or PIXI-backed event.
 * @param {Event|PIXI.FederatedEvent|null} [event]
 * @returns {{ x: number, y: number }|null}
 */
function getCanvasPoint(event) {
  if (canvas?.mousePosition && Number.isFinite(canvas.mousePosition.x)) {
    return { x: canvas.mousePosition.x, y: canvas.mousePosition.y };
  }

  const orig = event?.originalEvent ?? event;
  const clientX = orig?.clientX ?? event?.clientX;
  const clientY = orig?.clientY ?? event?.clientY;
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY) || !canvas?.canvasCoordinatesFromClient) {
    return null;
  }
  try {
    return canvas.canvasCoordinatesFromClient({ x: clientX, y: clientY });
  } catch {
    return null;
  }
}

/**
 * Find a visible token under the pointer — works without ownership/hover.
 * @param {Event|null} [event]
 * @returns {Token|null}
 */
export function resolveTokenUnderPointer(event = null) {
  if (!canvas?.ready || !canvas.tokens) return null;

  if (canvas.tokens.hover?.actor) return canvas.tokens.hover;

  const point = getCanvasPoint(event);
  if (!point) {
    if (canvas.tokens.controlled.length === 1) return canvas.tokens.controlled[0];
    return null;
  }

  const matches = canvas.tokens.placeables.filter((token) => {
    if (!token?.document || !token.actor) return false;
    // Prefer visible tokens; still allow hit-test if mesh exists.
    if (token.visible === false) return false;
    try {
      if (typeof token.bounds?.contains === "function") {
        return token.bounds.contains(point.x, point.y);
      }
      const x = token.center?.x ?? token.x;
      const y = token.center?.y ?? token.y;
      const w = token.w ?? (token.document.width * canvas.grid.size);
      const h = token.h ?? (token.document.height * canvas.grid.size);
      return point.x >= x - w / 2 && point.x <= x + w / 2
        && point.y >= y - h / 2 && point.y <= y + h / 2;
    } catch {
      return false;
    }
  });

  if (!matches.length) {
    if (canvas.tokens.controlled.length === 1) return canvas.tokens.controlled[0];
    return null;
  }

  // Top-most token wins.
  matches.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  return matches.at(-1) ?? null;
}

/**
 * @param {Token} token
 * @param {Event|null} [event]
 */
async function tryLootDeadToken(token, event = null) {
  if (!token?.document || !token.actor) return false;
  if (!isCreatureDead(token.document, token.actor)) return false;

  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();

  log.info("Double-click loot", {
    tokenUuid: token.document.uuid,
    userId: game.user.id,
    isGM: game.user.isGM
  });

  await lootBody(token);
  return true;
}

/**
 * @param {MouseEvent} event
 */
async function onBoardDoubleClick(event) {
  if (!canvas?.ready || !canvas.tokens) return;
  const token = resolveTokenUnderPointer(event);
  if (!token) {
    log.debug("Double-click: no token under pointer");
    return;
  }
  await tryLootDeadToken(token, event);
}

function bindBoardListener() {
  const el = document.getElementById("board")
    ?? canvas?.app?.canvas?.parentElement
    ?? canvas?.app?.view?.parentElement
    ?? null;
  if (!el) return;

  if (boundElement && boundHandler) {
    boundElement.removeEventListener("dblclick", boundHandler, true);
  }

  boundElement = el;
  boundHandler = onBoardDoubleClick;
  boundElement.addEventListener("dblclick", boundHandler, true);
}

/**
 * Patch Foundry Token interaction so players can double-click dead enemy tokens.
 * Unowned NPCs normally fail _canView, so clickLeft2 never fires for players.
 */
function patchTokenDoubleClick() {
  if (patched) return;
  const TokenClass = getTokenClass();
  if (!TokenClass?.prototype) {
    log.warn("Token class unavailable — Foundry double-click patch skipped");
    return;
  }

  const proto = TokenClass.prototype;

  if (!proto._lootforgeCanView) {
    proto._lootforgeCanView = proto._canView;
    proto._canView = function lootforgeCanView(user, event) {
      try {
        if (isCreatureDead(this.document, this.actor)) return true;
      } catch {
        // fall through
      }
      return proto._lootforgeCanView.call(this, user, event);
    };
  }

  if (!proto._lootforgeCanHover) {
    proto._lootforgeCanHover = proto._canHover;
    proto._canHover = function lootforgeCanHover(user, event) {
      try {
        if (isCreatureDead(this.document, this.actor)) return true;
      } catch {
        // fall through
      }
      return proto._lootforgeCanHover.call(this, user, event);
    };
  }

  if (!proto._lootforgeOnClickLeft2) {
    proto._lootforgeOnClickLeft2 = proto._onClickLeft2;
    proto._onClickLeft2 = function lootforgeOnClickLeft2(event) {
      try {
        if (isCreatureDead(this.document, this.actor)) {
          // Prevent the actor sheet from opening for players.
          event?.stopPropagation?.();
          void tryLootDeadToken(this, event);
          return;
        }
      } catch (err) {
        log.error("Token double-click loot failed", err);
      }
      return proto._lootforgeOnClickLeft2.call(this, event);
    };
  }

  patched = true;
  log.info("Patched Token double-click for dead-creature looting");
}

/**
 * Register canvas double-click looting.
 */
export function registerTokenDoubleClickLoot() {
  patchTokenDoubleClick();

  Hooks.on("canvasReady", () => {
    patchTokenDoubleClick();
    bindBoardListener();
    log.info("Token double-click loot ready", {
      userId: game.user.id,
      isGM: game.user.isGM
    });
  });

  if (canvas?.ready) bindBoardListener();
  log.debug("Token double-click loot registered");
}
