/**
 * End-to-end LootForge workflow for Generate / View / Reset / player requests.
 */

import { resolveCreatureProfile } from "../data/creature-profiles.js";
import { openDmLootReview } from "../applications/dm-loot-review.js";
import { openPlayerLootWindow } from "../applications/player-loot-window.js";
import { buildCreatureContext, isCreatureDead } from "./creature-context.js";
import { generateCreatureLoot } from "./loot-generator.js";
import { syncLootIndicator } from "./loot-indicator.js";
import { log } from "./logger.js";
import { resolveLooterActor } from "./looter-selection.js";
import {
  canUserLootCorpse,
  getLootBusyReasonKey,
  userOwnsActor
} from "./ownership.js";
import { rollLootSkill } from "./roll-helper.js";
import { getSetting } from "./settings.js";
import {
  clearCorpseState,
  getCorpseState,
  hasRemainingLoot,
  isCorpseLooted,
  isLootGenerated,
  isLootSessionLocked,
  setCorpseState
} from "./loot-storage.js";
import {
  claimLootSession,
  materializeCorpseInventoryLoot
} from "./loot-transfer.js";
import {
  emitLootForge,
  requestDmLootPrompt,
  requestPlayerStartLoot
} from "./socket-manager.js";
import { OPS } from "./constants.js";

/**
 * Primary entry from HUD / context / scene controls / keybind / double-click.
 * @param {Token} token
 */
export async function lootBody(token) {
  try {
    if (game.system.id !== "dnd5e") {
      ui.notifications.error(game.i18n.localize("LOOTFORGE.Notify.WrongSystem"));
      return;
    }

    const tokenDoc = token?.document;
    const creature = token?.actor;
    if (!tokenDoc || !creature) {
      log.error("Missing token document or actor", token);
      return;
    }

    if (!isCreatureDead(tokenDoc, creature)) {
      ui.notifications.warn(
        game.i18n.format("LOOTFORGE.Notify.NotDefeated", { name: creature.name })
      );
      return;
    }

    const state = getCorpseState(tokenDoc);

    if (isCorpseLooted(tokenDoc) && !hasRemainingLoot(tokenDoc)) {
      if (game.user.isGM) {
        const reset = await foundry.applications.api.DialogV2.confirm({
          window: { title: game.i18n.localize("LOOTFORGE.HUD.ResetLoot") },
          content: `<p>${game.i18n.format("LOOTFORGE.Notify.AlreadyLooted", { name: creature.name })}</p>
                    <p>${game.i18n.localize("LOOTFORGE.Notify.ResetConfirm")}</p>`
        });
        if (reset) await resetCorpseLoot(tokenDoc);
      } else {
        ui.notifications.warn(
          game.i18n.format("LOOTFORGE.Notify.AlreadyLooted", { name: creature.name })
        );
      }
      return;
    }

    // Loot available (window pool or corpse inventory leftovers).
    if (hasRemainingLoot(tokenDoc)) {
      await openExistingLoot(tokenDoc, state);
      return;
    }

    // Nothing generated yet.
    if (!game.user.isGM) {
      await handlePlayerLootBeforeReady(token, tokenDoc, creature);
      return;
    }

    if (state.generated && getSetting("preventDuplicateGeneration")) {
      ui.notifications.warn(
        game.i18n.format("LOOTFORGE.Notify.AlreadyLooted", { name: creature.name })
      );
      return;
    }

    await generateAndReview(token, tokenDoc, creature);
  } catch (err) {
    log.error("lootBody failed", err);
    ui.notifications.error(
      err?.message
        ? `LootForge: ${err.message}`
        : "LootForge encountered an error. See the console (F12) for details."
    );
  }
}

/**
 * Player double-clicks / loots before the DM has prepared loot.
 * @param {Token} token
 * @param {TokenDocument} tokenDoc
 * @param {Actor} creature
 */
async function handlePlayerLootBeforeReady(token, tokenDoc, creature) {
  const looter = game.user.character
    ?? (await resolveLooterActor({ excludeActor: creature }));
  if (!looter) return;

  if (getSetting("allowAllPlayersToLoot")) {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.GeneratingLoot"));
    const result = await requestPlayerStartLoot(tokenDoc, looter);
    if (!result.ok && result.error) {
      ui.notifications.warn(result.error);
    }
    return;
  }

  // Classic: tell the player to wait, ping the DM to start the roll.
  ui.notifications.info(
    game.i18n.format("LOOTFORGE.Notify.WaitingForDM", { name: creature.name })
  );
  await requestDmLootPrompt(tokenDoc, looter);
  log.info("Player requested DM loot start", {
    tokenUuid: tokenDoc.uuid,
    actorId: looter.id,
    userId: game.user.id
  });
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {object} state
 */
async function openExistingLoot(tokenDoc, state) {
  if (game.user.isGM) {
    if (state.activeLooterUserId || state.assignedActorId || getSetting("allowAllPlayersToLoot")) {
      const looter = game.user.character
        ?? game.actors.get(state.assignedActorId)
        ?? (await resolveLooterActor({ excludeActor: tokenDoc.actor }));
      if (looter) {
        const claim = await claimLootSession(tokenDoc, game.user, looter);
        if (!claim.ok) {
          ui.notifications.warn(claim.error);
          await openDmLootReview(tokenDoc);
          return;
        }
        const { broadcastStateUpdated } = await import("./socket-manager.js");
        broadcastStateUpdated(tokenDoc.uuid);
        await openPlayerLootWindow(tokenDoc);
        return;
      }
    }
    await openDmLootReview(tokenDoc);
    return;
  }

  const busyKey = getLootBusyReasonKey(state, game.user);
  if (busyKey) {
    const name = state.activeLooterName
      || game.users.get(state.activeLooterUserId)?.name
      || "Another player";
    ui.notifications.warn(game.i18n.format(busyKey, { name }));
    return;
  }

  if (!canUserLootCorpse(tokenDoc, game.user) && !getSetting("allowAllPlayersToLoot")) {
    // Assigned to someone else and session not free.
    if (state.assignedActorId && !userOwnsActor(game.actors.get(state.assignedActorId), game.user)) {
      ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
      return;
    }
  }

  const looter = game.user.character
    ?? (await resolveLooterActor({ excludeActor: tokenDoc.actor }));
  if (!looter) return;

  // Players cannot update enemy tokens — ask GM to claim + open.
  const result = await requestPlayerStartLoot(tokenDoc, looter, { claimOnly: true });
  if (!result.ok && result.error) {
    ui.notifications.warn(result.error);
  }
}

/**
 * Generate loot on a corpse (GM authoritative). Optionally skip DM review.
 *
 * @param {Token} token
 * @param {TokenDocument} tokenDoc
 * @param {Actor} creature
 * @param {object} [options]
 * @param {Actor} [options.roller]
 * @param {boolean} [options.openReview=true]
 * @param {boolean} [options.skipSurvivalPrompt=false]
 */
export async function generateLootForCorpse(token, tokenDoc, creature, {
  roller = null,
  openReview = true,
  skipSurvivalPrompt = false
} = {}) {
  const context = buildCreatureContext(creature, tokenDoc);
  const profile = resolveCreatureProfile(context);
  if (!profile) {
    ui.notifications.error(
      game.i18n.format("LOOTFORGE.Notify.NoTable", { name: creature.name })
    );
    return null;
  }

  const resolvedRoller = roller ?? await resolveLooterActor({ excludeActor: creature });
  if (!resolvedRoller) return null;

  let survivalTotal = Number(getSetting("defaultSurvivalDC")) || 10;
  let naturalDie = 0;
  let isNatural20 = false;

  if (getSetting("requireSurvivalRoll") && !skipSurvivalPrompt) {
    const rollResult = await rollLootSkill(resolvedRoller, "sur");
    if (!rollResult) {
      ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollCancelled"));
      return null;
    }
    survivalTotal = rollResult.total;
    naturalDie = rollResult.natural;
    isNatural20 = rollResult.isNatural20;
  }

  const generated = await generateCreatureLoot({
    context,
    survivalTotal,
    naturalDie,
    isNatural20
  });

  const state = await setCorpseState(tokenDoc, {
    generated: true,
    generatedAt: Date.now(),
    generatedBy: game.user.id,
    creatureContext: context,
    survivalTotal,
    naturalDie,
    rollQuality: generated.rollQuality,
    profileId: generated.profileId,
    items: generated.items,
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    assignedActorId: null,
    assignedUserId: null,
    activeLooterUserId: null,
    activeLooterActorId: null,
    activeLooterName: null,
    looted: false,
    lootedAt: null
  });

  await syncLootIndicator(tokenDoc);
  log.info(`Generated ${state.items.length} loot entries for ${creature.name}`);

  if (openReview && game.user.isGM) {
    await openDmLootReview(tokenDoc, { initialRollerId: resolvedRoller.id });
  }

  return state;
}

/**
 * @param {Token} token
 * @param {TokenDocument} tokenDoc
 * @param {Actor} creature
 */
async function generateAndReview(token, tokenDoc, creature) {
  await generateLootForCorpse(token, tokenDoc, creature, { openReview: true });
}

/**
 * GM: handle a player asking to start loot (waiting-for-DM path).
 * @param {object} payload
 */
export async function handleDmLootRequest(payload) {
  const tokenDoc = await fromUuid(payload.tokenUuid);
  if (!tokenDoc) return;

  const requester = game.users.get(payload.fromUserId);
  const actor = game.actors.get(payload.actorId) ?? requester?.character;
  const creatureName = tokenDoc.name;
  const playerName = requester?.name ?? "A player";
  const state = getCorpseState(tokenDoc);

  const alreadyReady = hasRemainingLoot(tokenDoc) || isLootGenerated(tokenDoc);

  const content = alreadyReady
    ? `<p>${game.i18n.format("LOOTFORGE.Dialog.PlayerLootReady", {
      player: playerName,
      name: creatureName
    })}</p>`
    : `<p>${game.i18n.format("LOOTFORGE.Dialog.PlayerLootRequest", {
      player: playerName,
      name: creatureName
    })}</p>`;

  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: {
      title: game.i18n.localize("LOOTFORGE.Dialog.LootRequestTitle")
    },
    content,
    yes: {
      label: alreadyReady
        ? game.i18n.localize("LOOTFORGE.Dialog.OpenForPlayer")
        : game.i18n.localize("LOOTFORGE.Dialog.StartRoll"),
      icon: "fa-solid fa-dice-d20",
      default: true
    },
    no: {
      label: game.i18n.localize("LOOTFORGE.Dialog.Close")
    }
  });

  if (!confirmed) return;

  if (!hasRemainingLoot(tokenDoc) && !state.generated) {
    const token = tokenDoc.object ?? canvas.tokens?.get(tokenDoc.id);
    await generateLootForCorpse(token ?? { document: tokenDoc, actor: tokenDoc.actor }, tokenDoc, tokenDoc.actor, {
      roller: actor,
      openReview: true,
      skipSurvivalPrompt: false
    });
    return;
  }

  // Loot exists — assign/open for the requesting player.
  if (actor) {
    const { assignLootToActor } = await import("./socket-manager.js");
    await assignLootToActor(tokenDoc, actor, requester);
  } else {
    await openDmLootReview(tokenDoc);
  }
}

/**
 * GM: auto-generate (if needed), claim session, open player window.
 * @param {object} payload
 * @param {object} [options]
 */
export async function handlePlayerStartLoot(payload, { claimOnly = false } = {}) {
  const tokenDoc = await fromUuid(payload.tokenUuid);
  if (!tokenDoc) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.TransferFailed") };
  }

  const user = game.users.get(payload.fromUserId);
  const actor = game.actors.get(payload.actorId) ?? user?.character;
  if (!user || !actor) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoLooter") };
  }

  const allowAll = getSetting("allowAllPlayersToLoot");
  const claimOnlyMode = claimOnly || payload.claimOnly;
  let state = getCorpseState(tokenDoc);

  if (!hasRemainingLoot(tokenDoc) && !state.generated) {
    if (!allowAll || claimOnlyMode) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.PlayersCannotGenerate") };
    }
    const token = tokenDoc.object ?? canvas.tokens?.get(tokenDoc.id);
    await generateLootForCorpse(
      token ?? { document: tokenDoc, actor: tokenDoc.actor },
      tokenDoc,
      tokenDoc.actor,
      {
        roller: actor,
        openReview: false,
        skipSurvivalPrompt: true
      }
    );
  } else {
    await materializeCorpseInventoryLoot(tokenDoc);
  }

  state = getCorpseState(tokenDoc);
  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id) {
    const name = state.activeLooterName
      || game.users.get(state.activeLooterUserId)?.name
      || "Another player";
    return {
      ok: false,
      error: game.i18n.format("LOOTFORGE.Notify.LootBusy", { name })
    };
  }

  if (!hasRemainingLoot(tokenDoc)) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.AlreadyLootedEmpty") };
  }

  // Classic assign mode: only the assignee may open until leftovers are freed.
  if (!allowAll && state.assignedActorId && state.assignedActorId !== actor.id) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoTakePermission") };
  }

  const claim = await claimLootSession(tokenDoc, user, actor);
  if (!claim.ok) return claim;

  const { broadcastStateUpdated } = await import("./socket-manager.js");
  broadcastStateUpdated(tokenDoc.uuid);

  emitLootForge({
    op: OPS.OPEN_PLAYER_WINDOW,
    tokenUuid: tokenDoc.uuid,
    targetUserId: user.id,
    actorId: actor.id
  });

  log.info("Player loot session started", {
    tokenUuid: tokenDoc.uuid,
    userId: user.id,
    actorId: actor.id,
    autoGenerated: allowAll && !claimOnlyMode
  });

  return { ok: true };
}

/**
 * @param {TokenDocument} tokenDoc
 */
export async function resetCorpseLoot(tokenDoc) {
  if (!game.user.isGM) {
    ui.notifications.warn(
      game.i18n.format("LOOTFORGE.Notify.PermissionDenied", { name: tokenDoc.name })
    );
    return;
  }
  await clearCorpseState(tokenDoc);
  await syncLootIndicator(tokenDoc);
  ui.notifications.info(game.i18n.format("LOOTFORGE.Notify.FlagReset", { name: tokenDoc.name }));
}

/**
 * @param {TokenDocument} tokenDoc
 * @returns {string}
 */
export function getLootActionLabelKey(tokenDoc) {
  if (isCorpseLooted(tokenDoc) && !hasRemainingLoot(tokenDoc)) {
    return "LOOTFORGE.HUD.Looted";
  }
  if (isLootGenerated(tokenDoc) && hasRemainingLoot(tokenDoc)) {
    return game.user.isGM ? "LOOTFORGE.HUD.ViewLoot" : "LOOTFORGE.HUD.LootBody";
  }
  return "LOOTFORGE.HUD.GenerateLoot";
}
