import { MODULE_ID } from "./constants.js";

/**
 * Register world settings for LootForge.
 */
export function registerSettings() {
  const settings = [
    {
      key: "manualGenerationOnly",
      name: "LOOTFORGE.Settings.ManualGenerationOnly.Name",
      hint: "LOOTFORGE.Settings.ManualGenerationOnly.Hint",
      default: true
    },
    {
      // Legacy key kept so existing worlds do not error; always ignored — Investigation is mandatory.
      key: "requireSurvivalRoll",
      name: "LOOTFORGE.Settings.RequireInvestigationRoll.Name",
      hint: "LOOTFORGE.Settings.RequireInvestigationRoll.Hint",
      default: true
    },
    {
      // Legacy key: unused fallback (Investigation is always rolled).
      key: "defaultSurvivalDC",
      name: "LOOTFORGE.Settings.DefaultInvestigationTotal.Name",
      hint: "LOOTFORGE.Settings.DefaultInvestigationTotal.Hint",
      type: Number,
      default: 10,
      range: { min: 5, max: 30, step: 1 }
    },
    {
      key: "allowAllPlayersToLoot",
      name: "LOOTFORGE.Settings.AllowAllPlayersToLoot.Name",
      hint: "LOOTFORGE.Settings.AllowAllPlayersToLoot.Hint",
      default: true
    },
    {
      key: "allowPlayerRequestLoot",
      name: "LOOTFORGE.Settings.AllowPlayerRequestLoot.Name",
      hint: "LOOTFORGE.Settings.AllowPlayerRequestLoot.Hint",
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
      config: s.key !== "requireSurvivalRoll" && s.key !== "defaultSurvivalDC",
      type: s.type ?? Boolean,
      default: s.default,
      range: s.range,
      requiresReload: false
    });
  }
}

/**
 * @param {string} key
 * @returns {*}
 */
export function getSetting(key) {
  return game.settings.get(MODULE_ID, key);
}
