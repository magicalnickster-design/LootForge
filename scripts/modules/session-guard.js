import { log } from "./logger.js";

const lootInFlight = new Set();

const investigationClaimed = new Set();

export function beginLootFlow(tokenUuid) {
  if (!tokenUuid) return false;
  if (lootInFlight.has(tokenUuid)) {
    log.info("Loot flow already in progress — ignoring duplicate", { tokenUuid });
    ui.notifications?.info?.(game.i18n.localize("LOOTFORGE.Notify.LootInProgress"));
    return false;
  }
  lootInFlight.add(tokenUuid);
  return true;
}

export function endLootFlow(tokenUuid) {
  if (tokenUuid) lootInFlight.delete(tokenUuid);
}

export function isLootFlowInProgress(tokenUuid) {
  return lootInFlight.has(tokenUuid);
}

export function hasInvestigationClaim(tokenUuid) {
  return Boolean(tokenUuid) && investigationClaimed.has(tokenUuid);
}

export function claimInvestigationLocal(tokenUuid) {
  if (!tokenUuid) return false;
  if (investigationClaimed.has(tokenUuid)) {
    log.info("Investigation already claimed locally — blocking spam", { tokenUuid });
    return false;
  }
  investigationClaimed.add(tokenUuid);
  return true;
}

export function markInvestigationClaimed(tokenUuid) {
  if (tokenUuid) investigationClaimed.add(tokenUuid);
}

export function releaseInvestigationClaim(tokenUuid) {
  if (tokenUuid) investigationClaimed.delete(tokenUuid);
}
