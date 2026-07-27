import { MODULE_ID } from "./constants.js";
import {
  DEFAULT_AUTH_API_BASE_URL,
  SETTING_AUTH_API_BASE_URL,
  SETTING_AUTH_DEBUG
} from "../auth/auth-constants.js";
import { registerSessionSettings } from "../auth/session-store.js";
import { registerEntitlementSettings } from "../auth/entitlement-service.js";
import { registerWorldAccessSettings } from "../auth/access.js";
import { registerAuthSettingsPanel } from "../ui/auth-settings-panel.js";

export function registerSettings() {
  registerSessionSettings();
  registerEntitlementSettings();
  registerWorldAccessSettings();
  registerAuthSettingsPanel();

  game.settings.register(MODULE_ID, SETTING_AUTH_API_BASE_URL, {
    name: "LOOTFORGE.Settings.Auth.ApiBaseUrl.Name",
    hint: "LOOTFORGE.Settings.Auth.ApiBaseUrl.Hint",
    scope: "client",
    config: false,
    type: String,
    default: DEFAULT_AUTH_API_BASE_URL,
    restricted: false
  });

  game.settings.register(MODULE_ID, SETTING_AUTH_DEBUG, {
    name: "LOOTFORGE.Settings.Auth.Debug.Name",
    hint: "LOOTFORGE.Settings.Auth.Debug.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });

  try {
    const configured = String(game.settings.get(MODULE_ID, SETTING_AUTH_API_BASE_URL) ?? "").trim();
    if (!configured) {
      void game.settings.set(MODULE_ID, SETTING_AUTH_API_BASE_URL, DEFAULT_AUTH_API_BASE_URL);
    }
  } catch {
    // ignore
  }

  const settings = [
    {
      key: "requireSurvivalRoll",
      name: "LOOTFORGE.Settings.RequireInvestigationRoll.Name",
      hint: "LOOTFORGE.Settings.RequireInvestigationRoll.Hint",
      default: true,
      config: false
    },
    {
      key: "defaultSurvivalDC",
      name: "LOOTFORGE.Settings.DefaultInvestigationTotal.Name",
      hint: "LOOTFORGE.Settings.DefaultInvestigationTotal.Hint",
      type: Number,
      default: 10,
      range: { min: 5, max: 30, step: 1 },
      config: false
    },
    {
      key: "manualGenerationOnly",
      name: "LOOTFORGE.Settings.ManualGenerationOnly.Name",
      hint: "LOOTFORGE.Settings.ManualGenerationOnly.Hint",
      default: true,
      config: false
    },
    {
      key: "allowPlayerRequestLoot",
      name: "LOOTFORGE.Settings.AllowPlayerRequestLoot.Name",
      hint: "LOOTFORGE.Settings.AllowPlayerRequestLoot.Hint",
      default: true,
      config: false
    },
    {
      key: "allowAllPlayersToLoot",
      name: "LOOTFORGE.Settings.AllowAllPlayersToLoot.Name",
      hint: "LOOTFORGE.Settings.AllowAllPlayersToLoot.Hint",
      default: true
    },
    {
      key: "preventDuplicateGeneration",
      name: "LOOTFORGE.Settings.PreventDuplicateGeneration.Name",
      hint: "LOOTFORGE.Settings.PreventDuplicateGeneration.Hint",
      default: true
    },
    {
      key: "showLootIndicators",
      name: "LOOTFORGE.Settings.ShowLootIndicators.Name",
      hint: "LOOTFORGE.Settings.ShowLootIndicators.Hint",
      default: true
    },
    {
      key: "enableRareDrops",
      name: "LOOTFORGE.Settings.EnableRareDrops.Name",
      hint: "LOOTFORGE.Settings.EnableRareDrops.Hint",
      default: true
    },
    {
      key: "debugLogging",
      name: "LOOTFORGE.Settings.DebugLogging.Name",
      hint: "LOOTFORGE.Settings.DebugLogging.Hint",
      default: false
    }
  ];

  for (const s of settings) {
    game.settings.register(MODULE_ID, s.key, {
      name: s.name,
      hint: s.hint,
      scope: "world",
      config: s.config !== false,
      type: s.type ?? Boolean,
      default: s.default,
      range: s.range,
      requiresReload: false
    });
  }
}

export function getSetting(key) {
  return game.settings.get(MODULE_ID, key);
}
