import { MODULE_ID, OPS, SOCKET_EVENT } from "../modules/constants.js";
import {
  AUTH_STATES,
  SETTING_WORLD_ACCESS
} from "./auth-constants.js";
import {
  getEntitlementSnapshot,
  getLastLockReason,
  getState,
  isLocallyEntitled,
  stateMessage,
  syncEntitlement
} from "./entitlement-service.js";
import { resolveAccountIdentity, resolveSignedInLabel, isSignedIn } from "./account-identity.js";
import * as SessionStore from "./session-store.js";

export function registerWorldAccessSettings() {
  if (!globalThis.game?.settings) return;
  if (game.settings.settings?.get?.(`${MODULE_ID}.${SETTING_WORLD_ACCESS}`)) return;
  game.settings.register(MODULE_ID, SETTING_WORLD_ACCESS, {
    name: "LootForge World Access",
    scope: "world",
    config: false,
    type: Object,
    default: { active: false },
    restricted: true
  });
}

function getWorldAccess() {
  const raw = game.settings?.get?.(MODULE_ID, SETTING_WORLD_ACCESS);
  if (!raw || typeof raw !== "object") return { active: false };
  return raw;
}

function worldAccessUsable(access = getWorldAccess()) {
  if (!access?.active) return false;
  const expiresMs = Date.parse(String(access.expiresAt ?? ""));
  if (!Number.isFinite(expiresMs) || expiresMs <= Date.now()) return false;
  return true;
}

export async function publishWorldAccess() {
  if (!game.user?.isGM) return getWorldAccess();
  if (!isLocallyEntitled()) {
    const current = getWorldAccess();
    if (current?.updatedBy === game.user.id) {
      await game.settings.set(MODULE_ID, SETTING_WORLD_ACCESS, {
        active: false,
        updatedBy: game.user.id,
        updatedAt: new Date().toISOString()
      });
      broadcastWorldAccess();
    }
    return getWorldAccess();
  }

  const entitlement = getEntitlementSnapshot();
  const next = {
    active: true,
    productId: "lootforge",
    accountEmail: String(entitlement?.accountEmail ?? SessionStore.getSession()?.user?.email ?? ""),
    plan: String(entitlement?.plan ?? ""),
    expiresAt: String(entitlement?.expiresAt ?? ""),
    updatedBy: game.user.id,
    updatedAt: new Date().toISOString()
  };
  await game.settings.set(MODULE_ID, SETTING_WORLD_ACCESS, next);
  broadcastWorldAccess();
  return next;
}

export function broadcastWorldAccess() {
  const access = getWorldAccess();
  try {
    game.socket?.emit?.(SOCKET_EVENT, {
      op: OPS.WORLD_ACCESS,
      access,
      fromUserId: game.user?.id
    });
  } catch {
    // ignore
  }
}

export function applyWorldAccessBroadcast(payload) {
  if (!payload?.access || typeof payload.access !== "object") return;
  if (game.user?.isGM) return;
}

export function canUse() {
  if (game.user?.isGM) return isLocallyEntitled();
  return worldAccessUsable();
}

export function canGenerateLoot() {
  return Boolean(game.user?.isGM) && isLocallyEntitled();
}

export function canHandleAuthoritativeLoot() {
  return Boolean(game.user?.isGM) && isLocallyEntitled();
}

export function getAccessStatus() {
  const entitledLocal = isLocallyEntitled();
  const world = getWorldAccess();
  const entitlement = getEntitlementSnapshot();
  const identity = resolveAccountIdentity({ entitlement });
  return {
    canUse: canUse(),
    isGM: Boolean(game.user?.isGM),
    localEntitled: entitledLocal,
    worldActive: worldAccessUsable(world),
    authState: getState(),
    lockReason: getLastLockReason() || getState(),
    message: resolveAccessMessage(),
    signedIn: isSignedIn(),
    accountLabel: resolveSignedInLabel(identity, getState()),
    accountEmail: String(identity.email || world?.accountEmail || ""),
    accountName: String(identity.name || ""),
    plan: String(entitlement?.plan ?? world?.plan ?? ""),
    expiresAt: String(entitlement?.expiresAt ?? world?.expiresAt ?? "")
  };
}

export function resolveAccessMessage() {
  if (canUse()) return "";
  if (!game.user?.isGM) {
    if (worldAccessUsable()) return "";
    return "LootForge requires the GM to have an active Gambits Forge Tier 1 or higher subscription.";
  }
  const reason = getLastLockReason() || getState();
  if (reason === AUTH_STATES.ENTITLEMENT_EXPIRED) {
    return stateMessage(AUTH_STATES.ENTITLEMENT_EXPIRED);
  }
  if (reason === AUTH_STATES.SIGNED_OUT || reason === AUTH_STATES.SESSION_EXPIRED) {
    return stateMessage(reason);
  }
  return "LootForge requires an active Gambits Forge Tier 1 or higher subscription.";
}

export async function requireAccess({ openWindow = true } = {}) {
  if (canUse()) return true;
  if (openWindow) {
    const { openAccessWindow } = await import("../applications/access-window.js");
    await openAccessWindow();
  }
  return false;
}

export async function refreshAccessAndPublish({ notify = false } = {}) {
  const result = await syncEntitlement({ notify });
  if (game.user?.isGM) await publishWorldAccess();
  return result;
}

export const LootForgeAccess = {
  canUse,
  canGenerateLoot,
  canHandleAuthoritativeLoot,
  getAccessStatus,
  requireAccess,
  publishWorldAccess,
  refreshAccessAndPublish,
  resolveAccessMessage
};

globalThis.LootForgeAccess = LootForgeAccess;
