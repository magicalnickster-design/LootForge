/**
 * Token HUD — Generate / View Loot button on defeated tokens.
 */

import { isCreatureDead } from "../modules/creature-context.js";
import {
  hasRemainingLoot,
  isCorpseLooted,
  isLootGenerated
} from "../modules/loot-storage.js";
import { getLootActionLabelKey, lootBody } from "../modules/loot-workflow.js";

function toElement(html) {
  if (!html) return null;
  if (html instanceof HTMLElement) return html;
  if (html[0] instanceof HTMLElement) return html[0];
  return null;
}

export function registerTokenHud() {
  Hooks.on("renderTokenHUD", (hud, html) => {
    const token = hud.object;
    const tokenDoc = token?.document;
    if (!tokenDoc?.actor) return;
    if (!isCreatureDead(tokenDoc, token.actor)) return;

    const root = toElement(html);
    const column = root?.querySelector(".col.left");
    if (!column) {
      console.warn("LootForge | Token HUD left column not found; button skipped.");
      return;
    }

    const looted = isCorpseLooted(tokenDoc) && !hasRemainingLoot(tokenDoc);
    const hasLoot = isLootGenerated(tokenDoc) && hasRemainingLoot(tokenDoc);

    const button = document.createElement("div");
    button.classList.add("control-icon", "lootforge-loot-body");
    if (looted) button.classList.add("is-looted");
    if (hasLoot) button.classList.add("has-loot");
    button.dataset.tooltip = game.i18n.localize(getLootActionLabelKey(tokenDoc));
    button.setAttribute("aria-label", button.dataset.tooltip);
    button.innerHTML = `<i class="fa-solid fa-sack"></i>`;

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await lootBody(token);
      if (hud.rendered) hud.render();
    });

    column.appendChild(button);
  });
}
