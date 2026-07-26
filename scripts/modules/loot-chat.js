/**
 * Chat-card driven Investigation + Generate Loot prompts (no DialogV2 popups).
 */

import { MODULE_ID } from "./constants.js";
import { log } from "./logger.js";
import { getCorpseState, updateCorpseState } from "./loot-storage.js";
import { rollInvestigation } from "./roll-helper.js";

let registered = false;

/**
 * @returns {string[]}
 */
function gmUserIds() {
  return game.users.filter((u) => u.isGM).map((u) => u.id);
}

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
 * Post a whispered Investigation prompt for the looting player.
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {User} [user]
 */
export async function postInvestigationPromptChat(tokenDoc, actor, user = game.user) {
  if (!tokenDoc || !actor || !user) return null;

  const creatureName = tokenDoc.name;
  const content = `
    <div class="lootforge-chat-card" data-lootforge-card="investigation">
      <header class="lootforge-chat-header">
        <i class="fa-solid fa-magnifying-glass"></i>
        <strong>${game.i18n.localize("LOOTFORGE.Chat.InvestigationTitle")}</strong>
      </header>
      <p>${game.i18n.format("LOOTFORGE.Chat.InvestigationBody", {
        character: actor.name,
        name: creatureName
      })}</p>
      <button type="button" class="lootforge-chat-btn"
        data-lootforge-action="roll-investigation"
        data-token-uuid="${tokenDoc.uuid}"
        data-actor-id="${actor.id}"
        data-user-id="${user.id}">
        <i class="fa-solid fa-dice-d20"></i>
        ${game.i18n.localize("LOOTFORGE.Chat.RollInvestigation")}
      </button>
    </div>
  `;

  const whisper = [user.id, ...gmUserIds()].filter((id, i, arr) => arr.indexOf(id) === i);

  const msg = await ChatMessage.create({
    content,
    whisper,
    speaker: { alias: "LootForge" },
    flags: {
      [MODULE_ID]: {
        card: "investigation",
        tokenUuid: tokenDoc.uuid,
        actorId: actor.id,
        userId: user.id
      }
    }
  });

  log.info("Posted Investigation chat prompt", {
    tokenUuid: tokenDoc.uuid,
    userId: user.id,
    messageId: msg?.id
  });

  ui.notifications.info(
    game.i18n.format("LOOTFORGE.Notify.CheckChatInvestigation", { name: creatureName })
  );

  return msg;
}

/**
 * GM-only chat card: Generate Loot after a completed Investigation roll.
 * @param {TokenDocument} tokenDoc
 * @param {Actor} actor
 * @param {User} user
 * @param {{ total: number, natural?: number, isNatural20?: boolean }} roll
 */
export async function postGenerateLootChat(tokenDoc, actor, user, roll) {
  if (!tokenDoc || !actor || !roll) return null;

  const gms = gmUserIds();
  if (!gms.length) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NeedGM"));
    return null;
  }

  const content = `
    <div class="lootforge-chat-card" data-lootforge-card="generate">
      <header class="lootforge-chat-header">
        <i class="fa-solid fa-treasure-chest"></i>
        <strong>${game.i18n.localize("LOOTFORGE.Chat.GenerateTitle")}</strong>
      </header>
      <p>${game.i18n.format("LOOTFORGE.Chat.GenerateBody", {
        player: user?.name ?? "Player",
        character: actor.name,
        name: tokenDoc.name,
        total: roll.total
      })}</p>
      <button type="button" class="lootforge-chat-btn lootforge-chat-btn-gm"
        data-lootforge-action="generate-loot"
        data-token-uuid="${tokenDoc.uuid}"
        data-actor-id="${actor.id}"
        data-user-id="${user?.id ?? ""}"
        data-total="${Number(roll.total)}"
        data-natural="${Number(roll.natural ?? 0)}"
        data-nat20="${roll.isNatural20 ? "1" : "0"}">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        ${game.i18n.localize("LOOTFORGE.Chat.GenerateLoot")}
      </button>
    </div>
  `;

  const msg = await ChatMessage.create({
    content,
    whisper: gms,
    speaker: { alias: "LootForge" },
    flags: {
      [MODULE_ID]: {
        card: "generate",
        tokenUuid: tokenDoc.uuid,
        actorId: actor.id,
        userId: user?.id ?? null,
        investigationTotal: Number(roll.total),
        naturalDie: Number(roll.natural ?? 0),
        isNatural20: Boolean(roll.isNatural20)
      }
    }
  });

  log.info("Posted GM Generate Loot chat prompt", {
    tokenUuid: tokenDoc.uuid,
    total: roll.total,
    messageId: msg?.id
  });

  return msg;
}

/**
 * @param {HTMLElement} button
 */
async function onRollInvestigationClick(button) {
  if (button.disabled) return;

  const tokenUuid = button.dataset.tokenUuid;
  const actorId = button.dataset.actorId;
  const userId = button.dataset.userId;

  if (userId && userId !== game.user.id && !game.user.isGM) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
    return;
  }
  // GMs should not roll for the player from this card — player must click it.
  if (game.user.isGM && userId && userId !== game.user.id) {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.PlayerMustRoll"));
    return;
  }

  const tokenDoc = await fromUuid(tokenUuid);
  const actor = game.actors.get(actorId) ?? game.user.character;
  if (!tokenDoc || !actor) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  button.disabled = true;
  button.classList.add("lootforge-chat-btn-done");

  try {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollInvestigation"));
    const roll = await rollInvestigation(actor);
    if (!roll) {
      button.disabled = false;
      button.classList.remove("lootforge-chat-btn-done");
      ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollCancelled"));
      return;
    }

    // Persist pending roll on the corpse for the GM Generate button / reconnects.
    if (game.user.isGM || tokenDoc.isOwner) {
      await updateCorpseState(tokenDoc, {
        pendingInvestigation: {
          total: Number(roll.total),
          natural: Number(roll.natural ?? 0),
          isNatural20: Boolean(roll.isNatural20),
          actorId: actor.id,
          userId: game.user.id,
          at: Date.now()
        },
        pendingLooterActorId: actor.id,
        pendingLooterUserId: game.user.id,
        pendingReview: false,
        dmApproved: false,
        generated: false
      });
      await postGenerateLootChat(tokenDoc, actor, game.user, roll);
    } else {
      // Players usually cannot update enemy token flags — ask GM via socket.
      const { emitLootForge } = await import("./socket-manager.js");
      const { OPS } = await import("./constants.js");
      emitLootForge({
        op: OPS.INVESTIGATION_READY,
        tokenUuid: tokenDoc.uuid,
        actorId: actor.id,
        investigationTotal: Number(roll.total),
        naturalDie: Number(roll.natural ?? 0),
        isNatural20: Boolean(roll.isNatural20)
      });
    }

    button.innerHTML = `<i class="fa-solid fa-check"></i> ${game.i18n.localize("LOOTFORGE.Chat.Rolled")}`;
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.WaitingForGMGenerate"));
  } catch (err) {
    log.error("Chat Investigation roll failed", err);
    button.disabled = false;
    button.classList.remove("lootforge-chat-btn-done");
    ui.notifications.error(err?.message ?? "LootForge Investigation failed.");
  }
}

/**
 * @param {HTMLElement} button
 */
async function onGenerateLootClick(button) {
  if (!game.user.isGM) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.PlayersCannotGenerate"));
    return;
  }
  if (button.disabled) return;

  const tokenUuid = button.dataset.tokenUuid;
  const actorId = button.dataset.actorId;
  const userId = button.dataset.userId || null;

  const tokenDoc = await fromUuid(tokenUuid);
  if (!tokenDoc) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.TransferFailed"));
    return;
  }

  const state = getCorpseState(tokenDoc);
  const pending = state.pendingInvestigation ?? {};
  const investigationRoll = {
    total: Number(button.dataset.total ?? pending.total),
    natural: Number(button.dataset.natural ?? pending.natural ?? 0),
    isNatural20: (button.dataset.nat20 === "1") || Boolean(pending.isNatural20)
  };

  if (!Number.isFinite(investigationRoll.total)) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.InvestigationRequired"));
    return;
  }

  const actor = game.actors.get(actorId || pending.actorId)
    ?? game.actors.get(state.pendingLooterActorId);
  const user = game.users.get(userId || pending.userId || state.pendingLooterUserId);

  button.disabled = true;
  button.classList.add("lootforge-chat-btn-done");

  try {
    const { generateLootForCorpse } = await import("./loot-workflow.js");
    const token = tokenDoc.object ?? canvas.tokens?.get(tokenDoc.id);
    const generated = await generateLootForCorpse(
      token ?? { document: tokenDoc, actor: tokenDoc.actor },
      tokenDoc,
      tokenDoc.actor,
      {
        roller: actor,
        openReview: true,
        investigationRoll,
        preferRemotePlayer: false,
        pendingLooterUserId: user?.id ?? null
      }
    );

    if (!generated) {
      button.disabled = false;
      button.classList.remove("lootforge-chat-btn-done");
      return;
    }

    await updateCorpseState(tokenDoc, { pendingInvestigation: null });

    button.innerHTML = `<i class="fa-solid fa-check"></i> ${game.i18n.localize("LOOTFORGE.Chat.Generated")}`;
    ui.notifications.info(
      game.i18n.format("LOOTFORGE.Notify.PlayerGeneratedLoot", {
        player: user?.name ?? actor?.name ?? "Player",
        name: tokenDoc.name,
        total: investigationRoll.total
      })
    );
  } catch (err) {
    log.error("Chat Generate Loot failed", err);
    button.disabled = false;
    button.classList.remove("lootforge-chat-btn-done");
    ui.notifications.error(err?.message ?? "LootForge generate failed.");
  }
}

/**
 * GM: player finished Investigation via chat — store roll + post Generate card.
 * @param {object} payload
 */
export async function handleInvestigationReady(payload) {
  if (!game.user.isGM) return;
  if (game.users.activeGM?.id !== game.user.id) return;

  const tokenDoc = await fromUuid(payload.tokenUuid);
  const actor = game.actors.get(payload.actorId);
  const user = game.users.get(payload.fromUserId);
  if (!tokenDoc || !actor) return;

  const roll = {
    total: Number(payload.investigationTotal),
    natural: Number(payload.naturalDie ?? 0),
    isNatural20: Boolean(payload.isNatural20)
  };
  if (!Number.isFinite(roll.total)) return;

  await updateCorpseState(tokenDoc, {
    pendingInvestigation: {
      ...roll,
      actorId: actor.id,
      userId: user?.id ?? payload.fromUserId,
      at: Date.now()
    },
    pendingLooterActorId: actor.id,
    pendingLooterUserId: user?.id ?? payload.fromUserId ?? null,
    pendingReview: false,
    dmApproved: false
  });

  await postGenerateLootChat(tokenDoc, actor, user, roll);
  ui.notifications.info(
    game.i18n.format("LOOTFORGE.Notify.InvestigationReadyForGM", {
      player: user?.name ?? "Player",
      name: tokenDoc.name,
      total: roll.total
    })
  );
}

/**
 * @param {ChatMessage} message
 * @param {HTMLElement|JQuery} html
 */
function bindChatCardButtons(message, html) {
  const root = asElement(html);
  if (!root) return;
  if (!message?.flags?.[MODULE_ID]?.card && !root.querySelector?.("[data-lootforge-action]")) {
    return;
  }

  root.querySelectorAll?.("[data-lootforge-action]").forEach((button) => {
    if (button.dataset.lootforgeBound === "1") return;
    button.dataset.lootforgeBound = "1";

    // Hide Generate button on non-GM clients if the whisper somehow leaked.
    if (button.dataset.lootforgeAction === "generate-loot" && !game.user.isGM) {
      button.style.display = "none";
      return;
    }

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const action = button.dataset.lootforgeAction;
      if (action === "roll-investigation") await onRollInvestigationClick(button);
      else if (action === "generate-loot") await onGenerateLootClick(button);
    });
  });
}

/**
 * Register chat message button hooks.
 */
export function registerLootChatHooks() {
  if (registered) return;
  registered = true;

  Hooks.on("renderChatMessage", (message, html) => {
    bindChatCardButtons(message, html);
  });

  // Foundry v13+/v14 HTML variant
  Hooks.on("renderChatMessageHTML", (message, html) => {
    bindChatCardButtons(message, html);
  });

  log.debug("Loot chat card hooks registered");
}
