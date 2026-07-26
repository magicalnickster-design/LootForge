/** Shared LootForge constants. */

export const MODULE_ID = "lootforge";
export const SOCKET_EVENT = `module.${MODULE_ID}`;

/** Token flag key holding authoritative corpse loot state. */
export const CORPSE_FLAG = "corpse";

/** Legacy boolean flag from v0.1.x — still honored for already-looted bodies. */
export const LEGACY_LOOTED_FLAG = "looted";

/** Active Effect / status id used for the loot indicator (optional). */
export const LOOT_INDICATOR_STATUS = "lootforge-loot";

export const ROLL_QUALITIES = Object.freeze([
  "poor",
  "standard",
  "good",
  "excellent",
  "exceptional"
]);

export const RARITIES = Object.freeze([
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic"
]);

/** Socket / query operation names. */
export const OPS = Object.freeze({
  OPEN_PLAYER_WINDOW: "openPlayerWindow",
  TAKE_ITEM: "takeItem",
  TAKE_ALL: "takeAll",
  DONE_LOOT: "doneLoot",
  PLAYER_START_LOOT: "playerStartLoot",
  CLAIM_LOOT_SESSION: "claimLootSession",
  INVESTIGATION_READY: "investigationReady",
  STATE_UPDATED: "stateUpdated"
});

/** Looting always uses Investigation — never Survival or another skill. */
export const LOOT_SKILL = "inv";

/** Bundled loot-bag icon (player window chrome / item fallbacks). */
export const LOOT_BAG_ICON = `modules/${MODULE_ID}/assets/ui/loot-bag.svg`;
