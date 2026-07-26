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
  resolveAssignedOwnerUsers,
  userOwnsActor
} from "./ownership.js";
import { rollInvestigation } from "./roll-helper.js";
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
  requestPlayerStartLoot,
  requestRemoteInvestigationRoll
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
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollInvestigation"));
    const investigationRoll = await rollInvestigation(looter);
    if (!investigationRoll) {
      ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollCancelled"));
      return;
    }
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.SendingToDM"));
    const result = await requestPlayerStartLoot(tokenDoc, looter, { investigationRoll });
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
    // If a player already holds the session, open DM review instead of fighting the lock.
    if (isLootSessionLocked(state) && state.activeLooterUserId !== game.user.id) {
      ui.notifications.info(
        game.i18n.format("LOOTFORGE.Notify.LootBusy", {
          name: state.activeLooterName
            || game.users.get(state.activeLooterUserId)?.name
            || "Another player"
        })
      );
      await openDmLootReview(tokenDoc);
      return;
    }

    if (state.activeLooterUserId || state.assignedActorId || getSetting("allowAllPlayersToLoot")) {
      const looter = game.actors.get(state.activeLooterActorId)
        ?? game.actors.get(state.assignedActorId)
        ?? game.user.character
        ?? (await resolveLooterActor({ excludeActor: tokenDoc.actor }));
      if (looter) {
        const claim = await claimLootSession(tokenDoc, game.user, looter, { force: false });
        if (!claim.ok) {
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

  // Active looter can always reopen their window (fixes stuck "already looting" with no UI).
  if (state.activeLooterUserId === game.user.id || canUserAccessAssignedLoot(state, game.user)) {
    const looter = game.actors.get(state.activeLooterActorId)
      ?? game.actors.get(state.assignedActorId)
      ?? game.user.character
      ?? (await resolveLooterActor({ excludeActor: tokenDoc.actor }));
    if (!looter) return;
    const result = await requestPlayerStartLoot(tokenDoc, looter, { claimOnly: true });
    if (!result.ok && result.error) ui.notifications.warn(result.error);
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
    if (state.assignedActorId && !userOwnsActor(game.actors.get(state.assignedActorId), game.user)) {
      ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
      return;
    }
  }

  const looter = game.user.character
    ?? (await resolveLooterActor({ excludeActor: tokenDoc.actor }));
  if (!looter) return;

  const result = await requestPlayerStartLoot(tokenDoc, looter, { claimOnly: true });
  if (!result.ok && result.error) {
    ui.notifications.warn(result.error);
  }
}

/**
 * Resolve an Investigation roll for the looter — always Investigation.
 *
 * Remote player prompts are ONLY used when preferRemotePlayer is true (DM Start Roll).
 * GM-initiated generate/double-click rolls locally so we never sit on 120s timeouts.
 *
 * @param {Actor} roller
 * @param {TokenDocument} tokenDoc
 * @param {object|null} [providedRoll]
 * @param {{ preferRemotePlayer?: boolean }} [options]
 * @returns {Promise<object|null>}
 */
async function resolveInvestigationRoll(roller, tokenDoc, providedRoll = null, {
  preferRemotePlayer = false
} = {}) {
  if (providedRoll && Number.isFinite(Number(providedRoll.total))) {
    return {
      total: Number(providedRoll.total),
      natural: Number(providedRoll.natural ?? 0),
      isNatural20: Boolean(providedRoll.isNatural20)
    };
  }

  if (preferRemotePlayer && game.user.isGM) {
    const owners = resolveAssignedOwnerUsers(roller, { activeOnly: true });
    const playerOwner = owners[0] ?? null;
    if (playerOwner && playerOwner.id !== game.user.id) {
      const remote = await requestRemoteInvestigationRoll(playerOwner, roller, tokenDoc);
      if (remote) return remote;
      ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.InvestigationFallback"));
    }
  }

  // Local roll (player looting themselves, or GM generating).
  return rollInvestigation(roller);
}

/**
 * Generate loot on a corpse (GM authoritative). Always uses Investigation.
 *
 * @param {Token} token
 * @param {TokenDocument} tokenDoc
 * @param {Actor} creature
 * @param {object} [options]
 * @param {Actor} [options.roller]
 * @param {boolean} [options.openReview=true]
 * @param {{ total: number, natural?: number, isNatural20?: boolean }|null} [options.investigationRoll]
 */
export async function generateLootForCorpse(token, tokenDoc, creature, {
  roller = null,
  openReview = true,
  investigationRoll = null,
  preferRemotePlayer = false
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

  const rollResult = await resolveInvestigationRoll(
    resolvedRoller,
    tokenDoc,
    investigationRoll,
    { preferRemotePlayer }
  );
  if (!rollResult) {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollCancelled"));
    return null;
  }

  const survivalTotal = rollResult.total;
  const naturalDie = rollResult.natural;
  const isNatural20 = rollResult.isNatural20;

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
  log.info(`Generated ${state.items.length} loot entries for ${creature.name} (Investigation ${survivalTotal})`);

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
    let investigationRoll = null;
    if (requester?.active && actor) {
      investigationRoll = await requestRemoteInvestigationRoll(requester, actor, tokenDoc);
      if (!investigationRoll) {
        ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollCancelled"));
        return;
      }
    }
    await generateLootForCorpse(token ?? { document: tokenDoc, actor: tokenDoc.actor }, tokenDoc, tokenDoc.actor, {
      roller: actor,
      openReview: true,
      investigationRoll
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
    if (payload.investigationTotal == null) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.InvestigationRequired") };
    }
    const investigationRoll = {
      total: Number(payload.investigationTotal),
      natural: Number(payload.naturalDie ?? 0),
      isNatural20: Boolean(payload.isNatural20)
    };
    const token = tokenDoc.object ?? canvas.tokens?.get(tokenDoc.id);

    // Always open DM Review so the GM sees what was rolled/generated.
    await generateLootForCorpse(
      token ?? { document: tokenDoc, actor: tokenDoc.actor },
      tokenDoc,
      tokenDoc.actor,
      {
        roller: actor,
        openReview: true,
        investigationRoll
      }
    );

    ui.notifications.info(
      game.i18n.format("LOOTFORGE.Notify.PlayerGeneratedLoot", {
        player: user.name,
        name: tokenDoc.name,
        total: investigationRoll.total
      })
    );
    ChatMessage.create({
      content: game.i18n.format("LOOTFORGE.Notify.PlayerGeneratedLootChat", {
        player: user.name,
        character: actor.name,
        name: tokenDoc.name,
        total: investigationRoll.total
      }),
      speaker: { alias: "LootForge" }
    }).catch(() => undefined);
  } else {
    await materializeCorpseInventoryLoot(tokenDoc);
  }

  state = getCorpseState(tokenDoc);

  // Already the active looter — just reopen the window (no busy error).
  if (state.activeLooterUserId === user.id && hasRemainingLoot(tokenDoc)) {
    emitLootForge({
      op: OPS.OPEN_PLAYER_WINDOW,
      tokenUuid: tokenDoc.uuid,
      targetUserId: user.id,
      actorId: actor.id,
      trusted: true
    });
    log.info("Re-opened loot window for active looter", {
      tokenUuid: tokenDoc.uuid,
      userId: user.id
    });
    return { ok: true, reopened: true };
  }

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
    actorId: actor.id,
    trusted: true
  });
  setTimeout(() => {
    emitLootForge({
      op: OPS.OPEN_PLAYER_WINDOW,
      tokenUuid: tokenDoc.uuid,
      targetUserId: user.id,
      actorId: actor.id,
      trusted: true
    });
  }, 300);

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
