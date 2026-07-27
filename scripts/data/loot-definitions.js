/**
 * LootForge definition registry.
 *
 * Canonical Item documents live in the module compendium:
 *   Compendium.lootforge.loot-items
 *
 * This file maps stable definitionIds → compendium UUIDs and keeps a thin
 * fallback snapshot for worlds where UUID resolution is unavailable.
 */

import { MODULE_ID } from "../modules/constants.js";

/** Pack collection id as declared in module.json. */
export const LOOT_ITEMS_PACK = `${MODULE_ID}.loot-items`;

/**
 * @typedef {object} LootDefinition
 * @property {string} id
 * @property {string} itemUuid              Canonical Compendium UUID
 * @property {string} documentId            Fixed pack document _id
 * @property {string} name                  Display name (UI / fallback)
 * @property {string} category
 * @property {string} rarity
 * @property {string[]} tags
 * @property {string} img
 * @property {string} description
 * @property {{ value: number, denomination: string }} price
 * @property {{ value: number, units: string }} weight
 */

/**
 * Stable document IDs used when packing packs/src/loot-items.
 * Changing these breaks existing UUID references — treat as immutable.
 */
const DOC_IDS = Object.freeze({
  "wolf-pelt": "LFWolfPelt000001",
  "wolf-fang": "LFWolfFang000001",
  "wolf-meat": "LFWolfMeat000001",
  "wolf-claw": "LFWolfClaw000001",
  "alpha-wolf-fang": "LFAlphaFang00001",
  "spider-silk": "LFSpiderSilk0001",
  "spider-fang": "LFSpiderFang0001",
  "spider-venom-gland": "LFSpiderVenom001",
  "spider-eye": "LFSpiderEye00001",
  "salvaged-padded-armor": "LFSalvPadArm0001",
  "salvaged-chain-shirt": "LFSalvChain00001",
  "salvaged-scale-mail": "LFSalvScale00001",
  "salvaged-breastplate": "LFSalvBreast0001",
  "salvaged-plate-armor": "LFSalvPlate00001",
  "goblin-ear": "LFGoblinEar00000",
  "goblin-tooth": "LFGoblinTooth000",
  "goblin-finger-bone": "LFGoblinFBone000",
  "goblin-blood-vial": "LFGoblinBlood000",
  "bent-spoon": "LFBentSpoon00000",
  "dirty-rag": "LFDirtyRag000000",
  "broken-pipe": "LFBrokenPipe0000",
  "empty-bottle": "LFEmptyBottle000",
  "dice": "LFDiceSet0000000",
  "cracked-mug": "LFCrackedMug0000",
  "old-boot": "LFOldBoot0000000",
  "copper-ring": "LFCopperRing0000",
  "bone-necklace": "LFBoneNecklace00",
  "lucky-rabbit-foot": "LFLuckyRabbit000",
  "small-idol": "LFSmallIdol00000",
  "decorative-feather": "LFDecorFeather00",
  "goblin-journal": "LFGoblinJournal0",
  "crude-map": "LFCrudeMap000000",
  "wanted-poster": "LFWantedPoster00",
  "caravan-schedule": "LFCaravanSched00",
  "bandit-orders": "LFBanditOrders00",
  "scribbled-note": "LFScribbledNote0",
  "orc-tusk": "LFOrcTusk0000000",
  "orc-ear": "LFOrcEar00000000",
  "orc-blood-vial": "LFOrcBlood000000",
  "orc-heart": "LFOrcHeart000000",
  "war-paint-pot": "LFWarPaint000000",
  "gnawed-bone": "LFGnawedBone0000",
  "rusty-nail-pouch": "LFRustyNail00000",
  "iron-nose-ring": "LFIronNoseRing00",
  "crude-totem": "LFCrudeTotem0000",
  "tusk-pendant": "LFTuskPendant000",
  "orc-war-orders": "LFOrcWarOrders00",
  "raid-map": "LFRaidMap0000000",
  "clan-marking": "LFClanMarking000",
  "blood-oath-scrap": "LFBloodOath00000",
  "spider-chitin": "LFSpiderChitin00",
  "spinneret": "LFSpinneret00000",
  "sticky-web-clump": "LFStickyWeb00000",
  "empty-cocoon": "LFEmptyCocoon000",
  "brittle-leg-segment": "LFBrittleLeg0000",
  "web-wrapped-coin": "LFWebCoin0000000",
  "iridescent-chitin-shard": "LFIridChitin0000",
  "fang-charm": "LFFangCharm00000",
  "cocooned-journal": "LFCocoonJournal0",
  "prey-keepsake": "LFPreyKeepsake00",
  "webbing-scrawl": "LFWebbingScrawl0",
  "dragon-scale": "LFDragonScale000",
  "dragon-fang": "LFDragonFang0000",
  "dragon-claw": "LFDragonClaw0000",
  "dragon-blood-vial": "LFDragonBlood000",
  "dragon-hide": "LFDragonHide0000",
  "dragon-horn": "LFDragonHorn0000",
  "dragon-heart": "LFDragonHeart000",
  "scorched-bone": "LFScorchedBone00",
  "cracked-scale-shard": "LFCrackScale0000",
  "sulfur-lump": "LFSulfurLump0000",
  "ash-clump": "LFAshClump000000",
  "polished-dragon-scale": "LFPolishScale000",
  "dragon-tooth-pendant": "LFDragToothPend0",
  "hoard-gem-chip": "LFHoardGemChip00",
  "hoard-ledger": "LFHoardLedger000",
  "territorial-claim": "LFTerritoryClaim",
  "rival-challenge": "LFRivalChallenge",
  "scorched-map": "LFScorchedMap000",
  "bugbear-ear": "LFBugbearEar0000",
  "bugbear-fang": "LFBugbearFang000",
  "bugbear-hide-scrap": "LFBugbearHide000",
  "bugbear-heart": "LFBugbearHeart00",
  "mangy-fur-tuft": "LFMangyFur000000",
  "greasy-strap": "LFGreasyStrap000",
  "bone-earring": "LFBoneEarring000",
  "crude-nose-bone": "LFCrudeNoseBone0",
  "bugbear-orders": "LFBugbearOrders0",
  "raid-tally": "LFRaidTally00000",
  "ectoplasm-vial": "LFEctoplasm00000",
  "grave-dirt": "LFGraveDirt00000",
  "burial-coin": "LFBurialCoin0000",
  "broken-holy-symbol": "LFBrokenHolySym0",
  "rotten-flesh": "LFRottenFlesh000",
  "zombie-tooth": "LFZombieTooth000",
  "zombie-hand": "LFZombieHand0000",
  "burial-shroud-scrap": "LFBurialShroud00",
  "coffin-nail": "LFCoffinNail0000",
  "unfinished-will": "LFUnfinishedWill",
  "bone-shard": "LFBoneShard00000",
  "yellowed-rib": "LFYellowedRib000",
  "skeleton-finger": "LFSkeletonFingr0",
  "rusted-mail-link": "LFRustedMailLnk0",
  "polished-knuckle": "LFPolishKnuckle0",
  "ancient-epitaph": "LFAncientEpitap0",
  "mummy-bandage": "LFMummyBandage00",
  "withered-flesh": "LFWitheredFlesh0",
  "canopic-dust": "LFCanopicDust000",
  "mummy-heart": "LFMummyHeart0000",
  "scarab-bead": "LFScarabBead0000",
  "hieroglyph-scrap": "LFHieroglyph0000",
  "curse-tablet": "LFCurseTablet000",
  "lich-dust": "LFLichDust000000",
  "necrotic-crystal": "LFNecroCrystal00",
  "soul-ash": "LFSoulAsh0000000",
  "phylactery-shard": "LFPhylactShard00",
  "void-wax-candle": "LFVoidWaxCandl00",
  "obsidian-focus": "LFObsidianFocus0",
  "soul-gem-chip": "LFSoulGemChip000",
  "phylactery-notes": "LFPhylactNotes00",
  "spell-research-page": "LFSpellResearch0",
  "lichdom-formula": "LFLichdomFormul0",
  "human-blood-vial": "LFHumanBlood0000",
  "human-hair-lock": "LFHumanHair00000",
  "worn-insignia": "LFWornInsignia00",
  "travelers-token": "LFTravelToken000",
  "crumpled-receipt": "LFCrumpledRcpt00",
  "torn-ledger-page": "LFTornLedger0000",
  "guild-letter": "LFGuildLetter000",
  "bandit-pass": "LFBanditPass0000",
  "love-letter": "LFLoveLetter0000",
  "elf-blood-vial": "LFElfBlood000000",
  "elf-hair-lock": "LFElfHair0000000",
  "moon-silver-splinter": "LFMoonSilver0000",
  "elven-arrowhead": "LFElvenArrow0000",
  "silver-leaf-charm": "LFSilverLeaf0000",
  "perfume-vial": "LFPerfumeVial000",
  "silk-scrap": "LFSilkScrap00000",
  "elven-poetry-scrap": "LFElfPoetry00000",
  "woodland-map": "LFWoodlandMap000",
  "dwarf-blood-vial": "LFDwarfBlood0000",
  "dwarf-beard-braid": "LFDwarfBeard0000",
  "iron-beard-ring": "LFIronBeardRing0",
  "forged-nail": "LFForgedNail0000",
  "coal-dust-pouch": "LFCoalDust000000",
  "whetstone-chip": "LFWhetstoneChip0",
  "clan-crest-chip": "LFClanCrestChip0",
  "mining-claim": "LFMiningClaim000",
  "ale-stained-mug": "LFAleMug00000000",
  "halfling-blood-vial": "LFHalfBlood00000",
  "halfling-hair-lock": "LFHalfHair000000",
  "halfling-pipe": "LFHalflingPipe00",
  "lucky-charm": "LFLuckyCharm0000",
  "harvest-apple": "LFHarvestApple00",
  "pocket-handkerchief": "LFPocketHanky000",
  "recipe-card": "LFRecipeCard0000",
  "county-fair-ticket": "LFFairTicket0000",
  "shire-map-scrap": "LFShireMapScrap0",
  "fiend-ichor": "LFFiendIchor0000",
  "fiend-horn": "LFFiendHorn00000",
  "brimstone-chunk": "LFBrimstoneChk00",
  "hellhound-fang": "LFHellhoundFang0",
  "hellhound-hide": "LFHellhoundHide0",
  "imp-wing": "LFImpWing0000000",
  "quasit-claw": "LFQuasitClaw0000",
  "barbed-spine": "LFBarbedSpine000",
  "devil-chain-link": "LFDevilChainLnk0",
  "bone-spur": "LFBoneSpur000000",
  "pit-fiend-scale": "LFPitFiendScale0",
  "balor-ash": "LFBalorAsh000000",
  "soul-coin-chip": "LFSoulCoinChip00",
  "brimstone-charm": "LFBrimstoneChrm0",
  "infernal-seal": "LFInfernalSeal00",
  "abyssal-rune-shard": "LFAbyssalRune000",
  "scorched-scrap": "LFScorchedScrap0",
  "melted-coin": "LFMeltedCoin0000",
  "sulfur-stained-cloth": "LFSulfurCloth000",
  "infernal-contract": "LFInfernalContr0",
  "blood-war-orders": "LFBloodWarOrdr00",
  "cultist-summons": "LFCultistSummns0",
  "soul-ledger": "LFSoulLedger0000",
  "fey-dust": "LFFeyDust0000000",
  "fey-blood-vial": "LFFeyBlood000000",
  "pixie-wing": "LFPixieWing00000",
  "dryad-bark": "LFDryadBark00000",
  "satyr-horn": "LFSatyrHorn00000",
  "redcap-tooth": "LFRedcapTooth000",
  "hag-hair": "LFHagHair0000000",
  "hag-eye": "LFHagEye00000000",
  "fairy-ring-mushroom": "LFFairyMushroom0",
  "moonbeam-crystal": "LFMoonbeamCryst0",
  "iron-nail-ward": "LFIronNailWard00",
  "hag-eye-amulet": "LFHagEyeAmulet00",
  "wilted-petal": "LFWiltedPetal000",
  "tangled-vine": "LFTangledVine000",
  "torn-ribbon": "LFTornRibbon0000",
  "bloodstained-cap": "LFBloodCapScrap0",
  "fey-bargain-scrap": "LFFeyBargain0000",
  "court-invitation": "LFCourtInvite000",
  "hag-coven-note": "LFHagCovenNote00",
  "stolen-name-list": "LFStolenNames000",
  "monstrosity-hide": "LFMonstroHide000",
  "monstrosity-fang": "LFMonstroFang000",
  "owlbear-feather": "LFOwlbearFeath00",
  "owlbear-claw": "LFOwlbearClaw000",
  "basilisk-eye": "LFBasiliskEye000",
  "basilisk-scale": "LFBasiliskScal00",
  "cockatrice-feather": "LFCockatriceFt00",
  "chimera-horn": "LFChimeraHorn000",
  "griffon-feather": "LFGriffonFeath00",
  "manticore-spike": "LFManticoreSpk00",
  "hydra-tooth": "LFHydraTooth0000",
  "bulette-plate": "LFBulettePlate00",
  "ankheg-chitin": "LFAnkhegChitin00",
  "ankheg-acid-sac": "LFAnkhegAcidSa00",
  "purple-worm-tooth": "LFPurpleWormTt00",
  "mimic-adhesive": "LFMimicAdhesiv00",
  "roper-tendril": "LFRoperTendril00",
  "petrified-chip": "LFPetrifiedChp00",
  "nest-egg-shard": "LFNestEggShard00",
  "shed-scale": "LFShedScale00000",
  "sticky-residue": "LFStickyResidu00",
  "dug-up-pebble": "LFDugUpPebble000",
  "hunter-warning": "LFHunterWarnin00",
  "nest-map-scrap": "LFNestMapScrap00",
  "worm-tunnel-chart": "LFWormTunnelCh00",
});

/**
 * @param {string} documentId
 * @returns {string}
 */
export function compendiumItemUuid(documentId) {
  return `Compendium.${LOOT_ITEMS_PACK}.Item.${documentId}`;
}

/** @type {Record<string, LootDefinition>} */
export const LOOT_DEFINITIONS = {
  "wolf-pelt": {
    id: "wolf-pelt",
    documentId: DOC_IDS["wolf-pelt"],
    itemUuid: compendiumItemUuid(DOC_IDS["wolf-pelt"]),
    name: "Wolf Pelt",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "wolf", "hide", "leatherworking"],
    img: `modules/${MODULE_ID}/assets/items/wolf-pelt.svg`,
    description:
      "A rough hide taken from a slain wolf. Useful to hunters, leatherworkers, and cold-weather travelers.",
    price: { value: 8, denomination: "sp" },
    weight: { value: 4, units: "lb" }
  },
  "wolf-fang": {
    id: "wolf-fang",
    documentId: DOC_IDS["wolf-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["wolf-fang"]),
    name: "Wolf Fang",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "wolf", "bone", "trophy"],
    img: `modules/${MODULE_ID}/assets/items/wolf-fang.svg`,
    description:
      "A sharp canine tooth often used in trophies, charms, or primitive jewelry.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.1, units: "lb" }
  },
  "wolf-meat": {
    id: "wolf-meat",
    documentId: DOC_IDS["wolf-meat"],
    itemUuid: compendiumItemUuid(DOC_IDS["wolf-meat"]),
    name: "Wolf Meat",
    category: "crafting-material",
    rarity: "common",
    tags: ["beast", "wolf", "meat", "cooking"],
    img: `modules/${MODULE_ID}/assets/items/wolf-meat.svg`,
    description:
      "Raw meat harvested from a wolf. Edible when properly prepared, though most civilized settlements consider it poor fare.",
    price: { value: 3, denomination: "sp" },
    weight: { value: 2, units: "lb" }
  },
  "wolf-claw": {
    id: "wolf-claw",
    documentId: DOC_IDS["wolf-claw"],
    itemUuid: compendiumItemUuid(DOC_IDS["wolf-claw"]),
    name: "Wolf Claw",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "wolf", "claw", "crafting"],
    img: `modules/${MODULE_ID}/assets/items/wolf-claw.svg`,
    description:
      "A curved claw suitable for use in jewelry, fetishes, or minor crafting recipes.",
    price: { value: 1, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "alpha-wolf-fang": {
    id: "alpha-wolf-fang",
    documentId: DOC_IDS["alpha-wolf-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["alpha-wolf-fang"]),
    name: "Alpha Wolf Fang",
    category: "rare-collectible",
    rarity: "uncommon",
    tags: ["beast", "wolf", "trophy", "rare"],
    img: `modules/${MODULE_ID}/assets/items/alpha-wolf-fang.svg`,
    description:
      "An unusually large fang from a powerful wolf. Hunters value it as proof of a dangerous kill.",
    price: { value: 2, denomination: "gp" },
    weight: { value: 0.1, units: "lb" }
  },

  "spider-silk": {
    id: "spider-silk",
    documentId: DOC_IDS["spider-silk"],
    itemUuid: compendiumItemUuid(DOC_IDS["spider-silk"]),
    name: "Spider Silk",
    category: "crafting-material",
    rarity: "common",
    tags: ["beast", "spider", "silk", "crafting"],
    img: `modules/${MODULE_ID}/assets/items/spider-silk.svg`,
    description:
      "Tough, sticky silk harvested from a spider. Valued by weavers, alchemists, and trapmakers.",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.5, units: "lb" }
  },
  "spider-fang": {
    id: "spider-fang",
    documentId: DOC_IDS["spider-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["spider-fang"]),
    name: "Spider Fang",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "spider", "fang", "trophy"],
    img: `modules/${MODULE_ID}/assets/items/spider-fang.svg`,
    description:
      "A hollow fang capable of delivering venom. Useful as a trophy or for crude poison work.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.1, units: "lb" }
  },
  "spider-venom-gland": {
    id: "spider-venom-gland",
    documentId: DOC_IDS["spider-venom-gland"],
    itemUuid: compendiumItemUuid(DOC_IDS["spider-venom-gland"]),
    name: "Spider Venom Gland",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["beast", "spider", "venom", "alchemy"],
    img: `modules/${MODULE_ID}/assets/items/spider-venom-gland.svg`,
    description:
      "A small sac still holding diluted spider venom. Alchemists prize intact glands.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.2, units: "lb" }
  },
  "spider-eye": {
    id: "spider-eye",
    documentId: DOC_IDS["spider-eye"],
    itemUuid: compendiumItemUuid(DOC_IDS["spider-eye"]),
    name: "Spider Eye",
    category: "monster-part",
    rarity: "common",
    tags: ["beast", "spider", "eye", "alchemy"],
    img: `modules/${MODULE_ID}/assets/items/spider-eye.svg`,
    description:
      "A glossy spider eye, sometimes used in potions or as a macabre curio.",
    price: { value: 1, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },

  "salvaged-padded-armor": {
    id: "salvaged-padded-armor",
    documentId: DOC_IDS["salvaged-padded-armor"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-padded-armor"]),
    name: "Salvaged Padded Armor",
    category: "salvaged-armor",
    rarity: "common",
    tags: ["construct", "armor", "salvage", "light"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-padded-armor.svg`,
    description:
      "Battered padding pulled from animated armor. Barely serviceable as light protection (AC 11).",
    price: { value: 5, denomination: "gp" },
    weight: { value: 8, units: "lb" }
  },
  "salvaged-chain-shirt": {
    id: "salvaged-chain-shirt",
    documentId: DOC_IDS["salvaged-chain-shirt"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-chain-shirt"]),
    name: "Salvaged Chain Shirt",
    category: "salvaged-armor",
    rarity: "common",
    tags: ["construct", "armor", "salvage", "medium"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-chain-shirt.svg`,
    description:
      "A usable chain shirt recovered from animated armor. Offers modest protection (AC 13).",
    price: { value: 50, denomination: "gp" },
    weight: { value: 20, units: "lb" }
  },
  "salvaged-scale-mail": {
    id: "salvaged-scale-mail",
    documentId: DOC_IDS["salvaged-scale-mail"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-scale-mail"]),
    name: "Salvaged Scale Mail",
    category: "salvaged-armor",
    rarity: "common",
    tags: ["construct", "armor", "salvage", "medium"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-scale-mail.svg`,
    description:
      "Overlapping scales still fastened after the construct fell. Solid medium armor (AC 14).",
    price: { value: 50, denomination: "gp" },
    weight: { value: 45, units: "lb" }
  },
  "salvaged-breastplate": {
    id: "salvaged-breastplate",
    documentId: DOC_IDS["salvaged-breastplate"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-breastplate"]),
    name: "Salvaged Breastplate",
    category: "salvaged-armor",
    rarity: "uncommon",
    tags: ["construct", "armor", "salvage", "medium"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-breastplate.svg`,
    description:
      "A well-kept breastplate salvaged from animated armor. Strong medium protection (AC 14).",
    price: { value: 400, denomination: "gp" },
    weight: { value: 20, units: "lb" }
  },
  "salvaged-plate-armor": {
    id: "salvaged-plate-armor",
    documentId: DOC_IDS["salvaged-plate-armor"],
    itemUuid: compendiumItemUuid(DOC_IDS["salvaged-plate-armor"]),
    name: "Salvaged Plate Armor",
    category: "salvaged-armor",
    rarity: "uncommon",
    tags: ["construct", "armor", "salvage", "heavy"],
    img: `modules/${MODULE_ID}/assets/items/salvaged-plate-armor.svg`,
    description:
      "Nearly intact plate recovered from a powerful animated construct. Heavy armor (AC 18).",
    price: { value: 1500, denomination: "gp" },
    weight: { value: 65, units: "lb" }
  },

  "goblin-ear": {
    id: "goblin-ear",
    documentId: DOC_IDS["goblin-ear"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-ear"]),
    name: "Goblin Ear",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","goblin","trophy"],
    img: `modules/${MODULE_ID}/assets/items/goblin-ear.svg`,
    description: "A severed goblin ear — crude proof of a kill, sometimes collected by bounty hunters.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.1, units: "lb" }
  },
  "goblin-tooth": {
    id: "goblin-tooth",
    documentId: DOC_IDS["goblin-tooth"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-tooth"]),
    name: "Goblin Tooth",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","goblin","bone"],
    img: `modules/${MODULE_ID}/assets/items/goblin-tooth.svg`,
    description: "A yellowed goblin tooth, often drilled for necklaces or thrown into foul stew pots.",
    price: { value: 1, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "goblin-finger-bone": {
    id: "goblin-finger-bone",
    documentId: DOC_IDS["goblin-finger-bone"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-finger-bone"]),
    name: "Goblin Finger Bone",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","goblin","bone"],
    img: `modules/${MODULE_ID}/assets/items/goblin-finger-bone.svg`,
    description: "A small finger bone cleaned of flesh. Goblins sometimes use them as charms.",
    price: { value: 5, denomination: "cp" },
    weight: { value: 0.05, units: "lb" }
  },
  "goblin-blood-vial": {
    id: "goblin-blood-vial",
    documentId: DOC_IDS["goblin-blood-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-blood-vial"]),
    name: "Goblin Blood Vial",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["humanoid","goblin","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/goblin-blood-vial.svg`,
    description: "A stoppered vial of dark goblin blood. Alchemists and hedge witches sometimes pay for it.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.2, units: "lb" }
  },
  "bent-spoon": {
    id: "bent-spoon",
    documentId: DOC_IDS["bent-spoon"],
    itemUuid: compendiumItemUuid(DOC_IDS["bent-spoon"]),
    name: "Bent Spoon",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/bent-spoon.svg`,
    description: "A tin spoon bent nearly in half. Worthless, but somehow still in a goblin's pocket.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 0.1, units: "lb" }
  },
  "dirty-rag": {
    id: "dirty-rag",
    documentId: DOC_IDS["dirty-rag"],
    itemUuid: compendiumItemUuid(DOC_IDS["dirty-rag"]),
    name: "Dirty Rag",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/dirty-rag.svg`,
    description: "A filthy scrap of cloth. Best not to ask what stained it.",
    price: { value: 0, denomination: "cp" },
    weight: { value: 0.1, units: "lb" }
  },
  "broken-pipe": {
    id: "broken-pipe",
    documentId: DOC_IDS["broken-pipe"],
    itemUuid: compendiumItemUuid(DOC_IDS["broken-pipe"]),
    name: "Broken Pipe",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/broken-pipe.svg`,
    description: "A cracked wooden smoking pipe. The bowl still smells faintly of something unpleasant.",
    price: { value: 2, denomination: "cp" },
    weight: { value: 0.2, units: "lb" }
  },
  "empty-bottle": {
    id: "empty-bottle",
    documentId: DOC_IDS["empty-bottle"],
    itemUuid: compendiumItemUuid(DOC_IDS["empty-bottle"]),
    name: "Empty Bottle",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/empty-bottle.svg`,
    description: "A cloudy glass bottle with the cork chewed off. Empty, save for a few sticky drops.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 0.5, units: "lb" }
  },
  "dice": {
    id: "dice",
    documentId: DOC_IDS["dice"],
    itemUuid: compendiumItemUuid(DOC_IDS["dice"]),
    name: "Dice",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin","game"],
    img: `modules/${MODULE_ID}/assets/items/dice.svg`,
    description: "A pair of uneven bone dice. One corner is chewed flat — fair play was never the point.",
    price: { value: 2, denomination: "cp" },
    weight: { value: 0.05, units: "lb" }
  },
  "cracked-mug": {
    id: "cracked-mug",
    documentId: DOC_IDS["cracked-mug"],
    itemUuid: compendiumItemUuid(DOC_IDS["cracked-mug"]),
    name: "Cracked Mug",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/cracked-mug.svg`,
    description: "A clay mug with a hairline crack. Still holds liquid, if you don't mind the leak.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 0.5, units: "lb" }
  },
  "old-boot": {
    id: "old-boot",
    documentId: DOC_IDS["old-boot"],
    itemUuid: compendiumItemUuid(DOC_IDS["old-boot"]),
    name: "Old Boot",
    category: "junk",
    rarity: "common",
    tags: ["junk","goblin"],
    img: `modules/${MODULE_ID}/assets/items/old-boot.svg`,
    description: "A single worn boot, two sizes too large and missing its lace.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 1, units: "lb" }
  },
  "copper-ring": {
    id: "copper-ring",
    documentId: DOC_IDS["copper-ring"],
    itemUuid: compendiumItemUuid(DOC_IDS["copper-ring"]),
    name: "Copper Ring",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","goblin"],
    img: `modules/${MODULE_ID}/assets/items/copper-ring.svg`,
    description: "A thin copper band, green in places. Not magical — just shiny enough to steal.",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "bone-necklace": {
    id: "bone-necklace",
    documentId: DOC_IDS["bone-necklace"],
    itemUuid: compendiumItemUuid(DOC_IDS["bone-necklace"]),
    name: "Bone Necklace",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","goblin"],
    img: `modules/${MODULE_ID}/assets/items/bone-necklace.svg`,
    description: "Tiny bones and beads strung on sinew. A goblin keepsake, or a warning.",
    price: { value: 3, denomination: "sp" },
    weight: { value: 0.2, units: "lb" }
  },
  "lucky-rabbit-foot": {
    id: "lucky-rabbit-foot",
    documentId: DOC_IDS["lucky-rabbit-foot"],
    itemUuid: compendiumItemUuid(DOC_IDS["lucky-rabbit-foot"]),
    name: "Lucky Rabbit Foot",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","goblin"],
    img: `modules/${MODULE_ID}/assets/items/lucky-rabbit-foot.svg`,
    description: "A dried rabbit's foot on a frayed cord. Its previous owner clearly believed in luck.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.1, units: "lb" }
  },
  "small-idol": {
    id: "small-idol",
    documentId: DOC_IDS["small-idol"],
    itemUuid: compendiumItemUuid(DOC_IDS["small-idol"]),
    name: "Small Idol",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","goblin","religion"],
    img: `modules/${MODULE_ID}/assets/items/small-idol.svg`,
    description: "A crude stone idol with oversized eyes. Someone muttered to it in the dark.",
    price: { value: 2, denomination: "gp" },
    weight: { value: 0.5, units: "lb" }
  },
  "decorative-feather": {
    id: "decorative-feather",
    documentId: DOC_IDS["decorative-feather"],
    itemUuid: compendiumItemUuid(DOC_IDS["decorative-feather"]),
    name: "Decorative Feather",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","goblin"],
    img: `modules/${MODULE_ID}/assets/items/decorative-feather.svg`,
    description: "A bright feather, carefully kept. Perhaps from a stolen hat — or a bird that got away.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "goblin-journal": {
    id: "goblin-journal",
    documentId: DOC_IDS["goblin-journal"],
    itemUuid: compendiumItemUuid(DOC_IDS["goblin-journal"]),
    name: "Goblin Journal",
    category: "story",
    rarity: "uncommon",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/goblin-journal.svg`,
    description: "A greasy little booklet of scratchy Common and Goblin. Entries complain about bosses, stolen chickens, and a \"shiny cave that bites.\" No maps of real value — yet.",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.5, units: "lb" }
  },
  "crude-map": {
    id: "crude-map",
    documentId: DOC_IDS["crude-map"],
    itemUuid: compendiumItemUuid(DOC_IDS["crude-map"]),
    name: "Crude Map",
    category: "story",
    rarity: "uncommon",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/crude-map.svg`,
    description: "A scrap of hide marked with charcoal. An X sits near a crooked river and three stick-figure trees. Whether the treasure exists is another matter.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.1, units: "lb" }
  },
  "wanted-poster": {
    id: "wanted-poster",
    documentId: DOC_IDS["wanted-poster"],
    itemUuid: compendiumItemUuid(DOC_IDS["wanted-poster"]),
    name: "Wanted Poster",
    category: "story",
    rarity: "common",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/wanted-poster.svg`,
    description: "A torn poster offering coin for \"the green one with the scar.\" The face is smudged beyond recognition. Someone kept it folded in a pouch.",
    price: { value: 1, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "caravan-schedule": {
    id: "caravan-schedule",
    documentId: DOC_IDS["caravan-schedule"],
    itemUuid: compendiumItemUuid(DOC_IDS["caravan-schedule"]),
    name: "Caravan Schedule",
    category: "story",
    rarity: "uncommon",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/caravan-schedule.svg`,
    description: "A damp parchment listing wagon departures along a trade road — dates, cargo notes (\"grain\", \"iron\", \"wine\"), and a scribbled goblin jot: \"wait at bend.\"",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "bandit-orders": {
    id: "bandit-orders",
    documentId: DOC_IDS["bandit-orders"],
    itemUuid: compendiumItemUuid(DOC_IDS["bandit-orders"]),
    name: "Bandit Orders",
    category: "story",
    rarity: "uncommon",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/bandit-orders.svg`,
    description: "Rough handwriting: \"Hit the south road after dark. Leave no wagons. Bring the strongbox to the hollow.\" Signed with a fang-shaped mark.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.05, units: "lb" }
  },
  "scribbled-note": {
    id: "scribbled-note",
    documentId: DOC_IDS["scribbled-note"],
    itemUuid: compendiumItemUuid(DOC_IDS["scribbled-note"]),
    name: "Scribbled Note",
    category: "story",
    rarity: "common",
    tags: ["story","goblin","readable"],
    img: `modules/${MODULE_ID}/assets/items/scribbled-note.svg`,
    description: "A scrap that reads: \"Boss says dig. Dig until shiny. Don't tell the tall ones.\" The rest is claw marks.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 0.05, units: "lb" }
  },

  "orc-tusk": {
    id: "orc-tusk",
    documentId: DOC_IDS["orc-tusk"],
    itemUuid: compendiumItemUuid(DOC_IDS["orc-tusk"]),
    name: "Orc Tusk",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","orc","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/orc-tusk.svg`,
    description: "A thick yellowed tusk hacked from an orc. Hunters and trophy-takers value an unbroken pair.",
    price: { value: 3, denomination: "sp" },
    weight: { value: 0.5, units: "lb" }
  },
  "orc-ear": {
    id: "orc-ear",
    documentId: DOC_IDS["orc-ear"],
    itemUuid: compendiumItemUuid(DOC_IDS["orc-ear"]),
    name: "Orc Ear",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","orc","trophy"],
    img: `modules/${MODULE_ID}/assets/items/orc-ear.svg`,
    description: "A notched orc ear, sometimes collected as crude proof of a kill in border wars.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.1, units: "lb" }
  },
  "orc-blood-vial": {
    id: "orc-blood-vial",
    documentId: DOC_IDS["orc-blood-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["orc-blood-vial"]),
    name: "Orc Blood Vial",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["humanoid","orc","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/orc-blood-vial.svg`,
    description: "A stoppered vial of dark, iron-smelling orc blood. Some alchemists pay well for fresh samples.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.2, units: "lb" }
  },
  "orc-heart": {
    id: "orc-heart",
    documentId: DOC_IDS["orc-heart"],
    itemUuid: compendiumItemUuid(DOC_IDS["orc-heart"]),
    name: "Orc Heart",
    category: "monster-part",
    rarity: "rare",
    tags: ["humanoid","orc","rare","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/orc-heart.svg`,
    description: "A heavy, scarred heart cut carefully from a powerful orc. Rarely intact after a hard fight.",
    price: { value: 5, denomination: "gp" },
    weight: { value: 1, units: "lb" }
  },
  "war-paint-pot": {
    id: "war-paint-pot",
    documentId: DOC_IDS["war-paint-pot"],
    itemUuid: compendiumItemUuid(DOC_IDS["war-paint-pot"]),
    name: "War Paint Pot",
    category: "junk",
    rarity: "common",
    tags: ["junk","orc"],
    img: `modules/${MODULE_ID}/assets/items/war-paint-pot.svg`,
    description: "A clay pot of greasy red-and-black war paint. Most of it has dried to a crust.",
    price: { value: 2, denomination: "cp" },
    weight: { value: 0.3, units: "lb" }
  },
  "gnawed-bone": {
    id: "gnawed-bone",
    documentId: DOC_IDS["gnawed-bone"],
    itemUuid: compendiumItemUuid(DOC_IDS["gnawed-bone"]),
    name: "Gnawed Bone",
    category: "junk",
    rarity: "common",
    tags: ["junk","orc","bone"],
    img: `modules/${MODULE_ID}/assets/items/gnawed-bone.svg`,
    description: "A thick bone chewed clean. Tooth marks suggest an orc snack more than a dog's toy.",
    price: { value: 0, denomination: "cp" },
    weight: { value: 0.4, units: "lb" }
  },
  "rusty-nail-pouch": {
    id: "rusty-nail-pouch",
    documentId: DOC_IDS["rusty-nail-pouch"],
    itemUuid: compendiumItemUuid(DOC_IDS["rusty-nail-pouch"]),
    name: "Rusty Nail Pouch",
    category: "junk",
    rarity: "common",
    tags: ["junk","orc"],
    img: `modules/${MODULE_ID}/assets/items/rusty-nail-pouch.svg`,
    description: "A greasy pouch of bent, rusty nails — scrap for traps, or just pocket clutter.",
    price: { value: 1, denomination: "cp" },
    weight: { value: 0.5, units: "lb" }
  },
  "iron-nose-ring": {
    id: "iron-nose-ring",
    documentId: DOC_IDS["iron-nose-ring"],
    itemUuid: compendiumItemUuid(DOC_IDS["iron-nose-ring"]),
    name: "Iron Nose Ring",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","orc"],
    img: `modules/${MODULE_ID}/assets/items/iron-nose-ring.svg`,
    description: "A heavy iron ring still smelling faintly of blood and sweat. An orc status mark to some clans.",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.1, units: "lb" }
  },
  "crude-totem": {
    id: "crude-totem",
    documentId: DOC_IDS["crude-totem"],
    itemUuid: compendiumItemUuid(DOC_IDS["crude-totem"]),
    name: "Crude Totem",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","orc","religion"],
    img: `modules/${MODULE_ID}/assets/items/crude-totem.svg`,
    description: "A carved wooden idol bristling with teeth and feathers. Someone muttered to it before the fight.",
    price: { value: 2, denomination: "gp" },
    weight: { value: 1, units: "lb" }
  },
  "tusk-pendant": {
    id: "tusk-pendant",
    documentId: DOC_IDS["tusk-pendant"],
    itemUuid: compendiumItemUuid(DOC_IDS["tusk-pendant"]),
    name: "Tusk Pendant",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","orc"],
    img: `modules/${MODULE_ID}/assets/items/tusk-pendant.svg`,
    description: "A smaller tusk tip drilled and hung on a leather cord. A keepsake — or a warning.",
    price: { value: 8, denomination: "sp" },
    weight: { value: 0.2, units: "lb" }
  },
  "orc-war-orders": {
    id: "orc-war-orders",
    documentId: DOC_IDS["orc-war-orders"],
    itemUuid: compendiumItemUuid(DOC_IDS["orc-war-orders"]),
    name: "Orc War Orders",
    category: "story",
    rarity: "uncommon",
    tags: ["story","orc","readable"],
    img: `modules/${MODULE_ID}/assets/items/orc-war-orders.svg`,
    description: "Crude Common scratched into hide: \"Burn the mill. Take the cattle. Leave no riders.\" A clan mark is stamped in blood.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.05, units: "lb" }
  },
  "raid-map": {
    id: "raid-map",
    documentId: DOC_IDS["raid-map"],
    itemUuid: compendiumItemUuid(DOC_IDS["raid-map"]),
    name: "Raid Map",
    category: "story",
    rarity: "uncommon",
    tags: ["story","orc","readable"],
    img: `modules/${MODULE_ID}/assets/items/raid-map.svg`,
    description: "A charcoal map of local roads and farms. Circles mark soft targets; an X marks a meeting hollow.",
    price: { value: 1, denomination: "gp" },
    weight: { value: 0.1, units: "lb" }
  },
  "clan-marking": {
    id: "clan-marking",
    documentId: DOC_IDS["clan-marking"],
    itemUuid: compendiumItemUuid(DOC_IDS["clan-marking"]),
    name: "Clan Marking",
    category: "story",
    rarity: "common",
    tags: ["story","orc","readable"],
    img: `modules/${MODULE_ID}/assets/items/clan-marking.svg`,
    description: "A strip of painted hide bearing a clan sigil — a broken axe over a crescent. Useful to those who track orc tribes.",
    price: { value: 2, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "blood-oath-scrap": {
    id: "blood-oath-scrap",
    documentId: DOC_IDS["blood-oath-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["blood-oath-scrap"]),
    name: "Blood Oath Scrap",
    category: "story",
    rarity: "uncommon",
    tags: ["story","orc","readable"],
    img: `modules/${MODULE_ID}/assets/items/blood-oath-scrap.svg`,
    description: "A torn scrap smeared with dried blood: \"Until the last tusk breaks.\" Names of two warbands are scratched beneath.",
    price: { value: 5, denomination: "sp" },
    weight: { value: 0.05, units: "lb" }
  },
  "spider-chitin": {
    id: "spider-chitin",
    documentId: DOC_IDS["spider-chitin"],
    itemUuid: compendiumItemUuid(DOC_IDS["spider-chitin"]),
    name: "Spider Chitin",
    category: "monster-part",
    rarity: "common",
    tags: ["beast","spider","chitin","crafting"],
    img: `modules/${MODULE_ID}/assets/items/spider-chitin.svg`,
    description: "A hard plate of spider carapace, still faintly iridescent. Armorers and shieldwrights can work it into light plating.",
    price: {"value":4,"denomination":"sp"},
    weight: {"value":1,"units":"lb"}
  },
  "spinneret": {
    id: "spinneret",
    documentId: DOC_IDS["spinneret"],
    itemUuid: compendiumItemUuid(DOC_IDS["spinneret"]),
    name: "Spinneret",
    category: "monster-part",
    rarity: "rare",
    tags: ["beast","spider","rare","silk","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/spinneret.svg`,
    description: "An intact spinneret organ, still capable of producing a fine sticky thread. Rarely recovered whole after a hard fight.",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":0.4,"units":"lb"}
  },
  "sticky-web-clump": {
    id: "sticky-web-clump",
    documentId: DOC_IDS["sticky-web-clump"],
    itemUuid: compendiumItemUuid(DOC_IDS["sticky-web-clump"]),
    name: "Sticky Web Clump",
    category: "junk",
    rarity: "common",
    tags: ["junk","spider","silk"],
    img: `modules/${MODULE_ID}/assets/items/sticky-web-clump.svg`,
    description: "A messy fistful of adhesive webbing. More nuisance than treasure — unless you need to jam a lock.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "empty-cocoon": {
    id: "empty-cocoon",
    documentId: DOC_IDS["empty-cocoon"],
    itemUuid: compendiumItemUuid(DOC_IDS["empty-cocoon"]),
    name: "Empty Cocoon",
    category: "junk",
    rarity: "common",
    tags: ["junk","spider","silk"],
    img: `modules/${MODULE_ID}/assets/items/empty-cocoon.svg`,
    description: "A torn silk cocoon, hollow and brittle. Whatever was wrapped inside is long gone — or wriggled free.",
    price: {"value":2,"denomination":"cp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "brittle-leg-segment": {
    id: "brittle-leg-segment",
    documentId: DOC_IDS["brittle-leg-segment"],
    itemUuid: compendiumItemUuid(DOC_IDS["brittle-leg-segment"]),
    name: "Brittle Leg Segment",
    category: "junk",
    rarity: "common",
    tags: ["junk","spider","chitin"],
    img: `modules/${MODULE_ID}/assets/items/brittle-leg-segment.svg`,
    description: "A snapped length of jointed spider leg. Hollow, light, and useless for anything but a morbid walking stick.",
    price: {"value":0,"denomination":"cp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "web-wrapped-coin": {
    id: "web-wrapped-coin",
    documentId: DOC_IDS["web-wrapped-coin"],
    itemUuid: compendiumItemUuid(DOC_IDS["web-wrapped-coin"]),
    name: "Web-Wrapped Coin",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","spider"],
    img: `modules/${MODULE_ID}/assets/items/web-wrapped-coin.svg`,
    description: "A single silver piece sealed in a bead of hardened silk. Someone's last tip, never collected.",
    price: {"value":1,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "iridescent-chitin-shard": {
    id: "iridescent-chitin-shard",
    documentId: DOC_IDS["iridescent-chitin-shard"],
    itemUuid: compendiumItemUuid(DOC_IDS["iridescent-chitin-shard"]),
    name: "Iridescent Chitin Shard",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","spider","chitin"],
    img: `modules/${MODULE_ID}/assets/items/iridescent-chitin-shard.svg`,
    description: "A thumb-sized shard that shifts green to violet in the light. Jewelers sometimes set them as cheap cabochons.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "fang-charm": {
    id: "fang-charm",
    documentId: DOC_IDS["fang-charm"],
    itemUuid: compendiumItemUuid(DOC_IDS["fang-charm"]),
    name: "Fang Charm",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","spider","fang"],
    img: `modules/${MODULE_ID}/assets/items/fang-charm.svg`,
    description: "A small spider fang drilled and hung on a frayed cord. Hunters wear them for luck — or to warn rivals.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "cocooned-journal": {
    id: "cocooned-journal",
    documentId: DOC_IDS["cocooned-journal"],
    itemUuid: compendiumItemUuid(DOC_IDS["cocooned-journal"]),
    name: "Cocooned Journal",
    category: "story",
    rarity: "uncommon",
    tags: ["story","spider","readable"],
    img: `modules/${MODULE_ID}/assets/items/cocooned-journal.svg`,
    description: "A leather journal half-sealed in silk. The last entry: \"The clicking is closer. If I don't return, burn the nest under the mill.\"",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "prey-keepsake": {
    id: "prey-keepsake",
    documentId: DOC_IDS["prey-keepsake"],
    itemUuid: compendiumItemUuid(DOC_IDS["prey-keepsake"]),
    name: "Prey Keepsake",
    category: "story",
    rarity: "common",
    tags: ["story","spider","readable"],
    img: `modules/${MODULE_ID}/assets/items/prey-keepsake.svg`,
    description: "A bent locket pulled from a web. Inside is a faded portrait and a scrap that reads only: \"Come home before winter.\"",
    price: {"value":3,"denomination":"sp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "webbing-scrawl": {
    id: "webbing-scrawl",
    documentId: DOC_IDS["webbing-scrawl"],
    itemUuid: compendiumItemUuid(DOC_IDS["webbing-scrawl"]),
    name: "Webbing Scrawl",
    category: "story",
    rarity: "uncommon",
    tags: ["story","spider","readable"],
    img: `modules/${MODULE_ID}/assets/items/webbing-scrawl.svg`,
    description: "Words pressed into a sheet of dried web in a shaky hand: \"Three tunnels. Eggs in the left. Don't light a torch.\"",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "dragon-scale": {
    id: "dragon-scale",
    documentId: DOC_IDS["dragon-scale"],
    itemUuid: compendiumItemUuid(DOC_IDS["dragon-scale"]),
    name: "Dragon Scale",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["dragon","scale","crafting"],
    img: `modules/${MODULE_ID}/assets/items/dragon-scale.svg`,
    description: "A tough, iridescent scale shed or pried from a dragon. Armorers pay well for matched sets.",
    price: {"value":5,"denomination":"gp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "dragon-fang": {
    id: "dragon-fang",
    documentId: DOC_IDS["dragon-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["dragon-fang"]),
    name: "Dragon Fang",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["dragon","fang","trophy"],
    img: `modules/${MODULE_ID}/assets/items/dragon-fang.svg`,
    description: "A curved ivory fang longer than a dagger. Hunters mount them; alchemists grind the tips.",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":1,"units":"lb"}
  },
  "dragon-claw": {
    id: "dragon-claw",
    documentId: DOC_IDS["dragon-claw"],
    itemUuid: compendiumItemUuid(DOC_IDS["dragon-claw"]),
    name: "Dragon Claw",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["dragon","claw","trophy"],
    img: `modules/${MODULE_ID}/assets/items/dragon-claw.svg`,
    description: "A black-tipped claw still sharp enough to score steel. Trophy-takers and weapon-smiths both want them.",
    price: {"value":6,"denomination":"gp"},
    weight: {"value":0.8,"units":"lb"}
  },
  "dragon-blood-vial": {
    id: "dragon-blood-vial",
    documentId: DOC_IDS["dragon-blood-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["dragon-blood-vial"]),
    name: "Dragon Blood Vial",
    category: "monster-part",
    rarity: "rare",
    tags: ["dragon","alchemy","blood"],
    img: `modules/${MODULE_ID}/assets/items/dragon-blood-vial.svg`,
    description: "A sealed vial of thick, shimmering dragon blood. Still warm to the touch. Alchemists and ritualists bid fiercely for it.",
    price: {"value":25,"denomination":"gp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "dragon-hide": {
    id: "dragon-hide",
    documentId: DOC_IDS["dragon-hide"],
    itemUuid: compendiumItemUuid(DOC_IDS["dragon-hide"]),
    name: "Dragon Hide",
    category: "monster-part",
    rarity: "rare",
    tags: ["dragon","hide","crafting"],
    img: `modules/${MODULE_ID}/assets/items/dragon-hide.svg`,
    description: "A broad sheet of scaled hide, heavy and flexible. Worthy of a master leatherworker — or a king's cloak.",
    price: {"value":50,"denomination":"gp"},
    weight: {"value":8,"units":"lb"}
  },
  "dragon-horn": {
    id: "dragon-horn",
    documentId: DOC_IDS["dragon-horn"],
    itemUuid: compendiumItemUuid(DOC_IDS["dragon-horn"]),
    name: "Dragon Horn",
    category: "monster-part",
    rarity: "rare",
    tags: ["dragon","horn","trophy"],
    img: `modules/${MODULE_ID}/assets/items/dragon-horn.svg`,
    description: "A spiraled horn broken clean from a dragon's crest. Status symbol, ritual focus, or war-horn blank.",
    price: {"value":30,"denomination":"gp"},
    weight: {"value":3,"units":"lb"}
  },
  "dragon-heart": {
    id: "dragon-heart",
    documentId: DOC_IDS["dragon-heart"],
    itemUuid: compendiumItemUuid(DOC_IDS["dragon-heart"]),
    name: "Dragon Heart",
    category: "monster-part",
    rarity: "veryRare",
    tags: ["dragon","rare","alchemy","heart"],
    img: `modules/${MODULE_ID}/assets/items/dragon-heart.svg`,
    description: "A massive, still-warm heart shot through with elemental fire. Almost never recovered intact.",
    price: {"value":250,"denomination":"gp"},
    weight: {"value":12,"units":"lb"}
  },
  "scorched-bone": {
    id: "scorched-bone",
    documentId: DOC_IDS["scorched-bone"],
    itemUuid: compendiumItemUuid(DOC_IDS["scorched-bone"]),
    name: "Scorched Bone",
    category: "junk",
    rarity: "common",
    tags: ["junk","dragon","bone"],
    img: `modules/${MODULE_ID}/assets/items/scorched-bone.svg`,
    description: "A blackened bone from some long-digested meal. Still smells faintly of smoke.",
    price: {"value":0,"denomination":"cp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "cracked-scale-shard": {
    id: "cracked-scale-shard",
    documentId: DOC_IDS["cracked-scale-shard"],
    itemUuid: compendiumItemUuid(DOC_IDS["cracked-scale-shard"]),
    name: "Cracked Scale Shard",
    category: "junk",
    rarity: "common",
    tags: ["junk","dragon","scale"],
    img: `modules/${MODULE_ID}/assets/items/cracked-scale-shard.svg`,
    description: "A broken flake of scale, too small for armor. Children might keep it as a lucky charm.",
    price: {"value":2,"denomination":"cp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "sulfur-lump": {
    id: "sulfur-lump",
    documentId: DOC_IDS["sulfur-lump"],
    itemUuid: compendiumItemUuid(DOC_IDS["sulfur-lump"]),
    name: "Sulfur Lump",
    category: "junk",
    rarity: "common",
    tags: ["junk","dragon","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/sulfur-lump.svg`,
    description: "A crumbly yellow lump that reeks of rotten eggs. Useful in cheap explosives — or for clearing a room.",
    price: {"value":3,"denomination":"cp"},
    weight: {"value":0.4,"units":"lb"}
  },
  "ash-clump": {
    id: "ash-clump",
    documentId: DOC_IDS["ash-clump"],
    itemUuid: compendiumItemUuid(DOC_IDS["ash-clump"]),
    name: "Ash Clump",
    category: "junk",
    rarity: "common",
    tags: ["junk","dragon"],
    img: `modules/${MODULE_ID}/assets/items/ash-clump.svg`,
    description: "A compressed fist of grey ash from a dragon's lair floor. Gets everywhere.",
    price: {"value":0,"denomination":"cp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "polished-dragon-scale": {
    id: "polished-dragon-scale",
    documentId: DOC_IDS["polished-dragon-scale"],
    itemUuid: compendiumItemUuid(DOC_IDS["polished-dragon-scale"]),
    name: "Polished Dragon Scale",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","dragon","scale"],
    img: `modules/${MODULE_ID}/assets/items/polished-dragon-scale.svg`,
    description: "A single scale buffed to a mirror sheen and drilled for a cord. Nobles wear them as bold jewelry.",
    price: {"value":15,"denomination":"gp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "dragon-tooth-pendant": {
    id: "dragon-tooth-pendant",
    documentId: DOC_IDS["dragon-tooth-pendant"],
    itemUuid: compendiumItemUuid(DOC_IDS["dragon-tooth-pendant"]),
    name: "Dragon Tooth Pendant",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","dragon","fang"],
    img: `modules/${MODULE_ID}/assets/items/dragon-tooth-pendant.svg`,
    description: "A smaller dragon tooth hung on a gold-wire chain. A boast, a ward, or both.",
    price: {"value":20,"denomination":"gp"},
    weight: {"value":0.4,"units":"lb"}
  },
  "hoard-gem-chip": {
    id: "hoard-gem-chip",
    documentId: DOC_IDS["hoard-gem-chip"],
    itemUuid: compendiumItemUuid(DOC_IDS["hoard-gem-chip"]),
    name: "Hoard Gem Chip",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","dragon","gem"],
    img: `modules/${MODULE_ID}/assets/items/hoard-gem-chip.svg`,
    description: "A chipped ruby fragment from a dragon's bedding. Not jewelry-grade — but still worth a purse of silver.",
    price: {"value":10,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "hoard-ledger": {
    id: "hoard-ledger",
    documentId: DOC_IDS["hoard-ledger"],
    itemUuid: compendiumItemUuid(DOC_IDS["hoard-ledger"]),
    name: "Hoard Ledger",
    category: "story",
    rarity: "uncommon",
    tags: ["story","dragon","readable"],
    img: `modules/${MODULE_ID}/assets/items/hoard-ledger.svg`,
    description: "A scorched ledger in a precise claw-hand: \"Tribute from the river towns — 400 gp, three oxen, one silver mirror. Still owed: respect.\"",
    price: {"value":5,"denomination":"gp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "territorial-claim": {
    id: "territorial-claim",
    documentId: DOC_IDS["territorial-claim"],
    itemUuid: compendiumItemUuid(DOC_IDS["territorial-claim"]),
    name: "Territorial Claim",
    category: "story",
    rarity: "uncommon",
    tags: ["story","dragon","readable"],
    img: `modules/${MODULE_ID}/assets/items/territorial-claim.svg`,
    description: "A decree burned into a bronze plate: \"These peaks are mine. Cross the ridge and your bones join the cairn.\"",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":1,"units":"lb"}
  },
  "rival-challenge": {
    id: "rival-challenge",
    documentId: DOC_IDS["rival-challenge"],
    itemUuid: compendiumItemUuid(DOC_IDS["rival-challenge"]),
    name: "Rival Challenge",
    category: "story",
    rarity: "rare",
    tags: ["story","dragon","readable"],
    img: `modules/${MODULE_ID}/assets/items/rival-challenge.svg`,
    description: "A strip of another dragon's scale, etched: \"Meet me above the glacier at the next blood moon — or cede the valley.\"",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "scorched-map": {
    id: "scorched-map",
    documentId: DOC_IDS["scorched-map"],
    itemUuid: compendiumItemUuid(DOC_IDS["scorched-map"]),
    name: "Scorched Map",
    category: "story",
    rarity: "uncommon",
    tags: ["story","dragon","readable"],
    img: `modules/${MODULE_ID}/assets/items/scorched-map.svg`,
    description: "A half-burned map of local valleys. One lair is circled in claw-ink; three villages are crossed out.",
    price: {"value":3,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "bugbear-ear": {
    id: "bugbear-ear",
    documentId: DOC_IDS["bugbear-ear"],
    itemUuid: compendiumItemUuid(DOC_IDS["bugbear-ear"]),
    name: "Bugbear Ear",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","bugbear","goblinoid","trophy"],
    img: `modules/${MODULE_ID}/assets/items/bugbear-ear.svg`,
    description: "A furred, pointed ear sliced from a bugbear. Border scouts still take them as proof of a kill.",
    price: {"value":3,"denomination":"sp"},
    weight: {"value":0.15,"units":"lb"}
  },
  "bugbear-fang": {
    id: "bugbear-fang",
    documentId: DOC_IDS["bugbear-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["bugbear-fang"]),
    name: "Bugbear Fang",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","bugbear","fang"],
    img: `modules/${MODULE_ID}/assets/items/bugbear-fang.svg`,
    description: "A thick yellow fang from a bugbear's jaw. Heavy enough to use as a crude awl.",
    price: {"value":2,"denomination":"sp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "bugbear-hide-scrap": {
    id: "bugbear-hide-scrap",
    documentId: DOC_IDS["bugbear-hide-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["bugbear-hide-scrap"]),
    name: "Bugbear Hide Scrap",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","bugbear","hide"],
    img: `modules/${MODULE_ID}/assets/items/bugbear-hide-scrap.svg`,
    description: "A patch of bristly bugbear hide. Smells of sweat and wet fur; leatherworkers can still use it.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":1,"units":"lb"}
  },
  "bugbear-heart": {
    id: "bugbear-heart",
    documentId: DOC_IDS["bugbear-heart"],
    itemUuid: compendiumItemUuid(DOC_IDS["bugbear-heart"]),
    name: "Bugbear Heart",
    category: "monster-part",
    rarity: "rare",
    tags: ["humanoid","bugbear","rare"],
    img: `modules/${MODULE_ID}/assets/items/bugbear-heart.svg`,
    description: "A dense, oversized heart cut from a powerful bugbear. Rarely intact after a brutal fight.",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":2,"units":"lb"}
  },
  "mangy-fur-tuft": {
    id: "mangy-fur-tuft",
    documentId: DOC_IDS["mangy-fur-tuft"],
    itemUuid: compendiumItemUuid(DOC_IDS["mangy-fur-tuft"]),
    name: "Mangy Fur Tuft",
    category: "junk",
    rarity: "common",
    tags: ["junk","bugbear"],
    img: `modules/${MODULE_ID}/assets/items/mangy-fur-tuft.svg`,
    description: "A greasy clump of bugbear fur. Lice optional; value negligible.",
    price: {"value":0,"denomination":"cp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "greasy-strap": {
    id: "greasy-strap",
    documentId: DOC_IDS["greasy-strap"],
    itemUuid: compendiumItemUuid(DOC_IDS["greasy-strap"]),
    name: "Greasy Strap",
    category: "junk",
    rarity: "common",
    tags: ["junk","bugbear"],
    img: `modules/${MODULE_ID}/assets/items/greasy-strap.svg`,
    description: "A leather strap slick with oil and sweat. Once held a morningstar; now it just stains your pack.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "bone-earring": {
    id: "bone-earring",
    documentId: DOC_IDS["bone-earring"],
    itemUuid: compendiumItemUuid(DOC_IDS["bone-earring"]),
    name: "Bone Earring",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","bugbear"],
    img: `modules/${MODULE_ID}/assets/items/bone-earring.svg`,
    description: "A carved knucklebone earring on a rusty ring. Bugbear fashion — or a trophy from something smaller.",
    price: {"value":4,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "crude-nose-bone": {
    id: "crude-nose-bone",
    documentId: DOC_IDS["crude-nose-bone"],
    itemUuid: compendiumItemUuid(DOC_IDS["crude-nose-bone"]),
    name: "Crude Nose Bone",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","bugbear"],
    img: `modules/${MODULE_ID}/assets/items/crude-nose-bone.svg`,
    description: "A sharpened bone piercing still crusted with dried blood. Status mark among some goblinoid warbands.",
    price: {"value":3,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "bugbear-orders": {
    id: "bugbear-orders",
    documentId: DOC_IDS["bugbear-orders"],
    itemUuid: compendiumItemUuid(DOC_IDS["bugbear-orders"]),
    name: "Bugbear Orders",
    category: "story",
    rarity: "uncommon",
    tags: ["story","bugbear","readable"],
    img: `modules/${MODULE_ID}/assets/items/bugbear-orders.svg`,
    description: "Crude Common: \"Hit the farmstead at dusk. Take the strong. Break the rest. Meet at the crooked oak.\"",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "raid-tally": {
    id: "raid-tally",
    documentId: DOC_IDS["raid-tally"],
    itemUuid: compendiumItemUuid(DOC_IDS["raid-tally"]),
    name: "Raid Tally",
    category: "story",
    rarity: "common",
    tags: ["story","bugbear","readable"],
    img: `modules/${MODULE_ID}/assets/items/raid-tally.svg`,
    description: "Notches on a stick: twelve farms, three caravans, one \"loud shiny man.\" Someone is keeping score.",
    price: {"value":2,"denomination":"sp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "ectoplasm-vial": {
    id: "ectoplasm-vial",
    documentId: DOC_IDS["ectoplasm-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["ectoplasm-vial"]),
    name: "Ectoplasm Vial",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["undead","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/ectoplasm-vial.svg`,
    description: "A cloudy vial of residual ectoplasm. It writhes faintly when the dead are near.",
    price: {"value":5,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "grave-dirt": {
    id: "grave-dirt",
    documentId: DOC_IDS["grave-dirt"],
    itemUuid: compendiumItemUuid(DOC_IDS["grave-dirt"]),
    name: "Grave Dirt",
    category: "monster-part",
    rarity: "common",
    tags: ["undead","dirt"],
    img: `modules/${MODULE_ID}/assets/items/grave-dirt.svg`,
    description: "A pouch of cold, iron-smelling earth from a grave. Some rituals demand it; most people just want it gone.",
    price: {"value":1,"denomination":"sp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "burial-coin": {
    id: "burial-coin",
    documentId: DOC_IDS["burial-coin"],
    itemUuid: compendiumItemUuid(DOC_IDS["burial-coin"]),
    name: "Burial Coin",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","undead"],
    img: `modules/${MODULE_ID}/assets/items/burial-coin.svg`,
    description: "A copper piece placed on a corpse's tongue. The dead owed Charon; this one never paid.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "broken-holy-symbol": {
    id: "broken-holy-symbol",
    documentId: DOC_IDS["broken-holy-symbol"],
    itemUuid: compendiumItemUuid(DOC_IDS["broken-holy-symbol"]),
    name: "Broken Holy Symbol",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","undead","religion"],
    img: `modules/${MODULE_ID}/assets/items/broken-holy-symbol.svg`,
    description: "A snapped silver holy symbol, blackened as if burned from within. Faith failed here — or was hunted.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "rotten-flesh": {
    id: "rotten-flesh",
    documentId: DOC_IDS["rotten-flesh"],
    itemUuid: compendiumItemUuid(DOC_IDS["rotten-flesh"]),
    name: "Rotten Flesh",
    category: "monster-part",
    rarity: "common",
    tags: ["undead","zombie"],
    img: `modules/${MODULE_ID}/assets/items/rotten-flesh.svg`,
    description: "A slab of putrid zombie flesh. Alchemists sometimes want it. Everyone else should burn it.",
    price: {"value":5,"denomination":"cp"},
    weight: {"value":1,"units":"lb"}
  },
  "zombie-tooth": {
    id: "zombie-tooth",
    documentId: DOC_IDS["zombie-tooth"],
    itemUuid: compendiumItemUuid(DOC_IDS["zombie-tooth"]),
    name: "Zombie Tooth",
    category: "monster-part",
    rarity: "common",
    tags: ["undead","zombie","tooth"],
    img: `modules/${MODULE_ID}/assets/items/zombie-tooth.svg`,
    description: "A loose, blackened tooth pried from a zombie's jaw. Still faintly warm.",
    price: {"value":1,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "zombie-hand": {
    id: "zombie-hand",
    documentId: DOC_IDS["zombie-hand"],
    itemUuid: compendiumItemUuid(DOC_IDS["zombie-hand"]),
    name: "Zombie Hand",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["undead","zombie","trophy"],
    img: `modules/${MODULE_ID}/assets/items/zombie-hand.svg`,
    description: "A severed zombie hand, fingers still twitching on occasion. Necromancers collect them; sane folk don't.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":1.5,"units":"lb"}
  },
  "burial-shroud-scrap": {
    id: "burial-shroud-scrap",
    documentId: DOC_IDS["burial-shroud-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["burial-shroud-scrap"]),
    name: "Burial Shroud Scrap",
    category: "junk",
    rarity: "common",
    tags: ["junk","undead","zombie"],
    img: `modules/${MODULE_ID}/assets/items/burial-shroud-scrap.svg`,
    description: "A torn strip of burial linen, stiff with age and something worse.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "coffin-nail": {
    id: "coffin-nail",
    documentId: DOC_IDS["coffin-nail"],
    itemUuid: compendiumItemUuid(DOC_IDS["coffin-nail"]),
    name: "Coffin Nail",
    category: "junk",
    rarity: "common",
    tags: ["junk","undead"],
    img: `modules/${MODULE_ID}/assets/items/coffin-nail.svg`,
    description: "A long iron nail pulled from a coffin lid. Folklore says they ward off the restless — when unused.",
    price: {"value":2,"denomination":"cp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "unfinished-will": {
    id: "unfinished-will",
    documentId: DOC_IDS["unfinished-will"],
    itemUuid: compendiumItemUuid(DOC_IDS["unfinished-will"]),
    name: "Unfinished Will",
    category: "story",
    rarity: "uncommon",
    tags: ["story","undead","zombie","readable"],
    img: `modules/${MODULE_ID}/assets/items/unfinished-will.svg`,
    description: "A water-stained will ending mid-sentence: \"To my daughter Elra, I leave the farm and —\" The ink trails into a bloody smear.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "bone-shard": {
    id: "bone-shard",
    documentId: DOC_IDS["bone-shard"],
    itemUuid: compendiumItemUuid(DOC_IDS["bone-shard"]),
    name: "Bone Shard",
    category: "monster-part",
    rarity: "common",
    tags: ["undead","skeleton","bone"],
    img: `modules/${MODULE_ID}/assets/items/bone-shard.svg`,
    description: "A sharp fragment of animated bone. Still faintly cold to the touch.",
    price: {"value":1,"denomination":"sp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "yellowed-rib": {
    id: "yellowed-rib",
    documentId: DOC_IDS["yellowed-rib"],
    itemUuid: compendiumItemUuid(DOC_IDS["yellowed-rib"]),
    name: "Yellowed Rib",
    category: "monster-part",
    rarity: "common",
    tags: ["undead","skeleton","bone"],
    img: `modules/${MODULE_ID}/assets/items/yellowed-rib.svg`,
    description: "A curved rib from a walking skeleton. Lightweight, hollow, and oddly musical if tapped.",
    price: {"value":2,"denomination":"sp"},
    weight: {"value":0.4,"units":"lb"}
  },
  "skeleton-finger": {
    id: "skeleton-finger",
    documentId: DOC_IDS["skeleton-finger"],
    itemUuid: compendiumItemUuid(DOC_IDS["skeleton-finger"]),
    name: "Skeleton Finger",
    category: "monster-part",
    rarity: "common",
    tags: ["undead","skeleton","bone"],
    img: `modules/${MODULE_ID}/assets/items/skeleton-finger.svg`,
    description: "Three jointed finger bones still wired with dried sinew. Points accusingly when set on a table.",
    price: {"value":1,"denomination":"sp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "rusted-mail-link": {
    id: "rusted-mail-link",
    documentId: DOC_IDS["rusted-mail-link"],
    itemUuid: compendiumItemUuid(DOC_IDS["rusted-mail-link"]),
    name: "Rusted Mail Link",
    category: "junk",
    rarity: "common",
    tags: ["junk","undead","skeleton"],
    img: `modules/${MODULE_ID}/assets/items/rusted-mail-link.svg`,
    description: "A single rusted ring from ancient mail. The skeleton that wore it marched long after the army died.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "polished-knuckle": {
    id: "polished-knuckle",
    documentId: DOC_IDS["polished-knuckle"],
    itemUuid: compendiumItemUuid(DOC_IDS["polished-knuckle"]),
    name: "Polished Knuckle",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","undead","skeleton"],
    img: `modules/${MODULE_ID}/assets/items/polished-knuckle.svg`,
    description: "A knucklebone worn smooth as a worry stone. Someone — or something — handled it for years.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "ancient-epitaph": {
    id: "ancient-epitaph",
    documentId: DOC_IDS["ancient-epitaph"],
    itemUuid: compendiumItemUuid(DOC_IDS["ancient-epitaph"]),
    name: "Ancient Epitaph",
    category: "story",
    rarity: "uncommon",
    tags: ["story","undead","skeleton","readable"],
    img: `modules/${MODULE_ID}/assets/items/ancient-epitaph.svg`,
    description: "A stone chip carved: \"Here lies Captain Vorn — he rises when the horn calls.\" The horn is missing.",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "mummy-bandage": {
    id: "mummy-bandage",
    documentId: DOC_IDS["mummy-bandage"],
    itemUuid: compendiumItemUuid(DOC_IDS["mummy-bandage"]),
    name: "Mummy Bandage",
    category: "monster-part",
    rarity: "common",
    tags: ["undead","mummy"],
    img: `modules/${MODULE_ID}/assets/items/mummy-bandage.svg`,
    description: "Resin-stiff linen unwound from a mummy. Smells of myrrh, dust, and old curses.",
    price: {"value":3,"denomination":"sp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "withered-flesh": {
    id: "withered-flesh",
    documentId: DOC_IDS["withered-flesh"],
    itemUuid: compendiumItemUuid(DOC_IDS["withered-flesh"]),
    name: "Withered Flesh",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["undead","mummy"],
    img: `modules/${MODULE_ID}/assets/items/withered-flesh.svg`,
    description: "A strip of desiccated mummy flesh, hard as leather. Alchemists and dark priests both want it.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.4,"units":"lb"}
  },
  "canopic-dust": {
    id: "canopic-dust",
    documentId: DOC_IDS["canopic-dust"],
    itemUuid: compendiumItemUuid(DOC_IDS["canopic-dust"]),
    name: "Canopic Dust",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["undead","mummy","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/canopic-dust.svg`,
    description: "Fine powder from a shattered canopic jar. Said to hold a fraction of a soul — or just expensive spice.",
    price: {"value":5,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "mummy-heart": {
    id: "mummy-heart",
    documentId: DOC_IDS["mummy-heart"],
    itemUuid: compendiumItemUuid(DOC_IDS["mummy-heart"]),
    name: "Mummy Heart",
    category: "monster-part",
    rarity: "rare",
    tags: ["undead","mummy","rare"],
    img: `modules/${MODULE_ID}/assets/items/mummy-heart.svg`,
    description: "A shriveled heart wrapped in gold thread. The priests meant to remove it — this one stayed.",
    price: {"value":40,"denomination":"gp"},
    weight: {"value":1,"units":"lb"}
  },
  "scarab-bead": {
    id: "scarab-bead",
    documentId: DOC_IDS["scarab-bead"],
    itemUuid: compendiumItemUuid(DOC_IDS["scarab-bead"]),
    name: "Scarab Bead",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","mummy"],
    img: `modules/${MODULE_ID}/assets/items/scarab-bead.svg`,
    description: "A tiny turquoise scarab bead from mummy wrappings. Luck charm — or a curse with nice enamel.",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "hieroglyph-scrap": {
    id: "hieroglyph-scrap",
    documentId: DOC_IDS["hieroglyph-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["hieroglyph-scrap"]),
    name: "Hieroglyph Scrap",
    category: "story",
    rarity: "uncommon",
    tags: ["story","mummy","readable"],
    img: `modules/${MODULE_ID}/assets/items/hieroglyph-scrap.svg`,
    description: "Papyrus fragment: \"The name that must not wake lies beneath the third seal.\" Half a cartouche is burned away.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "curse-tablet": {
    id: "curse-tablet",
    documentId: DOC_IDS["curse-tablet"],
    itemUuid: compendiumItemUuid(DOC_IDS["curse-tablet"]),
    name: "Curse Tablet",
    category: "story",
    rarity: "rare",
    tags: ["story","mummy","readable"],
    img: `modules/${MODULE_ID}/assets/items/curse-tablet.svg`,
    description: "A lead tablet etched with a death-curse naming a tomb robber. The name matches no one living — yet.",
    price: {"value":10,"denomination":"gp"},
    weight: {"value":1,"units":"lb"}
  },
  "lich-dust": {
    id: "lich-dust",
    documentId: DOC_IDS["lich-dust"],
    itemUuid: compendiumItemUuid(DOC_IDS["lich-dust"]),
    name: "Lich Dust",
    category: "monster-part",
    rarity: "rare",
    tags: ["undead","lich","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/lich-dust.svg`,
    description: "Silvery-grey dust that falls from a lich's bones. It drinks light. Worth a fortune to the right buyer.",
    price: {"value":50,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "necrotic-crystal": {
    id: "necrotic-crystal",
    documentId: DOC_IDS["necrotic-crystal"],
    itemUuid: compendiumItemUuid(DOC_IDS["necrotic-crystal"]),
    name: "Necrotic Crystal",
    category: "monster-part",
    rarity: "rare",
    tags: ["undead","lich","crystal"],
    img: `modules/${MODULE_ID}/assets/items/necrotic-crystal.svg`,
    description: "A sharp black crystal grown in necrotic energy. It pulses like a slow heartbeat.",
    price: {"value":75,"denomination":"gp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "soul-ash": {
    id: "soul-ash",
    documentId: DOC_IDS["soul-ash"],
    itemUuid: compendiumItemUuid(DOC_IDS["soul-ash"]),
    name: "Soul Ash",
    category: "monster-part",
    rarity: "rare",
    tags: ["undead","lich","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/soul-ash.svg`,
    description: "Pale ash that whispers when stirred. Remains of souls spent to fuel lichdom.",
    price: {"value":40,"denomination":"gp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "phylactery-shard": {
    id: "phylactery-shard",
    documentId: DOC_IDS["phylactery-shard"],
    itemUuid: compendiumItemUuid(DOC_IDS["phylactery-shard"]),
    name: "Phylactery Shard",
    category: "monster-part",
    rarity: "veryRare",
    tags: ["undead","lich","rare","phylactery"],
    img: `modules/${MODULE_ID}/assets/items/phylactery-shard.svg`,
    description: "A fragment of a lich's phylactery — cold metal etched with binding runes. Extremely dangerous and extremely valuable.",
    price: {"value":500,"denomination":"gp"},
    weight: {"value":1,"units":"lb"}
  },
  "void-wax-candle": {
    id: "void-wax-candle",
    documentId: DOC_IDS["void-wax-candle"],
    itemUuid: compendiumItemUuid(DOC_IDS["void-wax-candle"]),
    name: "Void-Wax Candle",
    category: "junk",
    rarity: "uncommon",
    tags: ["junk","lich"],
    img: `modules/${MODULE_ID}/assets/items/void-wax-candle.svg`,
    description: "A black candle that burns without heat and casts shadows the wrong way. Ritual remnant.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "obsidian-focus": {
    id: "obsidian-focus",
    documentId: DOC_IDS["obsidian-focus"],
    itemUuid: compendiumItemUuid(DOC_IDS["obsidian-focus"]),
    name: "Obsidian Focus",
    category: "trinket",
    rarity: "rare",
    tags: ["trinket","lich","arcane"],
    img: `modules/${MODULE_ID}/assets/items/obsidian-focus.svg`,
    description: "A polished disc of obsidian used to channel necromancy. Still faintly hungry.",
    price: {"value":100,"denomination":"gp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "soul-gem-chip": {
    id: "soul-gem-chip",
    documentId: DOC_IDS["soul-gem-chip"],
    itemUuid: compendiumItemUuid(DOC_IDS["soul-gem-chip"]),
    name: "Soul Gem Chip",
    category: "trinket",
    rarity: "rare",
    tags: ["trinket","lich","gem"],
    img: `modules/${MODULE_ID}/assets/items/soul-gem-chip.svg`,
    description: "A chip from a soul gem. Something moves behind the facets when you aren't looking directly.",
    price: {"value":150,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "phylactery-notes": {
    id: "phylactery-notes",
    documentId: DOC_IDS["phylactery-notes"],
    itemUuid: compendiumItemUuid(DOC_IDS["phylactery-notes"]),
    name: "Phylactery Notes",
    category: "story",
    rarity: "rare",
    tags: ["story","lich","readable"],
    img: `modules/${MODULE_ID}/assets/items/phylactery-notes.svg`,
    description: "Ciphered notes on phylactery construction. One margin: \"Hide it where even I would not look. The mirror lake. Third stone.\"",
    price: {"value":25,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "spell-research-page": {
    id: "spell-research-page",
    documentId: DOC_IDS["spell-research-page"],
    itemUuid: compendiumItemUuid(DOC_IDS["spell-research-page"]),
    name: "Spell Research Page",
    category: "story",
    rarity: "rare",
    tags: ["story","lich","readable","arcane"],
    img: `modules/${MODULE_ID}/assets/items/spell-research-page.svg`,
    description: "A page of incomplete high necromancy. Diagrams of soul-binding circles fill the margins in three inks.",
    price: {"value":50,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "lichdom-formula": {
    id: "lichdom-formula",
    documentId: DOC_IDS["lichdom-formula"],
    itemUuid: compendiumItemUuid(DOC_IDS["lichdom-formula"]),
    name: "Lichdom Formula",
    category: "story",
    rarity: "veryRare",
    tags: ["story","lich","readable","rare"],
    img: `modules/${MODULE_ID}/assets/items/lichdom-formula.svg`,
    description: "A sealed folio titled only \"Ascension.\" Opening it feels like being watched. Completing it would be a campaign — or a catastrophe.",
    price: {"value":1000,"denomination":"gp"},
    weight: {"value":1,"units":"lb"}
  },
  "human-blood-vial": {
    id: "human-blood-vial",
    documentId: DOC_IDS["human-blood-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["human-blood-vial"]),
    name: "Human Blood Vial",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","human","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/human-blood-vial.svg`,
    description: "A stoppered vial of human blood. Common in hedge-magic markets — unsettling to most.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "human-hair-lock": {
    id: "human-hair-lock",
    documentId: DOC_IDS["human-hair-lock"],
    itemUuid: compendiumItemUuid(DOC_IDS["human-hair-lock"]),
    name: "Human Hair Lock",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","human"],
    img: `modules/${MODULE_ID}/assets/items/human-hair-lock.svg`,
    description: "A braided lock of human hair, cut clean. Some rituals call for it; most find it morbid.",
    price: {"value":2,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "worn-insignia": {
    id: "worn-insignia",
    documentId: DOC_IDS["worn-insignia"],
    itemUuid: compendiumItemUuid(DOC_IDS["worn-insignia"]),
    name: "Worn Insignia",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","human"],
    img: `modules/${MODULE_ID}/assets/items/worn-insignia.svg`,
    description: "A tarnished brass badge — town guard, merchant guild, or mercenary company. Hard to tell which.",
    price: {"value":3,"denomination":"sp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "travelers-token": {
    id: "travelers-token",
    documentId: DOC_IDS["travelers-token"],
    itemUuid: compendiumItemUuid(DOC_IDS["travelers-token"]),
    name: "Traveler's Token",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","human"],
    img: `modules/${MODULE_ID}/assets/items/travelers-token.svg`,
    description: "A stamped copper token good for one night at a roadside inn along a trade route.",
    price: {"value":1,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "crumpled-receipt": {
    id: "crumpled-receipt",
    documentId: DOC_IDS["crumpled-receipt"],
    itemUuid: compendiumItemUuid(DOC_IDS["crumpled-receipt"]),
    name: "Crumpled Receipt",
    category: "junk",
    rarity: "common",
    tags: ["junk","human"],
    img: `modules/${MODULE_ID}/assets/items/crumpled-receipt.svg`,
    description: "A crumpled shop receipt for rope, lamp oil, and \"don't ask.\"",
    price: {"value":0,"denomination":"cp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "torn-ledger-page": {
    id: "torn-ledger-page",
    documentId: DOC_IDS["torn-ledger-page"],
    itemUuid: compendiumItemUuid(DOC_IDS["torn-ledger-page"]),
    name: "Torn Ledger Page",
    category: "junk",
    rarity: "common",
    tags: ["junk","human","readable"],
    img: `modules/${MODULE_ID}/assets/items/torn-ledger-page.svg`,
    description: "Half a ledger page listing debts and names. Someone owed money — or collected it.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "guild-letter": {
    id: "guild-letter",
    documentId: DOC_IDS["guild-letter"],
    itemUuid: compendiumItemUuid(DOC_IDS["guild-letter"]),
    name: "Guild Letter",
    category: "story",
    rarity: "uncommon",
    tags: ["story","human","readable"],
    img: `modules/${MODULE_ID}/assets/items/guild-letter.svg`,
    description: "Sealed guild correspondence: \"The shipment leaves at dawn. Watch for the red lantern on the pier.\"",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "bandit-pass": {
    id: "bandit-pass",
    documentId: DOC_IDS["bandit-pass"],
    itemUuid: compendiumItemUuid(DOC_IDS["bandit-pass"]),
    name: "Bandit Pass",
    category: "story",
    rarity: "uncommon",
    tags: ["story","human","readable"],
    img: `modules/${MODULE_ID}/assets/items/bandit-pass.svg`,
    description: "A scrap of cloth with a charcoal mark: \"Safe passage through the ravine — show this to Red Jack.\"",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "love-letter": {
    id: "love-letter",
    documentId: DOC_IDS["love-letter"],
    itemUuid: compendiumItemUuid(DOC_IDS["love-letter"]),
    name: "Love Letter",
    category: "story",
    rarity: "common",
    tags: ["story","human","readable"],
    img: `modules/${MODULE_ID}/assets/items/love-letter.svg`,
    description: "A folded note in careful script: \"Meet me where the willows bend. Bring nothing but yourself.\"",
    price: {"value":1,"denomination":"sp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "elf-blood-vial": {
    id: "elf-blood-vial",
    documentId: DOC_IDS["elf-blood-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["elf-blood-vial"]),
    name: "Elf Blood Vial",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["humanoid","elf","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/elf-blood-vial.svg`,
    description: "A vial of pale, faintly luminous elf blood. Alchemists pay well for fey-touched samples.",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "elf-hair-lock": {
    id: "elf-hair-lock",
    documentId: DOC_IDS["elf-hair-lock"],
    itemUuid: compendiumItemUuid(DOC_IDS["elf-hair-lock"]),
    name: "Elf Hair Lock",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","elf"],
    img: `modules/${MODULE_ID}/assets/items/elf-hair-lock.svg`,
    description: "A fine silver-gold lock of elf hair, impossibly soft. Bards weave them into charms.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "moon-silver-splinter": {
    id: "moon-silver-splinter",
    documentId: DOC_IDS["moon-silver-splinter"],
    itemUuid: compendiumItemUuid(DOC_IDS["moon-silver-splinter"]),
    name: "Moon-Silver Splinter",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["humanoid","elf","crafting"],
    img: `modules/${MODULE_ID}/assets/items/moon-silver-splinter.svg`,
    description: "A hair-thin splinter of moon-silver, sometimes found in elf gear or ritual kits.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "elven-arrowhead": {
    id: "elven-arrowhead",
    documentId: DOC_IDS["elven-arrowhead"],
    itemUuid: compendiumItemUuid(DOC_IDS["elven-arrowhead"]),
    name: "Elven Arrowhead",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","elf"],
    img: `modules/${MODULE_ID}/assets/items/elven-arrowhead.svg`,
    description: "A masterfully fletched arrowhead of pale steel. Elven make — light, sharp, and balanced.",
    price: {"value":8,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "silver-leaf-charm": {
    id: "silver-leaf-charm",
    documentId: DOC_IDS["silver-leaf-charm"],
    itemUuid: compendiumItemUuid(DOC_IDS["silver-leaf-charm"]),
    name: "Silver Leaf Charm",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","elf","religion"],
    img: `modules/${MODULE_ID}/assets/items/silver-leaf-charm.svg`,
    description: "A tiny silver leaf on a silk cord. A woodland blessing — or a mark of the high court.",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "perfume-vial": {
    id: "perfume-vial",
    documentId: DOC_IDS["perfume-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["perfume-vial"]),
    name: "Perfume Vial",
    category: "junk",
    rarity: "common",
    tags: ["junk","elf"],
    img: `modules/${MODULE_ID}/assets/items/perfume-vial.svg`,
    description: "A tiny crystal vial of woodland perfume. Smells of moss, rain, and something ancient.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "silk-scrap": {
    id: "silk-scrap",
    documentId: DOC_IDS["silk-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["silk-scrap"]),
    name: "Silk Scrap",
    category: "junk",
    rarity: "common",
    tags: ["junk","elf"],
    img: `modules/${MODULE_ID}/assets/items/silk-scrap.svg`,
    description: "A scrap of fine elven silk, dyed forest green. Too small for a garment — perfect for spell components.",
    price: {"value":3,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "elven-poetry-scrap": {
    id: "elven-poetry-scrap",
    documentId: DOC_IDS["elven-poetry-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["elven-poetry-scrap"]),
    name: "Elven Poetry Scrap",
    category: "story",
    rarity: "uncommon",
    tags: ["story","elf","readable"],
    img: `modules/${MODULE_ID}/assets/items/elven-poetry-scrap.svg`,
    description: "A line of flowing Elvish script: a lament for a star that fell before your grandparents were born.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "woodland-map": {
    id: "woodland-map",
    documentId: DOC_IDS["woodland-map"],
    itemUuid: compendiumItemUuid(DOC_IDS["woodland-map"]),
    name: "Woodland Map",
    category: "story",
    rarity: "uncommon",
    tags: ["story","elf","readable"],
    img: `modules/${MODULE_ID}/assets/items/woodland-map.svg`,
    description: "Bark-paper map of hidden trails and moonlit clearings. Marked in elven runes.",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "dwarf-blood-vial": {
    id: "dwarf-blood-vial",
    documentId: DOC_IDS["dwarf-blood-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["dwarf-blood-vial"]),
    name: "Dwarf Blood Vial",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","dwarf","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/dwarf-blood-vial.svg`,
    description: "Thick, iron-rich dwarf blood in a stoppered vial. Smells faintly of forge-smoke.",
    price: {"value":8,"denomination":"sp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "dwarf-beard-braid": {
    id: "dwarf-beard-braid",
    documentId: DOC_IDS["dwarf-beard-braid"],
    itemUuid: compendiumItemUuid(DOC_IDS["dwarf-beard-braid"]),
    name: "Dwarf Beard Braid",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","dwarf","trophy"],
    img: `modules/${MODULE_ID}/assets/items/dwarf-beard-braid.svg`,
    description: "A braided lock of dwarf beard-hair bound with a copper ring. Cutting one is a grave insult — taking one is worse.",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "iron-beard-ring": {
    id: "iron-beard-ring",
    documentId: DOC_IDS["iron-beard-ring"],
    itemUuid: compendiumItemUuid(DOC_IDS["iron-beard-ring"]),
    name: "Iron Beard Ring",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","dwarf"],
    img: `modules/${MODULE_ID}/assets/items/iron-beard-ring.svg`,
    description: "A heavy iron ring used to bind a dwarf beard-braid. Clan craft — plain, solid, proud.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "forged-nail": {
    id: "forged-nail",
    documentId: DOC_IDS["forged-nail"],
    itemUuid: compendiumItemUuid(DOC_IDS["forged-nail"]),
    name: "Forged Nail",
    category: "junk",
    rarity: "common",
    tags: ["junk","dwarf","crafting"],
    img: `modules/${MODULE_ID}/assets/items/forged-nail.svg`,
    description: "A square-cut iron nail, dwarf-forged. Holds better than anything from a human smithy.",
    price: {"value":2,"denomination":"cp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "coal-dust-pouch": {
    id: "coal-dust-pouch",
    documentId: DOC_IDS["coal-dust-pouch"],
    itemUuid: compendiumItemUuid(DOC_IDS["coal-dust-pouch"]),
    name: "Coal Dust Pouch",
    category: "junk",
    rarity: "common",
    tags: ["junk","dwarf"],
    img: `modules/${MODULE_ID}/assets/items/coal-dust-pouch.svg`,
    description: "A greasy pouch of fine coal dust from the deep forges. Gets on everything.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "whetstone-chip": {
    id: "whetstone-chip",
    documentId: DOC_IDS["whetstone-chip"],
    itemUuid: compendiumItemUuid(DOC_IDS["whetstone-chip"]),
    name: "Whetstone Chip",
    category: "junk",
    rarity: "common",
    tags: ["junk","dwarf"],
    img: `modules/${MODULE_ID}/assets/items/whetstone-chip.svg`,
    description: "A chip from a well-used whetstone. Dwarves never throw these away — until they must.",
    price: {"value":3,"denomination":"cp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "clan-crest-chip": {
    id: "clan-crest-chip",
    documentId: DOC_IDS["clan-crest-chip"],
    itemUuid: compendiumItemUuid(DOC_IDS["clan-crest-chip"]),
    name: "Clan Crest Chip",
    category: "trinket",
    rarity: "uncommon",
    tags: ["trinket","dwarf"],
    img: `modules/${MODULE_ID}/assets/items/clan-crest-chip.svg`,
    description: "A chipped stone bearing a clan hammer-and-anvil crest. Someone died wearing it.",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "mining-claim": {
    id: "mining-claim",
    documentId: DOC_IDS["mining-claim"],
    itemUuid: compendiumItemUuid(DOC_IDS["mining-claim"]),
    name: "Mining Claim",
    category: "story",
    rarity: "uncommon",
    tags: ["story","dwarf","readable"],
    img: `modules/${MODULE_ID}/assets/items/mining-claim.svg`,
    description: "A stamped claim slip for a played-out silver vein. \"Depth 400 ft. Sealed by clan vote.\"",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "ale-stained-mug": {
    id: "ale-stained-mug",
    documentId: DOC_IDS["ale-stained-mug"],
    itemUuid: compendiumItemUuid(DOC_IDS["ale-stained-mug"]),
    name: "Ale-Stained Mug",
    category: "story",
    rarity: "common",
    tags: ["story","dwarf","junk"],
    img: `modules/${MODULE_ID}/assets/items/ale-stained-mug.svg`,
    description: "A stoneware mug carved with a drinking toast in Dwarvish. The stain never washes out.",
    price: {"value":2,"denomination":"sp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "halfling-blood-vial": {
    id: "halfling-blood-vial",
    documentId: DOC_IDS["halfling-blood-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["halfling-blood-vial"]),
    name: "Halfling Blood Vial",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","halfling","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/halfling-blood-vial.svg`,
    description: "A small vial of halfling blood. Hedge-witches say it brings luck — thieves say it brings questions.",
    price: {"value":4,"denomination":"sp"},
    weight: {"value":0.15,"units":"lb"}
  },
  "halfling-hair-lock": {
    id: "halfling-hair-lock",
    documentId: DOC_IDS["halfling-hair-lock"],
    itemUuid: compendiumItemUuid(DOC_IDS["halfling-hair-lock"]),
    name: "Halfling Hair Lock",
    category: "monster-part",
    rarity: "common",
    tags: ["humanoid","halfling"],
    img: `modules/${MODULE_ID}/assets/items/halfling-hair-lock.svg`,
    description: "A curly lock of halfling hair, bound with a bit of ribbon. Cheerful color — somber circumstance.",
    price: {"value":2,"denomination":"sp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "halfling-pipe": {
    id: "halfling-pipe",
    documentId: DOC_IDS["halfling-pipe"],
    itemUuid: compendiumItemUuid(DOC_IDS["halfling-pipe"]),
    name: "Halfling Pipe",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","halfling"],
    img: `modules/${MODULE_ID}/assets/items/halfling-pipe.svg`,
    description: "A well-loved wooden pipe with a brass bowl. Still smells of sweetleaf tobacco.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "lucky-charm": {
    id: "lucky-charm",
    documentId: DOC_IDS["lucky-charm"],
    itemUuid: compendiumItemUuid(DOC_IDS["lucky-charm"]),
    name: "Lucky Charm",
    category: "trinket",
    rarity: "common",
    tags: ["trinket","halfling"],
    img: `modules/${MODULE_ID}/assets/items/lucky-charm.svg`,
    description: "A carved wooden button on a string. Halflings swear by them; statisticians do not.",
    price: {"value":3,"denomination":"sp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "harvest-apple": {
    id: "harvest-apple",
    documentId: DOC_IDS["harvest-apple"],
    itemUuid: compendiumItemUuid(DOC_IDS["harvest-apple"]),
    name: "Harvest Apple",
    category: "junk",
    rarity: "common",
    tags: ["junk","halfling"],
    img: `modules/${MODULE_ID}/assets/items/harvest-apple.svg`,
    description: "A slightly bruised apple from a halfling's pocket. Still good — probably.",
    price: {"value":0,"denomination":"cp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "pocket-handkerchief": {
    id: "pocket-handkerchief",
    documentId: DOC_IDS["pocket-handkerchief"],
    itemUuid: compendiumItemUuid(DOC_IDS["pocket-handkerchief"]),
    name: "Pocket Handkerchief",
    category: "junk",
    rarity: "common",
    tags: ["junk","halfling"],
    img: `modules/${MODULE_ID}/assets/items/pocket-handkerchief.svg`,
    description: "A neatly folded handkerchief embroidered with tiny flowers. Improbably clean.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "recipe-card": {
    id: "recipe-card",
    documentId: DOC_IDS["recipe-card"],
    itemUuid: compendiumItemUuid(DOC_IDS["recipe-card"]),
    name: "Recipe Card",
    category: "story",
    rarity: "common",
    tags: ["story","halfling","readable"],
    img: `modules/${MODULE_ID}/assets/items/recipe-card.svg`,
    description: "A grease-stuffed recipe for honey-cake. \"A pinch more nutmeg than mother allows.\"",
    price: {"value":2,"denomination":"sp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "county-fair-ticket": {
    id: "county-fair-ticket",
    documentId: DOC_IDS["county-fair-ticket"],
    itemUuid: compendiumItemUuid(DOC_IDS["county-fair-ticket"]),
    name: "County Fair Ticket",
    category: "story",
    rarity: "common",
    tags: ["story","halfling","readable"],
    img: `modules/${MODULE_ID}/assets/items/county-fair-ticket.svg`,
    description: "A ticket stub: \"Pie Contest — Judge's Row — Admit One.\" Never used.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "shire-map-scrap": {
    id: "shire-map-scrap",
    documentId: DOC_IDS["shire-map-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["shire-map-scrap"]),
    name: "Shire Map Scrap",
    category: "story",
    rarity: "uncommon",
    tags: ["story","halfling","readable"],
    img: `modules/${MODULE_ID}/assets/items/shire-map-scrap.svg`,
    description: "A torn map of hedgerows, ponds, and a smial marked with an X. \"Aunt's cellar — best mushrooms.\"",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "fiend-ichor": {
    id: "fiend-ichor",
    documentId: DOC_IDS["fiend-ichor"],
    itemUuid: compendiumItemUuid(DOC_IDS["fiend-ichor"]),
    name: "Fiend Ichor",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fiend","alchemy","blood"],
    img: `modules/${MODULE_ID}/assets/items/fiend-ichor.svg`,
    description: "Black-red ichor that steams in open air. It eats through cheap glass and stains everything it touches.",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "fiend-horn": {
    id: "fiend-horn",
    documentId: DOC_IDS["fiend-horn"],
    itemUuid: compendiumItemUuid(DOC_IDS["fiend-horn"]),
    name: "Fiend Horn",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fiend","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/fiend-horn.svg`,
    description: "A ridged horn, warm to the touch. Smoke curls from the broken base when scraped.",
    price: {"value":12,"denomination":"gp"},
    weight: {"value":1.5,"units":"lb"}
  },
  "brimstone-chunk": {
    id: "brimstone-chunk",
    documentId: DOC_IDS["brimstone-chunk"],
    itemUuid: compendiumItemUuid(DOC_IDS["brimstone-chunk"]),
    name: "Brimstone Chunk",
    category: "monster-part",
    rarity: "common",
    tags: ["fiend","alchemy","mineral"],
    img: `modules/${MODULE_ID}/assets/items/brimstone-chunk.svg`,
    description: "A porous yellow-black lump that reeks of rotten eggs and forge smoke.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.4,"units":"lb"}
  },
  "hellhound-fang": {
    id: "hellhound-fang",
    documentId: DOC_IDS["hellhound-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["hellhound-fang"]),
    name: "Hell Hound Fang",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fiend","hellhound","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/hellhound-fang.svg`,
    description: "A curved fang still warm, smelling faintly of charcoal. Sparks jump if struck on stone.",
    price: {"value":4,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "hellhound-hide": {
    id: "hellhound-hide",
    documentId: DOC_IDS["hellhound-hide"],
    itemUuid: compendiumItemUuid(DOC_IDS["hellhound-hide"]),
    name: "Hell Hound Hide Scrap",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fiend","hellhound","hide","leatherworking"],
    img: `modules/${MODULE_ID}/assets/items/hellhound-hide.svg`,
    description: "Charred fur over heat-toughened hide. Useful for fire-resistant leatherwork — if you can stand the smell.",
    price: {"value":6,"denomination":"gp"},
    weight: {"value":1,"units":"lb"}
  },
  "imp-wing": {
    id: "imp-wing",
    documentId: DOC_IDS["imp-wing"],
    itemUuid: compendiumItemUuid(DOC_IDS["imp-wing"]),
    name: "Imp Wing Membrane",
    category: "monster-part",
    rarity: "common",
    tags: ["fiend","imp","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/imp-wing.svg`,
    description: "A translucent red membrane stretched between brittle fingerbones. Alchemists pay for the residue.",
    price: {"value":8,"denomination":"sp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "quasit-claw": {
    id: "quasit-claw",
    documentId: DOC_IDS["quasit-claw"],
    itemUuid: compendiumItemUuid(DOC_IDS["quasit-claw"]),
    name: "Quasit Claw",
    category: "monster-part",
    rarity: "common",
    tags: ["fiend","quasit","trophy","poison"],
    img: `modules/${MODULE_ID}/assets/items/quasit-claw.svg`,
    description: "A small hooked claw with a greenish sheen. Scratching yourself with it is a terrible idea.",
    price: {"value":6,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "barbed-spine": {
    id: "barbed-spine",
    documentId: DOC_IDS["barbed-spine"],
    itemUuid: compendiumItemUuid(DOC_IDS["barbed-spine"]),
    name: "Barbed Spine",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fiend","devil","barbed","trophy"],
    img: `modules/${MODULE_ID}/assets/items/barbed-spine.svg`,
    description: "A needle-sharp spine pulled from a barbed devil's hide. Still sticky with venomous sweat.",
    price: {"value":5,"denomination":"gp"},
    weight: {"value":0.15,"units":"lb"}
  },
  "devil-chain-link": {
    id: "devil-chain-link",
    documentId: DOC_IDS["devil-chain-link"],
    itemUuid: compendiumItemUuid(DOC_IDS["devil-chain-link"]),
    name: "Devil Chain Link",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fiend","devil","chain","metal"],
    img: `modules/${MODULE_ID}/assets/items/devil-chain-link.svg`,
    description: "A heavy iron link from a chain devil's living chains. It flexes when no one is looking.",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":2,"units":"lb"}
  },
  "bone-spur": {
    id: "bone-spur",
    documentId: DOC_IDS["bone-spur"],
    itemUuid: compendiumItemUuid(DOC_IDS["bone-spur"]),
    name: "Bone Spur",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fiend","devil","bone","trophy"],
    img: `modules/${MODULE_ID}/assets/items/bone-spur.svg`,
    description: "A hooked spur of bone from a bone devil's elbow. Light as ash, hard as iron.",
    price: {"value":10,"denomination":"gp"},
    weight: {"value":0.8,"units":"lb"}
  },
  "pit-fiend-scale": {
    id: "pit-fiend-scale",
    documentId: DOC_IDS["pit-fiend-scale"],
    itemUuid: compendiumItemUuid(DOC_IDS["pit-fiend-scale"]),
    name: "Pit Fiend Scale",
    category: "monster-part",
    rarity: "rare",
    tags: ["fiend","devil","pit-fiend","trophy"],
    img: `modules/${MODULE_ID}/assets/items/pit-fiend-scale.svg`,
    description: "A plate of crimson scale thicker than a shield rim. Heat radiates from its inner face for days.",
    price: {"value":75,"denomination":"gp"},
    weight: {"value":3,"units":"lb"}
  },
  "balor-ash": {
    id: "balor-ash",
    documentId: DOC_IDS["balor-ash"],
    itemUuid: compendiumItemUuid(DOC_IDS["balor-ash"]),
    name: "Balor Ash",
    category: "monster-part",
    rarity: "very rare",
    tags: ["fiend","demon","balor","alchemy","rare"],
    img: `modules/${MODULE_ID}/assets/items/balor-ash.svg`,
    description: "Fine ash left when a balor's corpse burns itself out. It glows when whispered to.",
    price: {"value":250,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "soul-coin-chip": {
    id: "soul-coin-chip",
    documentId: DOC_IDS["soul-coin-chip"],
    itemUuid: compendiumItemUuid(DOC_IDS["soul-coin-chip"]),
    name: "Soul Coin Chip",
    category: "trinket",
    rarity: "rare",
    tags: ["fiend","trinket","currency","infernal"],
    img: `modules/${MODULE_ID}/assets/items/soul-coin-chip.svg`,
    description: "A broken fragment of a soul coin. A face flickers in the metal when held near a flame.",
    price: {"value":25,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "brimstone-charm": {
    id: "brimstone-charm",
    documentId: DOC_IDS["brimstone-charm"],
    itemUuid: compendiumItemUuid(DOC_IDS["brimstone-charm"]),
    name: "Brimstone Charm",
    category: "trinket",
    rarity: "uncommon",
    tags: ["fiend","trinket","charm"],
    img: `modules/${MODULE_ID}/assets/items/brimstone-charm.svg`,
    description: "A yellow stone on a black cord. It grows warm near open portals to the Lower Planes.",
    price: {"value":3,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "infernal-seal": {
    id: "infernal-seal",
    documentId: DOC_IDS["infernal-seal"],
    itemUuid: compendiumItemUuid(DOC_IDS["infernal-seal"]),
    name: "Infernal Seal",
    category: "trinket",
    rarity: "uncommon",
    tags: ["fiend","devil","trinket","infernal"],
    img: `modules/${MODULE_ID}/assets/items/infernal-seal.svg`,
    description: "A brass seal stamped with a devil's personal sigil. Useful for forging orders — and getting killed.",
    price: {"value":15,"denomination":"gp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "abyssal-rune-shard": {
    id: "abyssal-rune-shard",
    documentId: DOC_IDS["abyssal-rune-shard"],
    itemUuid: compendiumItemUuid(DOC_IDS["abyssal-rune-shard"]),
    name: "Abyssal Rune Shard",
    category: "trinket",
    rarity: "rare",
    tags: ["fiend","demon","trinket","abyssal"],
    img: `modules/${MODULE_ID}/assets/items/abyssal-rune-shard.svg`,
    description: "A jagged shard carved with an Abyssal rune that rearranges itself when ignored.",
    price: {"value":40,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "scorched-scrap": {
    id: "scorched-scrap",
    documentId: DOC_IDS["scorched-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["scorched-scrap"]),
    name: "Scorched Scrap",
    category: "junk",
    rarity: "common",
    tags: ["fiend","junk"],
    img: `modules/${MODULE_ID}/assets/items/scorched-scrap.svg`,
    description: "A scrap of metal or leather burned black. Smells like a forge after a bad day.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "melted-coin": {
    id: "melted-coin",
    documentId: DOC_IDS["melted-coin"],
    itemUuid: compendiumItemUuid(DOC_IDS["melted-coin"]),
    name: "Melted Coin",
    category: "junk",
    rarity: "common",
    tags: ["fiend","junk","currency"],
    img: `modules/${MODULE_ID}/assets/items/melted-coin.svg`,
    description: "A coin half-melted into a lump. Face and mint are gone; value is mostly sentimental.",
    price: {"value":2,"denomination":"cp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "sulfur-stained-cloth": {
    id: "sulfur-stained-cloth",
    documentId: DOC_IDS["sulfur-stained-cloth"],
    itemUuid: compendiumItemUuid(DOC_IDS["sulfur-stained-cloth"]),
    name: "Sulfur-Stained Cloth",
    category: "junk",
    rarity: "common",
    tags: ["fiend","junk"],
    img: `modules/${MODULE_ID}/assets/items/sulfur-stained-cloth.svg`,
    description: "A rag yellowed and stiff with sulfur. Was once something nicer.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "infernal-contract": {
    id: "infernal-contract",
    documentId: DOC_IDS["infernal-contract"],
    itemUuid: compendiumItemUuid(DOC_IDS["infernal-contract"]),
    name: "Infernal Contract Scrap",
    category: "story",
    rarity: "uncommon",
    tags: ["fiend","story","readable","infernal"],
    img: `modules/${MODULE_ID}/assets/items/infernal-contract.svg`,
    description: "A torn strip of contract vellum. \"…soul upon death, interest accruing at…\" The rest is burned away.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "blood-war-orders": {
    id: "blood-war-orders",
    documentId: DOC_IDS["blood-war-orders"],
    itemUuid: compendiumItemUuid(DOC_IDS["blood-war-orders"]),
    name: "Blood War Orders",
    category: "story",
    rarity: "uncommon",
    tags: ["fiend","story","readable","military"],
    img: `modules/${MODULE_ID}/assets/items/blood-war-orders.svg`,
    description: "Orders written in Infernal: rally point, target, and a reminder that failure feeds the Abyss.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "cultist-summons": {
    id: "cultist-summons",
    documentId: DOC_IDS["cultist-summons"],
    itemUuid: compendiumItemUuid(DOC_IDS["cultist-summons"]),
    name: "Cultist Summons",
    category: "story",
    rarity: "uncommon",
    tags: ["fiend","story","readable"],
    img: `modules/${MODULE_ID}/assets/items/cultist-summons.svg`,
    description: "A letter summoning cultists to a cellar rite. The meeting time has already passed — or hasn't.",
    price: {"value":3,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "soul-ledger": {
    id: "soul-ledger",
    documentId: DOC_IDS["soul-ledger"],
    itemUuid: compendiumItemUuid(DOC_IDS["soul-ledger"]),
    name: "Soul Ledger Page",
    category: "story",
    rarity: "rare",
    tags: ["fiend","story","readable","infernal"],
    img: `modules/${MODULE_ID}/assets/items/soul-ledger.svg`,
    description: "A page of names, debts, and delivery dates. Several entries are crossed out in gold ink.",
    price: {"value":20,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "fey-dust": {
    id: "fey-dust",
    documentId: DOC_IDS["fey-dust"],
    itemUuid: compendiumItemUuid(DOC_IDS["fey-dust"]),
    name: "Fey Dust",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fey","alchemy","dust"],
    img: `modules/${MODULE_ID}/assets/items/fey-dust.svg`,
    description: "Iridescent dust that slips through fingers and settles into patterns that almost look like words.",
    price: {"value":5,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "fey-blood-vial": {
    id: "fey-blood-vial",
    documentId: DOC_IDS["fey-blood-vial"],
    itemUuid: compendiumItemUuid(DOC_IDS["fey-blood-vial"]),
    name: "Fey Blood Vial",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fey","alchemy","blood"],
    img: `modules/${MODULE_ID}/assets/items/fey-blood-vial.svg`,
    description: "Sap-thin blood that shimmers green-gold. It refuses to clot in daylight.",
    price: {"value":6,"denomination":"gp"},
    weight: {"value":0.25,"units":"lb"}
  },
  "pixie-wing": {
    id: "pixie-wing",
    documentId: DOC_IDS["pixie-wing"],
    itemUuid: compendiumItemUuid(DOC_IDS["pixie-wing"]),
    name: "Pixie Wing",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fey","pixie","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/pixie-wing.svg`,
    description: "A translucent wing veined like a leaf. It flutters when music plays nearby.",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "dryad-bark": {
    id: "dryad-bark",
    documentId: DOC_IDS["dryad-bark"],
    itemUuid: compendiumItemUuid(DOC_IDS["dryad-bark"]),
    name: "Dryad Bark Scrap",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fey","dryad","plant","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/dryad-bark.svg`,
    description: "Living bark peeled from a dryad's skin. Tiny green shoots try to root overnight.",
    price: {"value":4,"denomination":"gp"},
    weight: {"value":0.4,"units":"lb"}
  },
  "satyr-horn": {
    id: "satyr-horn",
    documentId: DOC_IDS["satyr-horn"],
    itemUuid: compendiumItemUuid(DOC_IDS["satyr-horn"]),
    name: "Satyr Horn Tip",
    category: "monster-part",
    rarity: "common",
    tags: ["fey","satyr","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/satyr-horn.svg`,
    description: "A spiral horn tip, still faintly warm. Good for drinking horns or troublemaking.",
    price: {"value":12,"denomination":"sp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "redcap-tooth": {
    id: "redcap-tooth",
    documentId: DOC_IDS["redcap-tooth"],
    itemUuid: compendiumItemUuid(DOC_IDS["redcap-tooth"]),
    name: "Redcap Tooth",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fey","redcap","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/redcap-tooth.svg`,
    description: "A yellowed, iron-hard tooth. Still sticky. Redcaps never clean them.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "hag-hair": {
    id: "hag-hair",
    documentId: DOC_IDS["hag-hair"],
    itemUuid: compendiumItemUuid(DOC_IDS["hag-hair"]),
    name: "Hag Hair Lock",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["fey","hag","alchemy","curse"],
    img: `modules/${MODULE_ID}/assets/items/hag-hair.svg`,
    description: "A greasy lock of hag hair that ties itself into knots. Alchemists and curse-breakers both want it.",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "hag-eye": {
    id: "hag-eye",
    documentId: DOC_IDS["hag-eye"],
    itemUuid: compendiumItemUuid(DOC_IDS["hag-eye"]),
    name: "Hag Eye",
    category: "monster-part",
    rarity: "rare",
    tags: ["fey","hag","night-hag","alchemy","rare"],
    img: `modules/${MODULE_ID}/assets/items/hag-eye.svg`,
    description: "A milky eye still twitching in its jar. Night hags use these for coven sight — and worse.",
    price: {"value":50,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "fairy-ring-mushroom": {
    id: "fairy-ring-mushroom",
    documentId: DOC_IDS["fairy-ring-mushroom"],
    itemUuid: compendiumItemUuid(DOC_IDS["fairy-ring-mushroom"]),
    name: "Fairy Ring Mushroom",
    category: "trinket",
    rarity: "uncommon",
    tags: ["fey","trinket","plant"],
    img: `modules/${MODULE_ID}/assets/items/fairy-ring-mushroom.svg`,
    description: "A spotted mushroom from a fairy ring. Eating it is a gamble; keeping it is wiser.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "moonbeam-crystal": {
    id: "moonbeam-crystal",
    documentId: DOC_IDS["moonbeam-crystal"],
    itemUuid: compendiumItemUuid(DOC_IDS["moonbeam-crystal"]),
    name: "Moonbeam Crystal",
    category: "trinket",
    rarity: "uncommon",
    tags: ["fey","trinket","crystal"],
    img: `modules/${MODULE_ID}/assets/items/moonbeam-crystal.svg`,
    description: "A pale crystal that glows faintly under moonlight and not at all under sun.",
    price: {"value":12,"denomination":"gp"},
    weight: {"value":0.15,"units":"lb"}
  },
  "iron-nail-ward": {
    id: "iron-nail-ward",
    documentId: DOC_IDS["iron-nail-ward"],
    itemUuid: compendiumItemUuid(DOC_IDS["iron-nail-ward"]),
    name: "Iron Nail Ward",
    category: "trinket",
    rarity: "common",
    tags: ["fey","trinket","ward"],
    img: `modules/${MODULE_ID}/assets/items/iron-nail-ward.svg`,
    description: "A bent cold-iron nail on a cord. Fey hate it. Mortals wear it anyway.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "hag-eye-amulet": {
    id: "hag-eye-amulet",
    documentId: DOC_IDS["hag-eye-amulet"],
    itemUuid: compendiumItemUuid(DOC_IDS["hag-eye-amulet"]),
    name: "Hag Eye Amulet",
    category: "trinket",
    rarity: "rare",
    tags: ["fey","hag","trinket","curse"],
    img: `modules/${MODULE_ID}/assets/items/hag-eye-amulet.svg`,
    description: "A cloudy glass eye set in tarnished silver. Sometimes it looks at you first.",
    price: {"value":35,"denomination":"gp"},
    weight: {"value":0.25,"units":"lb"}
  },
  "wilted-petal": {
    id: "wilted-petal",
    documentId: DOC_IDS["wilted-petal"],
    itemUuid: compendiumItemUuid(DOC_IDS["wilted-petal"]),
    name: "Wilted Petal",
    category: "junk",
    rarity: "common",
    tags: ["fey","junk","plant"],
    img: `modules/${MODULE_ID}/assets/items/wilted-petal.svg`,
    description: "A once-bright petal gone brown at the edges. Still smells faintly of spring.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.01,"units":"lb"}
  },
  "tangled-vine": {
    id: "tangled-vine",
    documentId: DOC_IDS["tangled-vine"],
    itemUuid: compendiumItemUuid(DOC_IDS["tangled-vine"]),
    name: "Tangled Vine",
    category: "junk",
    rarity: "common",
    tags: ["fey","junk","plant"],
    img: `modules/${MODULE_ID}/assets/items/tangled-vine.svg`,
    description: "A snarl of vine that unties itself if you look away.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "torn-ribbon": {
    id: "torn-ribbon",
    documentId: DOC_IDS["torn-ribbon"],
    itemUuid: compendiumItemUuid(DOC_IDS["torn-ribbon"]),
    name: "Torn Ribbon",
    category: "junk",
    rarity: "common",
    tags: ["fey","junk"],
    img: `modules/${MODULE_ID}/assets/items/torn-ribbon.svg`,
    description: "A scrap of festival ribbon, muddied and snagged. Someone danced hard.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.02,"units":"lb"}
  },
  "bloodstained-cap": {
    id: "bloodstained-cap",
    documentId: DOC_IDS["bloodstained-cap"],
    itemUuid: compendiumItemUuid(DOC_IDS["bloodstained-cap"]),
    name: "Bloodstained Cap Scrap",
    category: "junk",
    rarity: "common",
    tags: ["fey","redcap","junk"],
    img: `modules/${MODULE_ID}/assets/items/bloodstained-cap.svg`,
    description: "A scrap of a redcap's hat, stiff with old blood. They dye them the hard way.",
    price: {"value":2,"denomination":"cp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "fey-bargain-scrap": {
    id: "fey-bargain-scrap",
    documentId: DOC_IDS["fey-bargain-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["fey-bargain-scrap"]),
    name: "Fey Bargain Scrap",
    category: "story",
    rarity: "uncommon",
    tags: ["fey","story","readable"],
    img: `modules/${MODULE_ID}/assets/items/fey-bargain-scrap.svg`,
    description: "A torn promise written in flower-ink: \"Three truths for one name…\" The rest is eaten by snails.",
    price: {"value":1,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "court-invitation": {
    id: "court-invitation",
    documentId: DOC_IDS["court-invitation"],
    itemUuid: compendiumItemUuid(DOC_IDS["court-invitation"]),
    name: "Court Invitation",
    category: "story",
    rarity: "uncommon",
    tags: ["fey","story","readable"],
    img: `modules/${MODULE_ID}/assets/items/court-invitation.svg`,
    description: "An invitation to a revel \"beneath the third oak.\" No date. Fey assume you know.",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "hag-coven-note": {
    id: "hag-coven-note",
    documentId: DOC_IDS["hag-coven-note"],
    itemUuid: compendiumItemUuid(DOC_IDS["hag-coven-note"]),
    name: "Hag Coven Note",
    category: "story",
    rarity: "uncommon",
    tags: ["fey","hag","story","readable"],
    img: `modules/${MODULE_ID}/assets/items/hag-coven-note.svg`,
    description: "A damp note: \"Sister — bring the child at moonrise. The eye hungers.\" Signed with a claw mark.",
    price: {"value":8,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "stolen-name-list": {
    id: "stolen-name-list",
    documentId: DOC_IDS["stolen-name-list"],
    itemUuid: compendiumItemUuid(DOC_IDS["stolen-name-list"]),
    name: "Stolen Name List",
    category: "story",
    rarity: "rare",
    tags: ["fey","hag","story","readable"],
    img: `modules/${MODULE_ID}/assets/items/stolen-name-list.svg`,
    description: "A list of mortal names, some crossed out in green ink. Knowing a true name is dangerous currency.",
    price: {"value":15,"denomination":"gp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "monstrosity-hide": {
    id: "monstrosity-hide",
    documentId: DOC_IDS["monstrosity-hide"],
    itemUuid: compendiumItemUuid(DOC_IDS["monstrosity-hide"]),
    name: "Monstrosity Hide Scrap",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","hide","leatherworking"],
    img: `modules/${MODULE_ID}/assets/items/monstrosity-hide.svg`,
    description: "A tough scrap of hide from something that should not exist. Stitchers pay well; taxidermists pay better.",
    price: {"value":4,"denomination":"gp"},
    weight: {"value":1,"units":"lb"}
  },
  "monstrosity-fang": {
    id: "monstrosity-fang",
    documentId: DOC_IDS["monstrosity-fang"],
    itemUuid: compendiumItemUuid(DOC_IDS["monstrosity-fang"]),
    name: "Monstrosity Fang",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/monstrosity-fang.svg`,
    description: "A thick fang, still notched from bone. Trophy hunters love these; alchemists grind them.",
    price: {"value":3,"denomination":"gp"},
    weight: {"value":0.4,"units":"lb"}
  },
  "owlbear-feather": {
    id: "owlbear-feather",
    documentId: DOC_IDS["owlbear-feather"],
    itemUuid: compendiumItemUuid(DOC_IDS["owlbear-feather"]),
    name: "Owlbear Feather",
    category: "monster-part",
    rarity: "common",
    tags: ["monstrosity","owlbear","trophy"],
    img: `modules/${MODULE_ID}/assets/items/owlbear-feather.svg`,
    description: "A stiff feather from an owlbear's crest. Smells like wet dog and pine.",
    price: {"value":8,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "owlbear-claw": {
    id: "owlbear-claw",
    documentId: DOC_IDS["owlbear-claw"],
    itemUuid: compendiumItemUuid(DOC_IDS["owlbear-claw"]),
    name: "Owlbear Claw",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","owlbear","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/owlbear-claw.svg`,
    description: "A curved black claw longer than a dagger. Still hooked with bark and fur.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.3,"units":"lb"}
  },
  "basilisk-eye": {
    id: "basilisk-eye",
    documentId: DOC_IDS["basilisk-eye"],
    itemUuid: compendiumItemUuid(DOC_IDS["basilisk-eye"]),
    name: "Basilisk Eye",
    category: "monster-part",
    rarity: "rare",
    tags: ["monstrosity","basilisk","alchemy","rare"],
    img: `modules/${MODULE_ID}/assets/items/basilisk-eye.svg`,
    description: "A cloudy eye that never quite looks away. Alchemists warn: don't meet its gaze even dead.",
    price: {"value":40,"denomination":"gp"},
    weight: {"value":0.25,"units":"lb"}
  },
  "basilisk-scale": {
    id: "basilisk-scale",
    documentId: DOC_IDS["basilisk-scale"],
    itemUuid: compendiumItemUuid(DOC_IDS["basilisk-scale"]),
    name: "Basilisk Scale",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","basilisk","trophy"],
    img: `modules/${MODULE_ID}/assets/items/basilisk-scale.svg`,
    description: "A dull green-grey scale, oddly heavy. Edges look half-stone.",
    price: {"value":5,"denomination":"gp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "cockatrice-feather": {
    id: "cockatrice-feather",
    documentId: DOC_IDS["cockatrice-feather"],
    itemUuid: compendiumItemUuid(DOC_IDS["cockatrice-feather"]),
    name: "Cockatrice Feather",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","cockatrice","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/cockatrice-feather.svg`,
    description: "A mottled feather that leaves a chalky dust on your fingers. Don't lick them.",
    price: {"value":15,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "chimera-horn": {
    id: "chimera-horn",
    documentId: DOC_IDS["chimera-horn"],
    itemUuid: compendiumItemUuid(DOC_IDS["chimera-horn"]),
    name: "Chimera Horn",
    category: "monster-part",
    rarity: "rare",
    tags: ["monstrosity","chimera","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/chimera-horn.svg`,
    description: "A goat-head horn from a chimera, scorched along one edge. Three heads, one trophy.",
    price: {"value":25,"denomination":"gp"},
    weight: {"value":2,"units":"lb"}
  },
  "griffon-feather": {
    id: "griffon-feather",
    documentId: DOC_IDS["griffon-feather"],
    itemUuid: compendiumItemUuid(DOC_IDS["griffon-feather"]),
    name: "Griffon Feather",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","griffon","trophy"],
    img: `modules/${MODULE_ID}/assets/items/griffon-feather.svg`,
    description: "A long flight feather, half eagle and somehow half lion. It never quite lies flat.",
    price: {"value":2,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "manticore-spike": {
    id: "manticore-spike",
    documentId: DOC_IDS["manticore-spike"],
    itemUuid: compendiumItemUuid(DOC_IDS["manticore-spike"]),
    name: "Manticore Spike",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","manticore","trophy"],
    img: `modules/${MODULE_ID}/assets/items/manticore-spike.svg`,
    description: "A barbed tail spike. Still sticky. Manticores launch these like quarrels.",
    price: {"value":3,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "hydra-tooth": {
    id: "hydra-tooth",
    documentId: DOC_IDS["hydra-tooth"],
    itemUuid: compendiumItemUuid(DOC_IDS["hydra-tooth"]),
    name: "Hydra Tooth",
    category: "monster-part",
    rarity: "rare",
    tags: ["monstrosity","hydra","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/hydra-tooth.svg`,
    description: "A dagger-length tooth from a hydra jaw. If you plant it, locals swear something grows.",
    price: {"value":20,"denomination":"gp"},
    weight: {"value":0.6,"units":"lb"}
  },
  "bulette-plate": {
    id: "bulette-plate",
    documentId: DOC_IDS["bulette-plate"],
    itemUuid: compendiumItemUuid(DOC_IDS["bulette-plate"]),
    name: "Bulette Plate",
    category: "monster-part",
    rarity: "rare",
    tags: ["monstrosity","bulette","armor","trophy"],
    img: `modules/${MODULE_ID}/assets/items/bulette-plate.svg`,
    description: "A curved armor plate from a land shark's back. Armorers dream of these.",
    price: {"value":35,"denomination":"gp"},
    weight: {"value":4,"units":"lb"}
  },
  "ankheg-chitin": {
    id: "ankheg-chitin",
    documentId: DOC_IDS["ankheg-chitin"],
    itemUuid: compendiumItemUuid(DOC_IDS["ankheg-chitin"]),
    name: "Ankheg Chitin",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","ankheg","chitin"],
    img: `modules/${MODULE_ID}/assets/items/ankheg-chitin.svg`,
    description: "A curved plate of brown-green chitin, acid-pitted along the edges.",
    price: {"value":4,"denomination":"gp"},
    weight: {"value":1.5,"units":"lb"}
  },
  "ankheg-acid-sac": {
    id: "ankheg-acid-sac",
    documentId: DOC_IDS["ankheg-acid-sac"],
    itemUuid: compendiumItemUuid(DOC_IDS["ankheg-acid-sac"]),
    name: "Ankheg Acid Sac",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","ankheg","alchemy","acid"],
    img: `modules/${MODULE_ID}/assets/items/ankheg-acid-sac.svg`,
    description: "A sealed gland of green-black acid. Handle with tongs. Or better: don't.",
    price: {"value":8,"denomination":"gp"},
    weight: {"value":0.5,"units":"lb"}
  },
  "purple-worm-tooth": {
    id: "purple-worm-tooth",
    documentId: DOC_IDS["purple-worm-tooth"],
    itemUuid: compendiumItemUuid(DOC_IDS["purple-worm-tooth"]),
    name: "Purple Worm Tooth",
    category: "monster-part",
    rarity: "very rare",
    tags: ["monstrosity","purple-worm","trophy","bone"],
    img: `modules/${MODULE_ID}/assets/items/purple-worm-tooth.svg`,
    description: "A tooth the size of a shortsword, purple-stained at the root. Tunnelers carve tools from these.",
    price: {"value":100,"denomination":"gp"},
    weight: {"value":8,"units":"lb"}
  },
  "mimic-adhesive": {
    id: "mimic-adhesive",
    documentId: DOC_IDS["mimic-adhesive"],
    itemUuid: compendiumItemUuid(DOC_IDS["mimic-adhesive"]),
    name: "Mimic Adhesive",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","mimic","alchemy"],
    img: `modules/${MODULE_ID}/assets/items/mimic-adhesive.svg`,
    description: "A jar of sticky grey goo that never quite dries. Glue-makers and trapwrights bid for it.",
    price: {"value":6,"denomination":"gp"},
    weight: {"value":0.4,"units":"lb"}
  },
  "roper-tendril": {
    id: "roper-tendril",
    documentId: DOC_IDS["roper-tendril"],
    itemUuid: compendiumItemUuid(DOC_IDS["roper-tendril"]),
    name: "Roper Tendril",
    category: "monster-part",
    rarity: "uncommon",
    tags: ["monstrosity","roper","trophy"],
    img: `modules/${MODULE_ID}/assets/items/roper-tendril.svg`,
    description: "A rubbery tendril tip, still twitching. Sticky enough to hang a lantern.",
    price: {"value":5,"denomination":"gp"},
    weight: {"value":1,"units":"lb"}
  },
  "petrified-chip": {
    id: "petrified-chip",
    documentId: DOC_IDS["petrified-chip"],
    itemUuid: compendiumItemUuid(DOC_IDS["petrified-chip"]),
    name: "Petrified Chip",
    category: "trinket",
    rarity: "uncommon",
    tags: ["monstrosity","trinket","stone"],
    img: `modules/${MODULE_ID}/assets/items/petrified-chip.svg`,
    description: "A chip of flesh turned to stone. Basilisks and cockatrices leave these in their wake.",
    price: {"value":3,"denomination":"gp"},
    weight: {"value":0.2,"units":"lb"}
  },
  "nest-egg-shard": {
    id: "nest-egg-shard",
    documentId: DOC_IDS["nest-egg-shard"],
    itemUuid: compendiumItemUuid(DOC_IDS["nest-egg-shard"]),
    name: "Nest Egg Shard",
    category: "trinket",
    rarity: "uncommon",
    tags: ["monstrosity","trinket"],
    img: `modules/${MODULE_ID}/assets/items/nest-egg-shard.svg`,
    description: "A fragment of a thick, mottled eggshell from a monstrosity nest.",
    price: {"value":12,"denomination":"sp"},
    weight: {"value":0.15,"units":"lb"}
  },
  "shed-scale": {
    id: "shed-scale",
    documentId: DOC_IDS["shed-scale"],
    itemUuid: compendiumItemUuid(DOC_IDS["shed-scale"]),
    name: "Shed Scale",
    category: "junk",
    rarity: "common",
    tags: ["monstrosity","junk"],
    img: `modules/${MODULE_ID}/assets/items/shed-scale.svg`,
    description: "A dull, discarded scale. Not worth much, but it proves something large passed through.",
    price: {"value":2,"denomination":"cp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "sticky-residue": {
    id: "sticky-residue",
    documentId: DOC_IDS["sticky-residue"],
    itemUuid: compendiumItemUuid(DOC_IDS["sticky-residue"]),
    name: "Sticky Residue",
    category: "junk",
    rarity: "common",
    tags: ["monstrosity","junk","mimic"],
    img: `modules/${MODULE_ID}/assets/items/sticky-residue.svg`,
    description: "A smear of adhesive left on stone or wood. Boots hate it.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "dug-up-pebble": {
    id: "dug-up-pebble",
    documentId: DOC_IDS["dug-up-pebble"],
    itemUuid: compendiumItemUuid(DOC_IDS["dug-up-pebble"]),
    name: "Dug-Up Pebble",
    category: "junk",
    rarity: "common",
    tags: ["monstrosity","junk"],
    img: `modules/${MODULE_ID}/assets/items/dug-up-pebble.svg`,
    description: "A pebble pushed up by something burrowing below. Ordinary — until you notice the tooth marks.",
    price: {"value":1,"denomination":"cp"},
    weight: {"value":0.1,"units":"lb"}
  },
  "hunter-warning": {
    id: "hunter-warning",
    documentId: DOC_IDS["hunter-warning"],
    itemUuid: compendiumItemUuid(DOC_IDS["hunter-warning"]),
    name: "Hunter Warning",
    category: "story",
    rarity: "uncommon",
    tags: ["monstrosity","story","readable"],
    img: `modules/${MODULE_ID}/assets/items/hunter-warning.svg`,
    description: "A nail-stuck scrap: \"NEST AHEAD — THREE HEADS. DO NOT WHISTLE.\" Signed in blood.",
    price: {"value":3,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "nest-map-scrap": {
    id: "nest-map-scrap",
    documentId: DOC_IDS["nest-map-scrap"],
    itemUuid: compendiumItemUuid(DOC_IDS["nest-map-scrap"]),
    name: "Nest Map Scrap",
    category: "story",
    rarity: "uncommon",
    tags: ["monstrosity","story","readable"],
    img: `modules/${MODULE_ID}/assets/items/nest-map-scrap.svg`,
    description: "A torn map marking a cliff nest and a note: \"Eggs still warm. Bring rope.\"",
    price: {"value":5,"denomination":"sp"},
    weight: {"value":0.05,"units":"lb"}
  },
  "worm-tunnel-chart": {
    id: "worm-tunnel-chart",
    documentId: DOC_IDS["worm-tunnel-chart"],
    itemUuid: compendiumItemUuid(DOC_IDS["worm-tunnel-chart"]),
    name: "Worm Tunnel Chart",
    category: "story",
    rarity: "rare",
    tags: ["monstrosity","purple-worm","story","readable"],
    img: `modules/${MODULE_ID}/assets/items/worm-tunnel-chart.svg`,
    description: "A chart of underdark tunnels marked with purple ink. Several routes end in \"GONE.\"",
    price: {"value":12,"denomination":"gp"},
    weight: {"value":0.1,"units":"lb"}
  }
};

/**
 * @param {string} definitionId
 * @returns {LootDefinition|null}
 */
export function getLootDefinition(definitionId) {
  return LOOT_DEFINITIONS[definitionId] ?? null;
}

/**
 * @returns {LootDefinition[]}
 */
export function listLootDefinitions() {
  return Object.values(LOOT_DEFINITIONS);
}

/**
 * Build a fallback Item create-data object when the compendium UUID cannot be resolved.
 * Not the canonical source — the pack Item is.
 *
 * @param {LootDefinition} def
 * @param {object} [options]
 * @param {number} [options.quantity=1]
 * @param {string} [options.sourceCreature=""]
 * @returns {object}
 */
export function buildFallbackItemData(def, { quantity = 1, sourceCreature = "" } = {}) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  return {
    name: def.name,
    type: "loot",
    img: def.img || `modules/${MODULE_ID}/assets/ui/loot-bag.svg`,
    system: {
      description: {
        value: `<p>${def.description}</p>`,
        chat: def.description
      },
      quantity: qty,
      weight: {
        value: Number(def.weight?.value ?? 0),
        units: def.weight?.units || "lb"
      },
      price: {
        value: Number(def.price?.value ?? 0),
        denomination: def.price?.denomination || "gp"
      },
      rarity: def.rarity || "common",
      identified: true
    },
    flags: {
      lootforge: {
        definitionId: def.id,
        category: def.category,
        rarity: def.rarity,
        tags: [...(def.tags ?? [])],
        sourceCreature: sourceCreature || "",
        generatedByLootForge: true,
        stackingKey: def.id,
        itemUuid: def.itemUuid
      }
    }
  };
}

/**
 * @deprecated Use buildFallbackItemData / resolveItemDataForTransfer
 */
export function definitionToItemData(definitionOrId, options = {}) {
  const def = typeof definitionOrId === "string"
    ? getLootDefinition(definitionOrId)
    : definitionOrId;
  if (!def) throw new Error(`Unknown LootForge definition: ${definitionOrId}`);
  return buildFallbackItemData(def, options);
}

/**
 * Clone create-data from a resolved Item document (never mutates the source).
 * @param {Item|object} doc
 * @param {object} [options]
 * @param {number} [options.quantity=1]
 * @param {string} [options.sourceCreature=""]
 * @param {LootDefinition|null} [options.definition]
 * @returns {object}
 */
export function cloneItemDataFromDocument(doc, {
  quantity = 1,
  sourceCreature = "",
  definition = null
} = {}) {
  const data = typeof doc.toObject === "function"
    ? doc.toObject()
    : foundry.utils.duplicate(doc);

  delete data._id;
  delete data.folder;
  delete data.sort;
  delete data._stats;
  if (data.ownership) delete data.ownership;

  data.system ??= {};
  data.system.quantity = Math.max(1, Math.floor(Number(quantity) || 1));

  const def = definition ?? getLootDefinition(data.flags?.lootforge?.definitionId);
  data.flags ??= {};
  data.flags.lootforge = {
    ...(data.flags.lootforge ?? {}),
    definitionId: def?.id ?? data.flags.lootforge?.definitionId,
    category: def?.category ?? data.flags.lootforge?.category,
    rarity: def?.rarity ?? data.flags.lootforge?.rarity,
    tags: def?.tags ? [...def.tags] : (data.flags.lootforge?.tags ?? []),
    stackingKey: def?.id ?? data.flags.lootforge?.stackingKey,
    itemUuid: def?.itemUuid ?? data.flags.lootforge?.itemUuid,
    sourceCreature: sourceCreature || data.flags.lootforge?.sourceCreature || "",
    generatedByLootForge: true
  };

  return data;
}

/**
 * Resolve Item create-data: pack UUID → stored snapshot → definition fallback.
 *
 * @param {object} entry  Corpse loot entry
 * @param {object} [options]
 * @param {number} [options.quantity]
 * @param {string} [options.sourceCreature=""]
 * @returns {Promise<object>}
 */
export async function resolveItemDataForTransfer(entry, {
  quantity,
  sourceCreature = ""
} = {}) {
  const qty = Math.max(1, Math.floor(Number(quantity ?? entry.quantity) || 1));

  // Equipment / official system-item clones always prefer their stored snapshot.
  if ((entry?.kind === "equipment" || entry?.kind === "system-item") && entry.itemData) {
    const duplicate = globalThis.foundry?.utils?.duplicate
      ?? ((obj) => JSON.parse(JSON.stringify(obj)));
    const data = duplicate(entry.itemData);
    delete data._id;
    data.system ??= {};
    data.system.quantity = qty;
    data.flags ??= {};
    data.flags.lootforge = {
      ...(data.flags.lootforge ?? {}),
      kind: "equipment",
      equipmentQuality: entry.equipmentQuality ?? data.flags.lootforge?.equipmentQuality,
      sourceCreature: sourceCreature || data.flags.lootforge?.sourceCreature || "",
      generatedByLootForge: true,
      stackingKey: data.flags.lootforge?.stackingKey
        ?? `equip-${entry.entryId || entry.definitionId}`
    };
    return data;
  }

  const def = getLootDefinition(entry.definitionId);
  // Prefer UUID already stored on the corpse entry; otherwise the definition UUID.
  const uuid = entry.itemUuid || def?.itemUuid;

  // 1) Canonical path: clone from the module Item compendium (read-only source).
  //    Never update/create inside the pack — only clone create-data for the actor.
  if (uuid && typeof globalThis.fromUuid === "function") {
    try {
      const doc = await globalThis.fromUuid(uuid);
      if (doc) {
        return cloneItemDataFromDocument(doc, {
          quantity: qty,
          sourceCreature,
          definition: def
        });
      }
    } catch (err) {
      console.warn("LootForge | fromUuid failed, using snapshot/fallback", uuid, err);
    }
  }

  // 2) Stored snapshot from generation time (or v0.2.1+ corpse entries).
  if (entry.itemData) {
    const duplicate = globalThis.foundry?.utils?.duplicate
      ?? ((obj) => JSON.parse(JSON.stringify(obj)));
    const data = duplicate(entry.itemData);
    delete data._id;
    data.system ??= {};
    data.system.quantity = qty;
    data.flags ??= {};
    data.flags.lootforge = {
      ...(data.flags.lootforge ?? {}),
      sourceCreature: sourceCreature || data.flags.lootforge?.sourceCreature || "",
      generatedByLootForge: true,
      stackingKey: data.flags.lootforge?.stackingKey
        ?? def?.id
        ?? entry.definitionId
    };
    return data;
  }

  // 3) Legacy v0.2.0 corpse entries / corrupted UUID: definition fallback snapshot.
  if (!def) throw new Error(`Unknown LootForge definition: ${entry.definitionId}`);
  return buildFallbackItemData(def, { quantity: qty, sourceCreature });
}

/**
 * Build a quantity-neutral snapshot for corpse storage.
 * Prefer cloning from the live pack document.
 *
 * @param {LootDefinition} def
 * @returns {Promise<object>}
 */
export async function buildItemSnapshot(def) {
  if (def?.itemUuid && typeof fromUuid === "function") {
    try {
      const doc = await fromUuid(def.itemUuid);
      if (doc) {
        const data = cloneItemDataFromDocument(doc, {
          quantity: 1,
          definition: def
        });
        // Snapshot stores quantity 1; transfer overwrites.
        return data;
      }
    } catch (err) {
      console.warn("LootForge | snapshot fromUuid failed", def.itemUuid, err);
    }
  }
  return buildFallbackItemData(def, { quantity: 1 });
}

/**
 * @param {LootDefinition} def
 * @returns {string}
 */
export function formatDefinitionValue(def) {
  if (!def?.price) return "—";
  return `${def.price.value} ${def.price.denomination}`;
}
