/**
 * End-to-end LootForge workflow (v0.4+):
 * Player Investigation → GM DM Review → free-for-all shared loot.
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
  resolveAssignedOwnerUsers
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
  setCorpseState,
  updateCorpseState
} from "./loot-storage.js";
import {
  claimLootSession,
  materializeCorpseInventoryLoot
} from "./loot-transfer.js";
import {
  emitLootForge,
  requestPlayerStartLoot
} from "./socket-manager.js";
import { MODULE_ID, OPS } from "./constants.js";

/** Token UUIDs currently generating loot on the GM (race guard). */
const generatingTokens = new Set();

/**
 * Primary entry from HUD / context / scene controls / keybind / double-click.
 * Players initiate Investigation; DM cannot start that step.
 * @param {Token} token
 */
export async function lootBody(token) {
  const tokenDoc = token?.document;
  const flowKey = tokenDoc?.uuid ?? null;
  if (flowKey && !beginLootFlow(flowKey)) return;

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

    // Waiting for DM to finish reviewing generated loot.
    if (isAwaitingDmReview(state)) {
      if (game.user.isGM) {
        await openDmLootReview(tokenDoc);
      } else {
        ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.WaitingForGM"));
      }
      return;
    }

    // Loot released — open the shared WoW window (any player / GM).
    if (hasRemainingLoot(tokenDoc) && (state.dmApproved || state.freeForAll || game.user.isGM)) {
      await openExistingLoot(tokenDoc, state);
      return;
    }

    // Nothing generated yet — only players may start Investigation.
    if (game.user.isGM) {
      ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.PlayersMustInitiate"));
      return;
    }

    // Keep the flow lock until Investigation + emit finish (finally releases).
    await handlePlayerLootBeforeReady(tokenDoc, creature);
  } catch (err) {
    log.error("lootBody failed", err);
    ui.notifications.error(
      err?.message
        ? `LootForge: ${err.message}`
        : "LootForge encountered an error. See the console (F12) for details."
    );
  } finally {
    if (flowKey) endLootFlow(flowKey);
  }
}

/**
 * Player double-clicks a dead creature with no loot yet → auto Investigation.
 * @param {TokenDocument} tokenDoc
 * @param {Actor} creature
 */
async function handlePlayerLootBeforeReady(tokenDoc, creature) {
  const looter = game.user.character
    ?? (await resolveLooterActor({ excludeActor: creature }));
  if (!looter) return;

  const state = getCorpseState(tokenDoc);
  if (state.pendingInvestigation && Number.isFinite(Number(state.pendingInvestigation.total))) {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.WaitingForGM"));
    return;
  }
  if (state.generated && !state.dmApproved) {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.WaitingForGM"));
    return;
  }

  ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollInvestigation"));
  const investigationRoll = await rollInvestigationSilent(looter, {
    createMessage: true,
    flavor: game.i18n.localize("LOOTFORGE.Notify.RollInvestigation")
  });
  if (!investigationRoll) {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollCancelled"));
    return;
  }

  emitLootForge({
    op: OPS.INVESTIGATION_READY,
    tokenUuid: tokenDoc.uuid,
    actorId: looter.id,
    investigationTotal: Number(investigationRoll.total),
    naturalDie: Number(investigationRoll.natural ?? 0),
    isNatural20: Boolean(investigationRoll.isNatural20)
  });

  log.info("Auto Investigation complete — notified GM", {
    tokenUuid: tokenDoc.uuid,
    actorId: looter.id,
    total: investigationRoll.total,
    moduleId: MODULE_ID
  });

  ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.WaitingForGM"));
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

  const state = getCorpseState(tokenDoc);
  if (
    generatingTokens.has(tokenDoc.uuid)
    || isLootGenerated(tokenDoc)
    || isAwaitingDmReview(state)
  ) {
    log.info("Ignoring duplicate Investigation ready", {
      tokenUuid: tokenDoc.uuid,
      generated: state.generated,
      awaiting: isAwaitingDmReview(state)
    });
    if (payload.fromUserId) {
      emitLootForge({
        op: OPS.STATE_UPDATED,
        tokenUuid: tokenDoc.uuid,
        error: game.i18n.localize("LOOTFORGE.Notify.WaitingForGM"),
        targetUserId: payload.fromUserId
      });
    }
    return;
  }

  generatingTokens.add(tokenDoc.uuid);

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

    const token = tokenDoc.object ?? canvas.tokens?.get(tokenDoc.id);
    const generated = await generateLootForCorpse(
      token ?? { document: tokenDoc, actor: tokenDoc.actor },
      tokenDoc,
      tokenDoc.actor,
      {
        roller: actor,
        openReview: true,
        investigationRoll: roll,
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
  } finally {
    generatingTokens.delete(tokenDoc.uuid);
  }
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {object} state
 */
async function openExistingLoot(tokenDoc, state) {
  if (game.user.isGM) {
    if (isAwaitingDmReview(state)) {
      await openDmLootReview(tokenDoc);
      return;
    }

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

    if (state.freeForAll || state.dmApproved || state.activeLooterUserId || getSetting("allowAllPlayersToLoot")) {
      const looter = game.actors.get(state.activeLooterActorId)
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

  if (isAwaitingDmReview(state)) {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.WaitingForGM"));
    return;
  }

  if (!canUserLootCorpse(tokenDoc, game.user)) {
    const busyKey = getLootBusyReasonKey(state, game.user);
    if (busyKey) {
      const name = state.activeLooterName
        || game.users.get(state.activeLooterUserId)?.name
        || "Another player";
      ui.notifications.warn(game.i18n.format(busyKey, { name }));
      return;
    }
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
    return;
  }

  const looter = game.actors.get(state.activeLooterActorId)
    ?? game.user.character
    ?? (await resolveLooterActor({ excludeActor: tokenDoc.actor }));
  if (!looter) return;

  const result = await requestPlayerStartLoot(tokenDoc, looter, { claimOnly: true });
  if (!result.ok && result.error) ui.notifications.warn(result.error);
}

/**
 * Resolve Investigation for generate — prefer a provided player roll; never open remote prompts.
 *
 * @param {Actor} roller
 * @param {object|null} [providedRoll]
 * @returns {Promise<object|null>}
 */
async function resolveInvestigationRoll(roller, providedRoll = null) {
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

  // Macro / edge fallback: silent only — never pop the roll UI on the DM.
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
 */
export async function generateLootForCorpse(token, tokenDoc, creature, {
  roller = null,
  openReview = true,
  investigationRoll = null,
  pendingLooterUserId = null
} = {}) {
  if (getSetting("preventDuplicateGeneration") && isLootGenerated(tokenDoc)) {
    log.info("Prevent duplicate generation — opening existing review", tokenDoc.uuid);
    if (openReview && game.user.isGM) {
      await openDmLootReview(tokenDoc);
    }
    return getCorpseState(tokenDoc);
  }

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

  const rollResult = await resolveInvestigationRoll(resolvedRoller, investigationRoll);
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

  // Generated loot stays locked until the DM hits Save & Close / Close.
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
    await openDmLootReview(tokenDoc);
  }

  return state;
}

/**
 * GM: claim shared loot session and open the player window for the requester.
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

  let state = getCorpseState(tokenDoc);

  // Investigation starts via INVESTIGATION_READY only — do not generate here.
  if (!state.generated || !hasRemainingLoot(tokenDoc)) {
    if (!state.generated) {
      return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.WaitingForGM") };
    }
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.AlreadyLootedEmpty") };
  }

  await materializeCorpseInventoryLoot(tokenDoc);
  state = getCorpseState(tokenDoc);

  if (isAwaitingDmReview(state)) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.WaitingForGM") };
  }

  if (!state.dmApproved && !state.freeForAll) {
    return { ok: false, error: game.i18n.localize("LOOTFORGE.Notify.WaitingForGM") };
  }

  if (state.activeLooterUserId === user.id && hasRemainingLoot(tokenDoc)) {
    emitLootForge({
      op: OPS.OPEN_PLAYER_WINDOW,
      tokenUuid: tokenDoc.uuid,
      targetUserId: user.id,
      actorId: actor.id,
      trusted: true
    });
    return { ok: true, reopened: true };
  }

  if (isLootSessionLocked(state) && state.activeLooterUserId !== user.id && !state.freeForAll && !state.dmApproved) {
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

  log.info("Player loot session started", {
    tokenUuid: tokenDoc.uuid,
    userId: user.id,
    actorId: actor.id,
    claimOnly: claimOnly || payload.claimOnly,
    shared: Boolean(claim.shared)
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
  if (game.user.isGM && isLootGenerated(tokenDoc) && hasRemainingLoot(tokenDoc)) {
    return "LOOTFORGE.HUD.ViewLoot";
  }
  return "LOOTFORGE.HUD.LootBody";
}
