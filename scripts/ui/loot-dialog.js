/**
 * Player-facing loot result dialog (DialogV2 + Handlebars template).
 */

const TEMPLATE = "modules/lootforge/templates/loot-dialog.hbs";

/**
 * @typedef {object} LootDialogData
 * @property {string} creatureName
 * @property {string} skillKey
 * @property {string} skillLabel
 * @property {string} interaction
 * @property {number} rollTotal
 * @property {number} natural
 * @property {boolean} isNatural20
 * @property {string} tier
 * @property {import("../services/loot-generator.js").GeneratedLootItem[]} items
 */

/**
 * @param {LootDialogData} data
 * @returns {Promise<"claim"|"close"|null>}
 */
export async function showLootDialog(data) {
  const content = await foundry.applications.handlebars.renderTemplate(TEMPLATE, {
    creatureName: data.creatureName,
    skillLabel: data.skillLabel,
    interactionLabel: game.i18n.localize(`LOOTFORGE.Interaction.${data.interaction}`),
    rollTotal: data.rollTotal,
    natural: data.natural,
    isNatural20: data.isNatural20,
    tierLabel: game.i18n.localize(`LOOTFORGE.Tier.${data.tier}`),
    items: data.items,
    empty: !data.items?.length
  });

  return foundry.applications.api.DialogV2.wait({
    window: {
      title: game.i18n.format("LOOTFORGE.Dialog.Title", { name: data.creatureName }),
      icon: "fa-solid fa-sack"
    },
    classes: ["lootforge-dialog"],
    content,
    buttons: [
      {
        action: "claim",
        label: "LOOTFORGE.Dialog.Claim",
        icon: "fa-solid fa-hand-holding",
        default: true
      },
      {
        action: "close",
        label: "LOOTFORGE.Dialog.Close",
        icon: "fa-solid fa-xmark"
      }
    ],
    rejectClose: false
  });
}
