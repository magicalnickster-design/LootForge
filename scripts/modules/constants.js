export const MODULE_ID = "lootforge";
export const SOCKET_EVENT = `module.${MODULE_ID}`;

export const CORPSE_FLAG = "corpse";

export const LEGACY_LOOTED_FLAG = "looted";

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

export const OPS = Object.freeze({
  OPEN_PLAYER_WINDOW: "openPlayerWindow",
  TAKE_ITEM: "takeItem",
  TAKE_ALL: "takeAll",
  DONE_LOOT: "doneLoot",
  PLAYER_START_LOOT: "playerStartLoot",
  CLAIM_LOOT_SESSION: "claimLootSession",
  INVESTIGATION_READY: "investigationReady",
  LOOT_RELEASED: "lootReleased",
  STATE_UPDATED: "stateUpdated"
});

export const LOOT_SKILL_INV = "inv";
export const LOOT_SKILL_SUR = "sur";
export const LOOT_SKILL = LOOT_SKILL_INV;

export const LOOT_BAG_ICON = `modules/${MODULE_ID}/assets/ui/loot-bag.svg`;
