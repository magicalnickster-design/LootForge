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
import { rollInvestigation, rollInvestigationSilent } from "./roll-helper.js";
import { beginLootFlow, endLootFlow } from "./session-guard.js";
import { getSetting } from "./settings.js";
import {
  clearCorpseState,
  getCorpseState,
  hasRemainingLoot,
  isAwaitingDmReview,
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
  requestPlayerStartLoot,
  requestRemoteInvestigationRoll
} from "./socket-manager.js";
import { OPS } from "./constants.js";

/**
 * Primary entry from HUD / context / scene controls / keybind / double-click.
 * @param {Token} token
 */
export async function lootBody(token) {
  const tokenDoc = token?.document;
  const flowKey = tokenDoc?.uuid ?? null;
  if (flowKey && !beginLootFlow(flowKey)) return;

  /** Release the short debounce lock before long Investigation / generate waits. */
  const releaseFlowLock = () => {
    if (flowKey) endLootFlow(flowKey);
  };

  try {
    if (game.system.id !== "dnd5e") {
      ui.notifications.error(game.i18n.localize("LOOTFORGE.Notify.WrongSystem"));
      return;
    }

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
      // Player Investigation can take a while — do not block the GM generate path.
      releaseFlowLock();
      await handlePlayerLootBeforeReady(token, tokenDoc, creature);
      return;
    }

    if (state.generated && getSetting("preventDuplicateGeneration")) {
      ui.notifications.warn(
        game.i18n.format("LOOTFORGE.Notify.AlreadyLooted", { name: creature.name })
      );
      return;
    }

    // Remote Investigation wait must not hold the flow lock (blocks player → DM Review).
    releaseFlowLock();
    await generateAndReview(token, tokenDoc, creature);
  } catch (err) {
    log.error("lootBody failed", err);
    ui.notifications.error(
      err?.message
        ? `LootForge: ${err.message}`
        : "LootForge encountered an error. See the console (F12) for details."
    );
  } finally {
    releaseFlowLock();
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

  const state = getCorpseState(tokenDoc);

  // Already rolled — waiting on GM Generate Loot chat button.
  if (state.pendingInvestigation && Number.isFinite(Number(state.pendingInvestigation.total))) {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.WaitingForGMGenerate"));
    return;
  }

  // Chat button flow: no Investigation popup — prompt appears in chat.
  const { postInvestigationPromptChat } = await import("./loot-chat.js");
  await postInvestigationPromptChat(tokenDoc, looter, game.user);
  log.info("Posted Investigation chat prompt for player loot", {
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
    // Still in DM Review phase — always open the review window.
    if (isAwaitingDmReview(state)) {
      await openDmLootReview(tokenDoc, {
        initialRollerId: state.pendingLooterActorId ?? state.assignedActorId
      });
      return;
    }

    // If a player already holds the exclusive session, open DM review instead of fighting the lock.
    if (isLootSessionLocked(state) && state.activeLooterUserId !== game.user.id && !state.freeForAll) {
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

    if (state.freeForAll || state.activeLooterUserId || state.assignedActorId || getSetting("allowAllPlayersToLoot")) {
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

  // Players must wait while the DM finishes generating / editing loot.
  if (isAwaitingDmReview(state)) {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.WaitingForGM"));
    return;
  }

  // Active looter can always reopen their window (fixes stuck "already looting" with no UI).
  if (state.activeLooterUserId === game.user.id || canUserAccessAssignedLoot(state, game.user) || state.freeForAll) {
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
 * On the GM client:
 * - Prefer a remote roll on a connected player-owner of the looter character.
 * - Fallback is a silent formula roll (never Foundry's interactive roll UI).
 *
 * @param {Actor} roller
 * @param {TokenDocument} tokenDoc
 * @param {object|null} [providedRoll]
 * @param {{ preferRemotePlayer?: boolean }} [options]
 * @returns {Promise<object|null>}
 */
async function resolveInvestigationRoll(roller, tokenDoc, providedRoll = null, {
  preferRemotePlayer = true
} = {}) {
  if (providedRoll && Number.isFinite(Number(providedRoll.total))) {
    return {
      total: Number(providedRoll.total),
      natural: Number(providedRoll.natural ?? 0),
      isNatural20: Boolean(providedRoll.isNatural20)
    };
  }

  if (!game.user.isGM) {
    return rollInvestigation(roller);
  }

  if (preferRemotePlayer && roller && tokenDoc) {
    const owners = resolveAssignedOwnerUsers(roller, { activeOnly: true });
    // Prefer the player's primary-character user when present.
    const byPrimary = game.users.find(
      (u) => !u.isGM && u.active && u.character?.id === roller.id
    );
    const playerOwner = byPrimary ?? owners[0] ?? null;
    if (playerOwner) {
      const remote = await requestRemoteInvestigationRoll(playerOwner, roller, tokenDoc);
      if (remote?.superseded) return null;
      if (remote && Number.isFinite(Number(remote.total))) return remote;

      // Player path may have already generated while we waited — do not silent-reroll.
      const latest = getCorpseState(tokenDoc);
      if (latest.generated || isAwaitingDmReview(latest)) return null;

      ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.InvestigationFallback"));
    }
  }

  // GM fallback: silent only — never pop the roll UI on the DM.
  return rollInvestigationSilent(roller);
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
 * @param {boolean} [options.preferRemotePlayer=true]
 */
export async function generateLootForCorpse(token, tokenDoc, creature, {
  roller = null,
  openReview = true,
  investigationRoll = null,
  preferRemotePlayer = true,
  pendingLooterUserId = null
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

  const rollerOwners = resolveAssignedOwnerUsers(resolvedRoller, { activeOnly: true });
  const pendingUserId = pendingLooterUserId
    ?? rollerOwners[0]?.id
    ?? null;

  // Generated loot stays locked until the DM hits Save & Close.
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
    pendingReview: true,
    dmApproved: false,
    freeForAll: false,
    pendingLooterActorId: resolvedRoller.id,
    pendingLooterUserId: pendingUserId,
    pendingInvestigation: null,
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
  const state = getCorpseState(tokenDoc);

  // Chat flow: if a player already rolled, open/post the GM Generate card instead of auto-rolling.
  if (state.pendingInvestigation && Number.isFinite(Number(state.pendingInvestigation.total))) {
    const actor = game.actors.get(state.pendingLooterActorId)
      ?? game.actors.get(state.pendingInvestigation.actorId);
    const user = game.users.get(state.pendingLooterUserId)
      ?? game.users.get(state.pendingInvestigation.userId);
    if (actor) {
      const { postGenerateLootChat } = await import("./loot-chat.js");
      await postGenerateLootChat(tokenDoc, actor, user, state.pendingInvestigation);
      ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.CheckChatGenerate"));
      return;
    }
  }

  // No pending player roll — GM may still generate directly (silent Investigation).
  await generateLootForCorpse(token, tokenDoc, creature, {
    openReview: true,
    preferRemotePlayer: false
  });
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
  const state = getCorpseState(tokenDoc);

  // Loot already approved / available — open for the player.
  if (hasRemainingLoot(tokenDoc) && state.dmApproved && actor) {
    const { assignLootToActor } = await import("./socket-manager.js");
    await assignLootToActor(tokenDoc, actor, requester);
    return;
  }

  if (isAwaitingDmReview(state)) {
    await openDmLootReview(tokenDoc, {
      initialRollerId: state.pendingLooterActorId ?? actor?.id
    });
    return;
  }

  // Pending Investigation roll — remind GM via Generate chat card.
  if (state.pendingInvestigation && actor) {
    const { postGenerateLootChat } = await import("./loot-chat.js");
    await postGenerateLootChat(tokenDoc, actor, requester, state.pendingInvestigation);
    return;
  }

  // Ask the player to roll via chat (no DialogV2 popup).
  if (requester?.active && actor) {
    const { postInvestigationPromptChat } = await import("./loot-chat.js");
    await postInvestigationPromptChat(tokenDoc, actor, requester);
    ui.notifications.info(
      game.i18n.format("LOOTFORGE.Notify.WaitingForInvestigation", {
        name: requester.name,
        creature: tokenDoc.name
      })
    );
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
    // Generation is chat-driven (GM Generate Loot button) — players cannot auto-generate.
    if (payload.investigationTotal != null) {
      const { handleInvestigationReady } = await import("./loot-chat.js");
      await handleInvestigationReady({
        ...payload,
        fromUserId: user.id
      });
      return { ok: true, awaitingGmGenerate: true };
    }
    if (!claimOnlyMode) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.WaitingForGMGenerate") };
    }
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.PlayersCannotGenerate") };
  }

  await materializeCorpseInventoryLoot(tokenDoc);

  state = getCorpseState(tokenDoc);

  if (isAwaitingDmReview(state)) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.WaitingForGM") };
  }

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

  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id && !state.freeForAll) {
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
  if (!allowAll && !state.freeForAll && state.assignedActorId && state.assignedActorId !== actor.id) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.NoTakePermission") };
  }

  // Free-for-all leftovers: anyone may open after DM approval / first looter leaves.
  if (!state.dmApproved && !state.freeForAll && !state.assignedActorId && !state.activeLooterUserId) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.WaitingForGM") };
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
  const { syncLootedCorpseVisibility } = await import("./loot-indicator.js");
  await syncLootedCorpseVisibility(tokenDoc);
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
