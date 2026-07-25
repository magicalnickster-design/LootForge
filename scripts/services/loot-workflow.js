/**
 * End-to-end Loot Body workflow for a single defeated token.
 */

import { classifyCreature, isDefeated } from "./creature-classifier.js";
import { generateLoot } from "./loot-generator.js";
import { claimLootToActor, postLootToChat } from "./loot-claimer.js";
import { isLooted, resetLooted, setLooted } from "./loot-flags.js";
import { getLooterActor, rollLootSkill } from "./roll-service.js";
import { showLootDialog } from "../ui/loot-dialog.js";

/**
 * @param {Token} token  Placeable token from the Token HUD / canvas
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
      console.error("LootForge | Missing token document or actor", token);
      return;
    }

    if (!isDefeated(tokenDoc)) {
      ui.notifications.warn(game.i18n.format("LOOTFORGE.Notify.NotDefeated", { name: creature.name }));
      return;
    }

    if (isLooted(tokenDoc)) {
      if (game.user.isGM) {
        const reset = await foundry.applications.api.DialogV2.confirm({
          window: { title: game.i18n.localize("LOOTFORGE.HUD.ResetLoot") },
          content: `<p>${game.i18n.format("LOOTFORGE.Notify.AlreadyLooted", { name: creature.name })}</p>
                    <p>Reset the lootforge.looted flag so this creature can be looted again?</p>`
        });
        if (reset) await resetLooted(tokenDoc);
      } else {
        ui.notifications.warn(game.i18n.format("LOOTFORGE.Notify.AlreadyLooted", { name: creature.name }));
      }
      return;
    }

    const looter = getLooterActor();
    if (!looter) {
      ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoLooter"));
      return;
    }

    const classification = classifyCreature(creature);
    const skillLabel = game.i18n.localize(`LOOTFORGE.Skill.${classification.skill}`);

    const rollResult = await rollLootSkill(looter, classification.skill);
    if (!rollResult) {
      ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.RollCancelled"));
      return;
    }

    const loot = generateLoot({
      creature,
      rollTotal: rollResult.total,
      isNatural20: rollResult.isNatural20
    });

    if (!loot) {
      ui.notifications.error(game.i18n.format("LOOTFORGE.Notify.NoTable", { name: creature.name }));
      return;
    }

    // Mark looted as soon as generation succeeds so the body cannot be re-rolled.
    await setLooted(tokenDoc, true);

    const action = await showLootDialog({
      creatureName: creature.name,
      skillKey: classification.skill,
      skillLabel,
      interaction: classification.interaction,
      rollTotal: rollResult.total,
      natural: rollResult.natural,
      isNatural20: rollResult.isNatural20,
      tier: loot.tier,
      items: loot.items
    });

    if (action === "claim" && loot.items.length) {
      const created = await claimLootToActor(looter, loot.items);
      if (created?.length) {
        ui.notifications.info(game.i18n.format("LOOTFORGE.Notify.Claimed", { name: looter.name }));
        await postLootToChat({
          creatureName: creature.name,
          skillLabel,
          rollTotal: rollResult.total,
          tier: loot.tier,
          items: loot.items,
          createdItems: created
        });
      } else {
        // Ownership or create failure — fall back to chat so loot is not lost.
        ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.PostedToChat"));
        await postLootToChat({
          creatureName: creature.name,
          skillLabel,
          rollTotal: rollResult.total,
          tier: loot.tier,
          items: loot.items
        });
      }
    } else if (loot.items.length) {
      // Closed without claiming: still surface loot in chat.
      ui.notifications.info(game.i18n.localize("LOOTFORGE.Notify.PostedToChat"));
      await postLootToChat({
        creatureName: creature.name,
        skillLabel,
        rollTotal: rollResult.total,
        tier: loot.tier,
        items: loot.items
      });
    } else {
      ui.notifications.info(game.i18n.format("LOOTFORGE.Notify.LootGenerated", { name: creature.name }));
    }
  } catch (err) {
    console.error("LootForge | lootBody failed", err);
    ui.notifications.error("LootForge encountered an error. See the console (F12) for details.");
  }
}
