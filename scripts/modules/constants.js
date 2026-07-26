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
  ASSIGN_LOOT: "assignLoot",
  OPEN_PLAYER_WINDOW: "openPlayerWindow",
  TAKE_ITEM: "takeItem",
  TAKE_ALL: "takeAll",
  STATE_UPDATED: "stateUpdated",
  RESET_LOOT: "resetLoot",
  SET_FLAG: "setLootedFlag"
});
