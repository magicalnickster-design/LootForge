/**
 * Dwarf — civilized humanoid multi-pool profile.
 */

import {
  CIVILIZED_EQUIPMENT,
  civilizedCurrency,
  junkPool,
  storyPool,
  trinketPool
} from "./_humanoid-pools.js";

/** @type {import("../creature-profiles.js").CreatureProfile} */
export const dwarfProfile = {
  id: "dwarf",
  matchNames: ["dwarf"],
  matchWholeWords: true,
  matchTypes: ["humanoid"],
  matchSubtypes: ["dwarf"],
  excludeNames: ["duergar"],
  pools: {
    monsterParts: {
      type: "definitions",
      drops: [
        {
          definitionId: "dwarf-blood-vial",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.28,
            standard: 0.48,
            good: 0.68,
            excellent: 0.88,
            exceptional: 1
          },
          guaranteedFallback: true
        },
        {
          definitionId: "dwarf-beard-braid",
          quantityByQuality: {
            poor: [0, 1],
            standard: [0, 1],
            good: [1, 1],
            excellent: [1, 1],
            exceptional: [1, 2]
          },
          chanceByQuality: {
            poor: 0.35,
            standard: 0.55,
            good: 0.72,
            excellent: 0.88,
            exceptional: 1
          },
          guaranteedFallback: true
        }
      ]
    },
    currency: civilizedCurrency({
      cp: { min: 2, max: 20, chance: 0.9 },
      sp: { min: 1, max: 16, chance: 0.95 },
      gp: { min: 0, max: 12, chance: 0.55 }
    }, { cp: 2, sp: 1, gp: 0.75 }),
    equipment: {
      ...CIVILIZED_EQUIPMENT,
      chances: {
        ...CIVILIZED_EQUIPMENT.chances,
        weapon: 0.82,
        armor: 0.55,
        tool: 0.45
      },
      qualityWeightsByRollQuality: {
        poor: { broken: 0.15, worn: 0.3, standard: 0.4, fine: 0.12, masterwork: 0.03 },
        standard: { broken: 0.06, worn: 0.22, standard: 0.42, fine: 0.24, masterwork: 0.06 },
        good: { broken: 0.02, worn: 0.12, standard: 0.4, fine: 0.32, masterwork: 0.14 },
        excellent: { broken: 0.01, worn: 0.06, standard: 0.32, fine: 0.4, masterwork: 0.21 },
        exceptional: { broken: 0, worn: 0.04, standard: 0.24, fine: 0.38, masterwork: 0.34 }
      }
    },
    junk: junkPool([
      "forged-nail",
      "coal-dust-pouch",
      "whetstone-chip",
      "cracked-mug",
      "old-boot"
    ]),
    trinkets: trinketPool([
      "iron-beard-ring",
      "clan-crest-chip",
      "copper-ring",
      "bone-necklace"
    ]),
    story: storyPool([
      "mining-claim",
      "ale-stained-mug",
      "caravan-schedule",
      "scribbled-note"
    ])
  }
};
