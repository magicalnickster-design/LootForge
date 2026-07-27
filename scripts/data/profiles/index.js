import { ancientRedDragonProfile } from "./ancient-red-dragon.js";
import { krakenProfile } from "./kraken.js";
import { tarrasqueProfile } from "./tarrasque.js";
import { demonLordProfile } from "./demon-lord.js";
import { archmageProfile } from "./archmage.js";
import { lichKingProfile } from "./lich-king.js";
import { aberrationProfile } from "./aberration.js";
import { animatedArmorProfile } from "./animated-armor.js";
import { constructProfile } from "./construct.js";
import { plantProfile } from "./plant.js";
import { celestialProfile } from "./celestial.js";
import { bugbearProfile } from "./bugbear.js";
import { containerProfile } from "./container.js";
import { dragonProfile } from "./dragon.js";
import { dwarfProfile } from "./dwarf.js";
import { elementalProfile } from "./elemental.js";
import { elfProfile } from "./elf.js";
import { feyProfile } from "./fey.js";
import { fiendProfile } from "./fiend.js";
import { giantProfile } from "./giant.js";
import { goblinProfile } from "./goblin.js";
import { hobgoblinProfile } from "./hobgoblin.js";
import { stockHumanoidProfile } from "./stock-humanoid.js";
import { genericHumanoidProfile } from "./generic-humanoid.js";
import { genericUndeadProfile } from "./generic-undead.js";
import { halflingProfile } from "./halfling.js";
import { humanProfile } from "./human.js";
import { lichProfile } from "./lich.js";
import { monstrosityProfile } from "./monstrosity.js";
import { mummyProfile } from "./mummy.js";
import { oozeProfile } from "./ooze.js";
import { orcProfile } from "./orc.js";
import { skeletonProfile } from "./skeleton.js";
import { spiderProfile } from "./spider.js";
import { wolfProfile } from "./wolf.js";
import { beastProfile } from "./beast.js";
import { zombieProfile } from "./zombie.js";
import { unknownCreatureProfile } from "./unknown.js";

export const PROFILE_ORDER = [
  "container",
  "ancientRedDragon",
  "kraken",
  "tarrasque",
  "demonLord",
  "lichKing",
  "archmage",
  "spider",
  "beast",
  "animatedArmor",
  "construct",
  "plant",
  "celestial",
  "bugbear",
  "goblin",
  "hobgoblin",
  "stockHumanoid",
  "elf",
  "dwarf",
  "halfling",
  "human",
  "orc",
  "ooze",
  "aberration",
  "elemental",
  "giant",
  "monstrosity",
  "fey",
  "fiend",
  "dragon",
  "lich",
  "mummy",
  "skeleton",
  "zombie",
  "genericUndead",
  "wolf"
];

export const CREATURE_PROFILES = {
  container: containerProfile,
  ancientRedDragon: ancientRedDragonProfile,
  kraken: krakenProfile,
  tarrasque: tarrasqueProfile,
  demonLord: demonLordProfile,
  lichKing: lichKingProfile,
  archmage: archmageProfile,
  spider: spiderProfile,
  beast: beastProfile,
  animatedArmor: animatedArmorProfile,
  construct: constructProfile,
  plant: plantProfile,
  celestial: celestialProfile,
  goblin: goblinProfile,
  hobgoblin: hobgoblinProfile,
  stockHumanoid: stockHumanoidProfile,
  genericHumanoid: genericHumanoidProfile,
  bugbear: bugbearProfile,
  elf: elfProfile,
  dwarf: dwarfProfile,
  halfling: halflingProfile,
  human: humanProfile,
  orc: orcProfile,
  ooze: oozeProfile,
  aberration: aberrationProfile,
  elemental: elementalProfile,
  giant: giantProfile,
  monstrosity: monstrosityProfile,
  fey: feyProfile,
  fiend: fiendProfile,
  dragon: dragonProfile,
  lich: lichProfile,
  mummy: mummyProfile,
  skeleton: skeletonProfile,
  zombie: zombieProfile,
  genericUndead: genericUndeadProfile,
  wolf: wolfProfile,
  unknown: unknownCreatureProfile
};

export const TYPE_FALLBACKS = {
  aberration: aberrationProfile,
  beast: beastProfile,
  celestial: celestialProfile,
  construct: constructProfile,
  dragon: dragonProfile,
  elemental: elementalProfile,
  fey: feyProfile,
  fiend: fiendProfile,
  giant: giantProfile,
  humanoid: genericHumanoidProfile,
  monstrosity: monstrosityProfile,
  ooze: oozeProfile,
  plant: plantProfile,
  undead: genericUndeadProfile,
  swarm: beastProfile
};

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

export function resolveCreatureProfile(context) {
  if (!context) return null;

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

  if (type && TYPE_FALLBACKS[type]) return TYPE_FALLBACKS[type];

  return CREATURE_PROFILES.unknown;
}
