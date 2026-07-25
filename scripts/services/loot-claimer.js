/**
 * Deliver generated loot to a player character or to chat.
 */

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Build dnd5e Item create data from generated loot rows.
 * @param {import("./loot-generator.js").GeneratedLootItem[]} items
 * @returns {object[]}
 */
export function toItemData(items) {
  return items.map((item) => ({
    name: item.name,
    type: item.type || "loot",
    img: "icons/svg/chest.svg",
    system: {
      quantity: item.quantity,
      description: {
        value: item.description || (item.bonus ? "LootForge natural 20 bonus." : "Harvested with LootForge.")
      },
      rarity: "",
      source: { custom: "LootForge" }
    }
  }));
}

/**
 * Create loot items on the looter character when possible.
 * @param {Actor} looter
 * @param {import("./loot-generator.js").GeneratedLootItem[]} items
 * @returns {Promise<Item[]|null>}
 */
export async function claimLootToActor(looter, items) {
  if (!looter) return null;
  if (!looter.isOwner && !game.user.isGM) {
    console.warn("LootForge | Cannot create items on actor without ownership", looter);
    return null;
  }

  const data = toItemData(items);
  return looter.createEmbeddedDocuments("Item", data);
}

/**
 * Post loot to chat with item UUID links when possible.
 * @param {object} options
 * @param {string} options.creatureName
 * @param {string} options.skillLabel
 * @param {number} options.rollTotal
 * @param {string} options.tier
 * @param {import("./loot-generator.js").GeneratedLootItem[]} options.items
 * @param {Item[]} [options.createdItems]
 * @returns {Promise<ChatMessage>}
 */
export async function postLootToChat({
  creatureName,
  skillLabel,
  rollTotal,
  tier,
  items,
  createdItems = []
}) {
  const tierLabel = game.i18n.localize(`LOOTFORGE.Tier.${tier}`);
  let itemLines;

  if (createdItems.length) {
    itemLines = createdItems
      .map((item) => {
        const qty = item.system?.quantity ?? 1;
        return `<li>@UUID[${item.uuid}]{${item.name}} × ${qty}</li>`;
      })
      .join("");
  } else {
    itemLines = items
      .map((item) => `<li><strong>${escapeHtml(item.name)}</strong> × ${item.quantity}</li>`)
      .join("");
  }

  const content = `
    <div class="lootforge-chat">
      <h3>${game.i18n.format("LOOTFORGE.Chat.LootHeader", { name: escapeHtml(creatureName) })}</h3>
      <p>${game.i18n.format("LOOTFORGE.Chat.Roll", {
        total: rollTotal,
        skill: skillLabel
      })}</p>
      <p>${game.i18n.format("LOOTFORGE.Chat.Tier", { tier: tierLabel })}</p>
      <ul>${itemLines}</ul>
      ${createdItems.length ? "" : `<p><em>${game.i18n.localize("LOOTFORGE.Chat.ClaimHint")}</em></p>`}
    </div>
  `;

  return ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    content
  });
}
