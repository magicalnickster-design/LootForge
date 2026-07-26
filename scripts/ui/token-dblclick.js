/**
 * Double-click a dead creature to loot (WoW-style).
 * Players do not need Token HUD / ownership of the enemy token.
 */

import { isCreatureDead } from "../modules/creature-context.js";
import { log } from "../modules/logger.js";
import { lootBody } from "../modules/loot-workflow.js";

let boundElement = null;
let boundHandler = null;

/**
 * @param {MouseEvent} event
 */
async function onBoardDoubleClick(event) {
  if (!canvas?.ready || !canvas.tokens) return;

  const token = canvas.tokens.hover
    ?? (canvas.tokens.controlled.length === 1 ? canvas.tokens.controlled[0] : null);
  if (!token?.document || !token.actor) return;
  if (!isCreatureDead(token.document, token.actor)) return;

  // Stop Foundry from opening the NPC sheet when possible.
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();

  log.info("Double-click loot", {
    tokenUuid: token.document.uuid,
    userId: game.user.id
  });

  await lootBody(token);
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
 * Register canvas double-click looting.
 */
export function registerTokenDoubleClickLoot() {
  Hooks.on("canvasReady", () => {
    bindBoardListener();
  });

  if (canvas?.ready) bindBoardListener();
  log.debug("Token double-click loot registered");
}
