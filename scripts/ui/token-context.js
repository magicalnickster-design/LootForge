import { isLootableTarget } from "../modules/creature-context.js";
import { MODULE_ID, LOOT_RANGE_FEET } from "../modules/constants.js";
import {
  getCorpseState,
  hasRemainingLoot,
  isAwaitingDmReview,
  isLootGenerated
} from "../modules/loot-storage.js";
import { canUserLootCorpse } from "../modules/ownership.js";
import {
  isWithinLootRange,
  measureTokenDistanceFeet,
  resolveLooterToken
} from "../modules/loot-range.js";
import { lootBody } from "../modules/loot-workflow.js";

export function resolveLootTargetToken() {
  const targeted = [...(game.user.targets ?? [])];
  if (targeted.length === 1) return targeted[0];
  if (canvas.tokens?.hover?.actor) return canvas.tokens.hover;
  const controlled = canvas.tokens?.controlled ?? [];
  if (controlled.length === 1) return controlled[0];
  return null;
}

export function resolveNearestLootableCorpse() {
  const placeables = canvas.tokens?.placeables ?? [];
  const candidates = placeables.filter((token) => {
    const doc = token.document;
    if (!doc || !isLootableTarget(doc, token.actor)) return false;
    if (game.user.isGM) {
      return !isLootGenerated(doc) || hasRemainingLoot(doc) || isAwaitingDmReview(getCorpseState(doc));
    }
    if (!isLootGenerated(doc)) return true;
    if (!hasRemainingLoot(doc)) return false;
    return canUserLootCorpse(doc, game.user);
  });
  if (!candidates.length) return null;

  const origin = resolveLooterToken(game.user)
    ?? canvas.tokens.controlled[0]
    ?? null;

  if (!origin) return candidates[0];

  let best = null;
  let bestDist = Infinity;
  for (const token of candidates) {
    const dist = measureTokenDistanceFeet(origin, token);
    if (dist < bestDist) {
      bestDist = dist;
      best = token;
    }
  }
  return best;
}

export const resolveNearestAssignedCorpse = resolveNearestLootableCorpse;

export function resolveLootHotkeyToken() {
  const targeted = resolveLootTargetToken();
  if (targeted) {
    const doc = targeted.document;
    if (doc && isLootableTarget(doc, targeted.actor)) return targeted;
  }
  const nearest = resolveNearestLootableCorpse();
  if (!nearest || game.user.isGM) return nearest;

  const origin = resolveLooterToken(game.user);
  if (!origin) return nearest;
  if (!isWithinLootRange(origin, nearest, LOOT_RANGE_FEET)) return nearest;
  return nearest;
}

export function registerLootKeybinding() {
  game.keybindings.register(MODULE_ID, "lootTarget", {
    name: "LOOTFORGE.HUD.LootTargetedBody",
    hint: "LOOTFORGE.Keybinding.LootTargetHint",
    editable: [{ key: "KeyL", modifiers: ["Alt"] }],
    onDown: async () => {
      const token = resolveLootHotkeyToken();
      if (!token) {
        ui.notifications.warn(game.i18n.localize("LOOTFORGE.Notify.NoAssignedCorpse"));
        return true;
      }
      await lootBody(token);
      return true;
    }
  });
}

export function registerTokenContext() {
}
