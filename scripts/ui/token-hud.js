/**
 * Token HUD integration — Loot Body button on defeated tokens.
 *
 * Foundry v13 passes a native HTMLElement as `html` to renderTokenHUD.
 */

import { isDefeated } from "../services/creature-classifier.js";
import { isLooted } from "../services/loot-flags.js";
import { lootBody } from "../services/loot-workflow.js";

/**
 * Normalize the html argument across jQuery (older) and HTMLElement (v13+).
 * @param {HTMLElement|JQuery} html
 * @returns {HTMLElement|null}
 */
function toElement(html) {
  if (!html) return null;
  if (html instanceof HTMLElement) return html;
  if (html[0] instanceof HTMLElement) return html[0];
  return null;
}

/**
 * Register the Token HUD button hook.
 */
export function registerTokenHud() {
  Hooks.on("renderTokenHUD", (hud, html) => {
    const token = hud.object;
    const tokenDoc = token?.document;
    if (!tokenDoc?.actor) return;

    // Only show for defeated creatures to keep the HUD tidy.
    if (!isDefeated(tokenDoc)) return;

    const root = toElement(html);
    const column = root?.querySelector(".col.left");
    if (!column) {
      console.warn("LootForge | Token HUD left column not found; Loot Body button skipped.");
      return;
    }

    const looted = isLooted(tokenDoc);
    const button = document.createElement("div");
    button.classList.add("control-icon", "lootforge-loot-body");
    if (looted) button.classList.add("is-looted");
    button.dataset.tooltip = looted
      ? game.i18n.localize("LOOTFORGE.HUD.ResetLoot")
      : game.i18n.localize("LOOTFORGE.HUD.LootBody");
    button.setAttribute("aria-label", button.dataset.tooltip);
    button.innerHTML = `<i class="fa-solid fa-sack"></i>`;

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await lootBody(token);
      // Refresh HUD so the looted state/icon updates after the workflow.
      if (hud.rendered) hud.render();
    });

    column.appendChild(button);
  });
}
