/**
 * Loot protection flags.
 *
 * Stored on the TokenDocument so each placed creature can be looted once,
 * even when multiple tokens share a linked Actor.
 *
 * Flag path: flags.lootforge.looted
 *
 * Players usually cannot update enemy TokenDocuments, so flag writes are
 * relayed to the active GM via CONFIG.queries (with a socket fallback).
 */

export const MODULE_ID = "lootforge";
export const LOOTED_FLAG = "looted";
export const SET_FLAG_QUERY = "lootforge.setLootedFlag";
const SOCKET_EVENT = `module.${MODULE_ID}`;

/**
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
export function isLooted(tokenDoc) {
  return Boolean(tokenDoc?.getFlag?.(MODULE_ID, LOOTED_FLAG));
}

/**
 * Whether the current user can directly update the token document.
 * @param {TokenDocument} tokenDoc
 * @returns {boolean}
 */
function canUpdateToken(tokenDoc) {
  if (!tokenDoc) return false;
  if (game.user.isGM) return true;
  if (typeof tokenDoc.canUserModify === "function") {
    return tokenDoc.canUserModify(game.user, "update");
  }
  return tokenDoc.testUserPermission?.(game.user, "OWNER") ?? false;
}

/**
 * Apply the looted flag locally (caller must have permission).
 * @param {TokenDocument} tokenDoc
 * @param {boolean} value
 * @returns {Promise<TokenDocument>}
 */
async function applyLootedFlag(tokenDoc, value) {
  if (value) return tokenDoc.setFlag(MODULE_ID, LOOTED_FLAG, true);
  await tokenDoc.unsetFlag(MODULE_ID, LOOTED_FLAG);
  return tokenDoc;
}

/**
 * Register the CONFIG.queries handler during init.
 */
export function registerLootFlagQuery() {
  CONFIG.queries[SET_FLAG_QUERY] = async ({ tokenUuid, value }) => {
    if (!game.user.isGM) return { ok: false, error: "Not GM" };
    const tokenDoc = await fromUuid(tokenUuid);
    if (!tokenDoc) return { ok: false, error: "Token not found" };
    await applyLootedFlag(tokenDoc, Boolean(value));
    return { ok: true };
  };
}

/**
 * Register the socket fallback during ready (game.socket is available then).
 */
export function registerLootFlagSocket() {
  game.socket.on(SOCKET_EVENT, async (payload) => {
    if (!game.user.isGM) return;
    if (payload?.op !== "setLooted") return;
    try {
      const tokenDoc = await fromUuid(payload.tokenUuid);
      if (!tokenDoc) {
        game.socket.emit(SOCKET_EVENT, {
          op: "setLootedResult",
          requestId: payload.requestId,
          ok: false,
          error: "Token not found"
        });
        return;
      }
      await applyLootedFlag(tokenDoc, Boolean(payload.value));
      game.socket.emit(SOCKET_EVENT, {
        op: "setLootedResult",
        requestId: payload.requestId,
        ok: true
      });
    } catch (err) {
      console.error("LootForge | GM flag relay failed", err);
      game.socket.emit(SOCKET_EVENT, {
        op: "setLootedResult",
        requestId: payload.requestId,
        ok: false,
        error: String(err?.message ?? err)
      });
    }
  });
}

/**
 * Ask the active GM to set/unset the flag via socket ack.
 * @param {TokenDocument} tokenDoc
 * @param {boolean} value
 * @returns {Promise<TokenDocument>}
 */
function setLootedViaSocket(tokenDoc, value) {
  return new Promise((resolve, reject) => {
    const requestId = foundry.utils.randomID();
    const timeoutMs = 8000;

    const onResult = (payload) => {
      if (payload?.op !== "setLootedResult" || payload.requestId !== requestId) return;
      game.socket.off(SOCKET_EVENT, onResult);
      clearTimeout(timer);
      if (payload.ok) resolve(tokenDoc);
      else reject(new Error(payload.error || "GM flag update failed"));
    };

    const timer = setTimeout(() => {
      game.socket.off(SOCKET_EVENT, onResult);
      reject(new Error("Timed out waiting for GM to update loot flag"));
    }, timeoutMs);

    game.socket.on(SOCKET_EVENT, onResult);
    game.socket.emit(SOCKET_EVENT, {
      op: "setLooted",
      requestId,
      tokenUuid: tokenDoc.uuid,
      value: Boolean(value)
    });
  });
}

/**
 * @param {TokenDocument} tokenDoc
 * @param {boolean} value
 * @returns {Promise<TokenDocument|undefined>}
 */
export async function setLooted(tokenDoc, value = true) {
  if (!tokenDoc) {
    console.error("LootForge | setLooted called without a TokenDocument");
    return undefined;
  }

  if (canUpdateToken(tokenDoc)) {
    return applyLootedFlag(tokenDoc, Boolean(value));
  }

  const activeGM = game.users.activeGM;
  if (!activeGM) {
    ui.notifications.error(game.i18n.localize("LOOTFORGE.Notify.NeedGM"));
    throw new Error("LootForge | No active GM to persist looted flag");
  }

  if (typeof activeGM.query === "function" && CONFIG.queries?.[SET_FLAG_QUERY]) {
    const result = await activeGM.query(
      SET_FLAG_QUERY,
      { tokenUuid: tokenDoc.uuid, value: Boolean(value) },
      { timeout: 8000 }
    );
    if (!result?.ok) {
      throw new Error(result?.error || "GM query failed to update loot flag");
    }
    return tokenDoc;
  }

  return setLootedViaSocket(tokenDoc, value);
}

/**
 * GM helper to clear the looted flag for retesting.
 * @param {TokenDocument} tokenDoc
 * @returns {Promise<TokenDocument|undefined>}
 */
export async function resetLooted(tokenDoc) {
  if (!tokenDoc) return undefined;
  if (!game.user.isGM) {
    ui.notifications.warn(
      game.i18n.format("LOOTFORGE.Notify.PermissionDenied", { name: tokenDoc.name })
    );
    return undefined;
  }
  await applyLootedFlag(tokenDoc, false);
  ui.notifications.info(game.i18n.format("LOOTFORGE.Notify.FlagReset", { name: tokenDoc.name }));
  return tokenDoc;
}
