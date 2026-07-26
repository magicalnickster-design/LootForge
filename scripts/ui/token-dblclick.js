/**
 * Double-click a lootable target (dead creature or Chest/Container).
 *
 * Players usually cannot hover/control unowned enemy tokens, so Foundry never
 * sets canvas.tokens.hover and Token#_onClickLeft2 is permission-gated by
 * _canView. We patch those permissions for lootable targets.
 *
 * Sheet access is preserved for:
 * - GMs (always open the actor sheet on double-click)
 * - Players who own the actor (including dead PCs)
 *
 * Loot only starts for unowned lootable NPCs/containers (player double-click).
 */

import { isLootableTarget } from "../modules/creature-context.js";
import { log } from "../modules/logger.js";
import { userOwnsActor } from "../modules/ownership.js";
import { lootBody } from "../modules/loot-workflow.js";

let patched = false;

/** @type {Map<string, number>} tokenUuid → last loot attempt ms */
const recentLootClicks = new Map();
const LOOT_CLICK_DEBOUNCE_MS = 900;

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

  matches.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  return matches.at(-1) ?? null;
}

/**
 * Should this dead token open the actor sheet instead of starting loot?
 * @param {Token} token
 * @returns {boolean}
 */
function shouldOpenSheetInsteadOfLoot(token) {
  // GMs always get the sheet — loot via HUD / Alt+L / scene control.
  if (game.user.isGM) return true;

  const actor = token?.actor;
  if (!actor) return false;

  // Dead PCs / owned actors: keep normal sheet access.
  if (actor.type === "character") return true;
  if (userOwnsActor(actor, game.user)) return true;
  try {
    if (typeof actor.testUserPermission === "function"
      && actor.testUserPermission(game.user, "OWNER")) {
      return true;
    }
  } catch {
    // ignore
  }
  if (game.user.character?.id === actor.id) return true;

  return false;
}

/**
 * @param {Token} token
 * @param {Event|null} [event]
 */
async function tryLootDeadToken(token, event = null) {
  if (!token?.document || !token.actor) return false;
  if (!isLootableTarget(token.document, token.actor)) return false;
  if (shouldOpenSheetInsteadOfLoot(token)) return false;

  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();

  const uuid = token.document.uuid;
  const now = Date.now();
  const last = recentLootClicks.get(uuid) ?? 0;
  if (now - last < LOOT_CLICK_DEBOUNCE_MS) {
    log.debug("Double-click loot debounced", { tokenUuid: uuid });
    return true;
  }
  recentLootClicks.set(uuid, now);

  log.info("Double-click loot", {
    tokenUuid: uuid,
    userId: game.user.id,
    isGM: game.user.isGM
  });

  await lootBody(token);
  return true;
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
        if (isLootableTarget(this.document, this.actor)) return true;
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
        if (isLootableTarget(this.document, this.actor)) return true;
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
        if (isLootableTarget(this.document, this.actor)) {
          if (shouldOpenSheetInsteadOfLoot(this)) {
            // GM / owned actor — normal Foundry sheet open.
            return proto._lootforgeOnClickLeft2.call(this, event);
          }
          // Unowned lootable NPC / container — loot instead of sheet.
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
    log.info("Token double-click loot ready", {
      userId: game.user.id,
      isGM: game.user.isGM
    });
  });

  log.debug("Token double-click loot registered");
}
