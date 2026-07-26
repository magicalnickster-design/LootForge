/**
 * End-to-end LootForge workflow for Generate / View / Reset.
 */

import { resolveCreatureProfile } from "../data/creature-profiles.js";
import { openDmLootReview } from "../applications/dm-loot-review.js";
import { openPlayerLootWindow } from "../applications/player-loot-window.js";
import { buildCreatureContext, isCreatureDead } from "./creature-context.js";
import { generateCreatureLoot } from "./loot-generator.js";
import { syncLootIndicator } from "./loot-indicator.js";
import { log } from "./logger.js";
import { resolveLooterActor } from "./looter-selection.js";
import { rollLootSkill } from "./roll-helper.js";
import { getSetting } from "./settings.js";
import {
  clearCorpseState,
  getCorpseState,
  hasRemainingLoot,
  isCorpseLooted,
  isLootGenerated,
  setCorpseState
} from "./loot-storage.js";

/**
 * Primary entry from HUD / context / scene controls / keybind.
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

    // Already looted (empty).
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

    // Generated loot still available → view.
    if (isLootGenerated(tokenDoc) && hasRemainingLoot(tokenDoc)) {
      await openExistingLoot(tokenDoc, state);
      return;
    }

    // Prevent duplicate generation.
    if (state.generated && getSetting("preventDuplicateGeneration") && !game.user.isGM) {
      ui.notifications.warn(
        game.i18n.format("LOOTFORGE.Notify.AlreadyLooted", { name: creature.name })
      );
      return;
    }

    // Only GM (or optional player request) may generate.
    if (!game.user.isGM && !getSetting("allowPlayerRequestLoot")) {
      ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.PlayersCannotGenerate"));
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
 * @param {TokenDocument} tokenDoc
 * @param {object} state
 */
async function openExistingLoot(tokenDoc, state) {
  if (game.user.isGM) {
    await openDmLootReview(tokenDoc);
    return;
  }

  const allowed = state.assignedUserId === game.user.id
    || (state.assignedActorId && game.actors.get(state.assignedActorId)?.isOwner);

  if (!allowed) {
    ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoTakePermission"));
    return;
  }

  await openPlayerLootWindow(tokenDoc);
}

/**
 * Run survival roll + generation + DM review.
 * @param {Token} token
 * @param {TokenDocument} tokenDoc
 * @param {Actor} creature
 */
async function generateAndReview(token, tokenDoc, creature) {
  const context = buildCreatureContext(creature, tokenDoc);
  const profile = resolveCreatureProfile(context);
  if (!profile) {
    ui.notifications.error(
      game.i18n.format("LOOTFORGE.Notify.NoTable", { name: creature.name })
    );
    return;
  }

  // Harvester for the skill check (may differ from final assigned recipient).
  const roller = await resolveLooterActor({ excludeActor: creature });
  if (!roller) return;

  let survivalTotal = Number(getSetting("defaultSurvivalDC")) || 10;
  let naturalDie = 0;
  let isNatural20 = false;

  if (getSetting("requireSurvivalRoll")) {
    const rollResult = await rollLootSkill(roller, "sur");
    if (!rollResult) {
      ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollCancelled"));
      return;
    }
    survivalTotal = rollResult.total;
    naturalDie = rollResult.natural;
    isNatural20 = rollResult.isNatural20;
  }

  const generated = generateCreatureLoot({
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
    looted: false,
    lootedAt: null
  });

  await syncLootIndicator(tokenDoc);
  log.info(`Generated ${state.items.length} loot entries for ${creature.name}`);

  if (game.user.isGM) {
    await openDmLootReview(tokenDoc, { initialRollerId: roller.id });
  } else {
    ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.WaitingForGM"));
  }
}

/**
 * GM reset with confirmation already handled by caller or here.
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
 * Label for context menu / HUD based on corpse state.
 * @param {TokenDocument} tokenDoc
 * @returns {string} localization key
 */
export function getLootActionLabelKey(tokenDoc) {
  if (isCorpseLooted(tokenDoc) && !hasRemainingLoot(tokenDoc)) {
    return "LOOTFORGE.HUD.Looted";
  }
  if (isLootGenerated(tokenDoc) && hasRemainingLoot(tokenDoc)) {
    return "LOOTFORGE.HUD.ViewLoot";
  }
  return "LOOTFORGE.HUD.GenerateLoot";
}
