/**
 * Lightweight chat helpers. Investigation is auto-rolled by the player —
 * no Roll Investigation chat button.
 */

import { MODULE_ID } from "./constants.js";
import { log } from "./logger.js";
import { updateCorpseState } from "./loot-storage.js";

let registered = false;

/**
 * @param {HTMLElement|JQuery} html
 * @returns {HTMLElement|null}
 */
function asElement(html) {
  if (!html) return null;
  if (html instanceof HTMLElement) return html;
  if (html[0] instanceof HTMLElement) return html[0];
  return null;
}

/**
 * GM: player finished Investigation — generate loot and open DM Review.
 * @param {object} payload
 */
export async function handleInvestigationReady(payload) {
  if (!game.user.isGM) return;

  const activeGms = game.users.filter((u) => u.isGM && u.active);
  const elected = game.users.activeGM ?? activeGms[0] ?? null;
  if (elected && elected.id !== game.user.id) {
    log.info("Non-elected GM ignoring Investigation ready", {
      electedId: elected.id,
      localUserId: game.user.id
    });
    return;
  }

  const tokenDoc = await fromUuid(payload.tokenUuid);
  const actor = game.actors.get(payload.actorId);
  const user = game.users.get(payload.fromUserId);
  if (!tokenDoc || !actor) {
    log.warn("Investigation ready missing token/actor", payload);
    return;
  }

  const roll = {
    total: Number(payload.investigationTotal),
    natural: Number(payload.naturalDie ?? 0),
    isNatural20: Boolean(payload.isNatural20)
  };
  if (!Number.isFinite(roll.total)) {
    log.warn("Investigation ready missing total", payload);
    return;
  }

  log.info("Player Investigation ready — generating loot + opening DM Review", {
    tokenUuid: tokenDoc.uuid,
    actorId: actor.id,
    total: roll.total,
    player: user?.name
  });

  try {
    await updateCorpseState(tokenDoc, {
      pendingInvestigation: {
        ...roll,
        actorId: actor.id,
        userId: user?.id ?? payload.fromUserId,
        at: Date.now()
      },
      pendingLooterActorId: actor.id,
      pendingLooterUserId: user?.id ?? payload.fromUserId ?? null
    });
  } catch (err) {
    log.error("Failed to store pending Investigation on corpse", err);
  }

  const { generateLootForCorpse } = await import("./loot-workflow.js");
  const token = tokenDoc.object ?? canvas.tokens?.get(tokenDoc.id);
  const generated = await generateLootForCorpse(
    token ?? { document: tokenDoc, actor: tokenDoc.actor },
    tokenDoc,
    tokenDoc.actor,
    {
      roller: actor,
      openReview: true,
      investigationRoll: roll,
      preferRemotePlayer: false,
      pendingLooterUserId: user?.id ?? null
    }
  );

  if (!generated) {
    ui.notifications.error(game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  ui.notifications.info(
    game.i18n.format("LOOTFORGE.Notify.PlayerGeneratedLoot", {
      player: user?.name ?? actor.name,
      name: tokenDoc.name,
      total: roll.total
    })
  );
}

/**
 * Bind any leftover Generate Loot chat buttons (legacy messages).
 * @param {ChatMessage} message
 * @param {HTMLElement|JQuery} html
 */
function bindChatCardButtons(message, html) {
  const root = asElement(html);
  if (!root) return;
  if (!message?.flags?.[MODULE_ID]?.card) return;

  root.querySelectorAll?.('[data-lootforge-action="generate-loot"]').forEach((button) => {
    if (button.dataset.lootforgeBound === "1") return;
    button.dataset.lootforgeBound = "1";
    if (!game.user.isGM) {
      button.style.display = "none";
      return;
    }
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      const { generateLootForCorpse } = await import("./loot-workflow.js");
      const tokenDoc = await fromUuid(button.dataset.tokenUuid);
      if (!tokenDoc) return;
      const actor = game.actors.get(button.dataset.actorId);
      const token = tokenDoc.object ?? canvas.tokens?.get(tokenDoc.id);
      button.disabled = true;
      await generateLootForCorpse(
        token ?? { document: tokenDoc, actor: tokenDoc.actor },
        tokenDoc,
        tokenDoc.actor,
        {
          roller: actor,
          openReview: true,
          investigationRoll: {
            total: Number(button.dataset.total),
            natural: Number(button.dataset.natural ?? 0),
            isNatural20: button.dataset.nat20 === "1"
          },
          preferRemotePlayer: false,
          pendingLooterUserId: button.dataset.userId || null
        }
      );
    });
  });
}

/**
 * Register chat message button hooks (legacy Generate cards only).
 */
export function registerLootChatHooks() {
  if (registered) return;
  registered = true;

  Hooks.on("renderChatMessage", (message, html) => {
    bindChatCardButtons(message, html);
  });
  Hooks.on("renderChatMessageHTML", (message, html) => {
    bindChatCardButtons(message, html);
  });

  log.debug("Loot chat hooks registered");
}
