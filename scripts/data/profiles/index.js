/**
 * Creature profile registry.
 *
 * Add a new creature by creating `profiles/<name>.js` and registering it here.
 * Do not put creature-specific branching in the loot generator.
 */

import { animatedArmorProfile } from "./animated-armor.js";
import { containerProfile } from "./container.js";
import { dragonProfile } from "./dragon.js";
import { goblinProfile } from "./goblin.js";
import { orcProfile } from "./orc.js";
import { spiderProfile } from "./spider.js";
import { wolfProfile } from "./wolf.js";

/**
 * Specific profiles first (spider before wolf, etc.).
 * Registry key may differ from profile.id (animatedArmor → animated-armor).
 */
export const PROFILE_ORDER = ["container", "spider", "animatedArmor", "goblin", "orc", "dragon", "wolf"];

/** @type {Record<string, import("../creature-profiles.js").CreatureProfile>} */
export const CREATURE_PROFILES = {
  container: containerProfile,
  spider: spiderProfile,
  animatedArmor: animatedArmorProfile,
  goblin: goblinProfile,
  orc: orcProfile,
  dragon: dragonProfile,
  wolf: wolfProfile
};

/**
 * @param {import("../creature-profiles.js").CreatureProfile} profile
 * @param {string} nameLower
 * @returns {boolean}
 */
function nameHitsProfile(profile, nameLower) {
  if (profile.excludeNames?.some((ex) => nameLower.includes(ex))) return false;

  return (profile.matchNames ?? []).some((needle) => {
    if (!needle) return false;
    if (profile.matchWholeWords) {
      const re = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      return re.test(nameLower);
    }
    return nameLower.includes(needle);
  });
}

/**
 * Resolve a creature profile from normalized context / actor name.
 * @param {object} context  Result of buildCreatureContext
 * @returns {import("../creature-profiles.js").CreatureProfile|null}
 */
export function resolveCreatureProfile(context) {
  if (!context) return null;

  // Chests / blank containers always use the container multi-pool profile.
  if (context.isContainer) return CREATURE_PROFILES.container;

  const name = String(context.name ?? "").toLowerCase();
  const type = String(context.creatureType ?? "").toLowerCase();
  const subtype = String(context.creatureSubtype ?? "").toLowerCase();

  const ordered = [
    ...PROFILE_ORDER.map((key) => CREATURE_PROFILES[key]).filter(Boolean),
    ...Object.entries(CREATURE_PROFILES)
      .filter(([key]) => !PROFILE_ORDER.includes(key))
      .map(([, profile]) => profile)
  ];

  for (const profile of ordered) {
    const nameHit = nameHitsProfile(profile, name);
    const subtypeHit = profile.matchSubtypes?.some((s) => subtype.includes(s))
      && !profile.excludeNames?.some((ex) => name.includes(ex) || subtype.includes(ex));
    const typeOk = !profile.matchTypes?.length || profile.matchTypes.includes(type);

    if ((nameHit || subtypeHit) && typeOk) return profile;
    if (nameHit) return profile;
  }

  return null;
}
