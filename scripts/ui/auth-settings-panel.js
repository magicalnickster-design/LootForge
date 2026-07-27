import { MODULE_ID } from "../modules/constants.js";
import { SETTING_AUTH_DEBUG } from "../auth/auth-constants.js";
import { getAccessStatus, refreshAccessAndPublish } from "../auth/access.js";
import { checkSubscription, getDiagnostics, stateMessage } from "../auth/entitlement-service.js";
import {
  logoutLootForge,
  openAccountPage,
  openLoginWindow
} from "../auth/login-window.js";

function getHtmlElement(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  return null;
}

function formatDisplayDate(value) {
  const ms = Date.parse(String(value ?? ""));
  if (!Number.isFinite(ms)) return "";
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return String(value ?? "");
  }
}

function buildAuthPanelContext() {
  const status = getAccessStatus();
  const diagnostics = getDiagnostics();
  return {
    accountLabel: status.accountLabel,
    plan: status.plan || "None",
    accessLabel: status.canUse
      ? game.i18n.localize("LOOTFORGE.Settings.Auth.AccessGranted")
      : game.i18n.localize("LOOTFORGE.Settings.Auth.AccessLocked"),
    expiresAt: formatDisplayDate(status.expiresAt) || "Not provided",
    authState: diagnostics.authState,
    authMessage: stateMessage(diagnostics.authState),
    worldActive: status.worldActive,
    signedIn: status.signedIn
  };
}

function rerenderAuthPanel(rootElement) {
  const panel = rootElement?.querySelector?.(".lootforge-auth-actions");
  if (!panel) return;
  const ctx = buildAuthPanelContext();
  const status = panel.querySelector(".lootforge-auth-status");
  if (!status) return;
  status.innerHTML = `
    <div><strong>Logged in as: ${foundry.utils.escapeHTML(ctx.accountLabel)}</strong></div>
    <div>Plan: ${foundry.utils.escapeHTML(ctx.plan)}</div>
    <div>${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Settings.Auth.AccessStatus"))}: ${foundry.utils.escapeHTML(ctx.accessLabel)}</div>
    <div>${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Access.Expires"))}: ${foundry.utils.escapeHTML(ctx.expiresAt)}</div>
    <div>State: ${foundry.utils.escapeHTML(ctx.authState)}</div>
    <div>Message: ${foundry.utils.escapeHTML(ctx.authMessage)}</div>
    <div>${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Settings.Auth.WorldAccess"))}: ${foundry.utils.escapeHTML(
      ctx.worldActive
        ? game.i18n.localize("LOOTFORGE.Settings.Auth.WorldUnlocked")
        : game.i18n.localize("LOOTFORGE.Settings.Auth.WorldLocked")
    )}</div>
  `;
}

export function registerAuthSettingsPanel() {
  Hooks.on("renderSettingsConfig", (_app, html) => {
    const rootElement = getHtmlElement(html);
    if (!rootElement) return;
    if (rootElement.querySelector(".lootforge-auth-actions")) return;

    const anchorInput = rootElement.querySelector(`input[name="${MODULE_ID}.${SETTING_AUTH_DEBUG}"]`);
    const anchorGroup = anchorInput?.closest(".form-group");
    if (!anchorGroup) return;

    const ctx = buildAuthPanelContext();
    const actions = document.createElement("div");
    actions.className = "form-group lootforge-auth-actions";
    actions.innerHTML = `
      <label>${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Settings.Auth.PanelLabel"))}</label>
      <div class="form-fields">
        <button type="button" class="lootforge-login"><i class="fas fa-right-to-bracket"></i> ${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Access.SignIn"))}</button>
        <button type="button" class="lootforge-sync-auth"><i class="fas fa-rotate"></i> ${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Access.SyncSubscription"))}</button>
        <button type="button" class="lootforge-logout"><i class="fas fa-right-from-bracket"></i> ${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Access.LogOut"))}</button>
        <button type="button" class="lootforge-forgot-password"><i class="fas fa-key"></i> ${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Access.ForgotPassword"))}</button>
        <button type="button" class="lootforge-create-account"><i class="fas fa-user-plus"></i> ${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Access.CreateAccount"))}</button>
      </div>
      <div class="notes lootforge-auth-status" style="margin-top:6px; line-height:1.4;">
        <div><strong>Logged in as: ${foundry.utils.escapeHTML(ctx.accountLabel)}</strong></div>
        <div>Plan: ${foundry.utils.escapeHTML(ctx.plan)}</div>
        <div>${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Settings.Auth.AccessStatus"))}: ${foundry.utils.escapeHTML(ctx.accessLabel)}</div>
        <div>${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Access.Expires"))}: ${foundry.utils.escapeHTML(ctx.expiresAt)}</div>
        <div>State: ${foundry.utils.escapeHTML(ctx.authState)}</div>
        <div>Message: ${foundry.utils.escapeHTML(ctx.authMessage)}</div>
        <div>${foundry.utils.escapeHTML(game.i18n.localize("LOOTFORGE.Settings.Auth.WorldAccess"))}: ${foundry.utils.escapeHTML(
          ctx.worldActive
            ? game.i18n.localize("LOOTFORGE.Settings.Auth.WorldUnlocked")
            : game.i18n.localize("LOOTFORGE.Settings.Auth.WorldLocked")
        )}</div>
      </div>
    `;
    anchorGroup.after(actions);

    actions.querySelector(".lootforge-login")?.addEventListener("click", async () => {
      const loggedIn = await openLoginWindow();
      if (loggedIn) await checkSubscription({ notify: true });
      rerenderAuthPanel(rootElement);
    });
    actions.querySelector(".lootforge-sync-auth")?.addEventListener("click", async () => {
      await checkSubscription({ notify: true });
      await refreshAccessAndPublish({ notify: false });
      rerenderAuthPanel(rootElement);
    });
    actions.querySelector(".lootforge-logout")?.addEventListener("click", async () => {
      await logoutLootForge();
      rerenderAuthPanel(rootElement);
    });
    actions.querySelector(".lootforge-forgot-password")?.addEventListener("click", () => openAccountPage());
    actions.querySelector(".lootforge-create-account")?.addEventListener("click", () => openAccountPage());
  });
}
