# LootForge

Interactive looting and harvesting for defeated creatures in Foundry VTT. Built for **Gambits Forge**.

## Status

| Item | Value |
| --- | --- |
| Version | **0.5.24** |
| Foundry | 13–14 (verified **14**) |
| System | dnd5e 4.0+ (verified **5.3.3**) |
| Scope | **Wolf**, **Beasts** (Boar–Shark), **Spider**, **Animated Armor**, **Goblin**, **Hobgoblin**, **Bugbear**, **Stock Humanoids** (Bandit–Berserker), **Human**, **Elf**, **Dwarf**, **Halfling**, **Orc**, **Dragon**, **Zombie**, **Skeleton**, **Mummy**, **Lich**, **Fiend** (Imp–Balor), **Fey** (Pixie–Night Hag), **Monstrosity** (Owlbear–Purple Worm), **Giant** (Hill–Storm), **Elemental** (Fire–Air + Myrmidons), **Aberration** (Mind Flayer–Aboleth), **Ooze** (Gray–Black Pudding), **Construct** (Flying Sword–Shield Guardian; Animated Armor salvage), **Plant** (Twig Blight–Treant), **Celestial** (Pegasus–Solar), **Bosses** (Ancient Red Dragon, Kraken, Tarrasque, Demon Lord, Archmage, Lich King), **Chest / Container** |

## Flow (v0.4+)

1. Creature is marked **dead** → white sparkles appear.
2. A **player** **double-left-clicks** an unowned dead NPC → skill auto-rolls once (**Survival** for beasts/animals, **Investigation** otherwise).
3. **DM Review** opens automatically for the GM — edit quantities, reroll, add/remove items.
4. GM **Save & Close** or **Close** → loot is released free-for-all and the **player Items window opens automatically**.
5. Players can double-left-click again anytime to reopen the shared Items window; takes live-sync across clients.
6. Fully looted → sparkles off; corpse is hidden (`hiddenByLootForge`).
7. GM **Reset Loot** restores the corpse for another pass.

### Sheet access vs loot

- **GM** double-click on a dead creature opens the **character sheet** (loot via HUD / Alt+L / scene control).
- **Players** who own an actor (including a dead PC) still open their **character sheet**.
- Only **unowned dead NPCs** start the loot flow on player double-click.

## Creature loot notes

- **Wolf** — wolf parts only (whole-word match; excludes “wolf spider”). Legacy `drops[]` profile. Dire Wolf uses this profile.
- **Beasts** — multi-pool profile for Boar, Bear, Panther, Lion, Tiger, Giant Rat, Giant Scorpion, Giant Snake, Giant Frog, Giant Eagle, Giant Owl, Crocodile, Shark (and common variants):
  - Parts (hide, fang, claw, meat) plus form trophies (tusks, stingers, feathers, shark teeth)
  - Sparse swallowed coin / nest junk; occasional sheet gear from prey
  - Hunter trail maps & lair scratchings
  - **Name scaling:** Giant Rat drops less; Giant Shark / Scorpion drop more (`lootScale`)
  - Wolf and Spider stay on their dedicated profiles
- **Spider / Wolf Spider / Phase Spider** — multi-pool beast profile:
  - Monster parts (silk, fang, venom gland, eye, chitin, rare spinneret)
  - Occasional web-caught coins
  - Equipment from the NPC’s **actual inventory** if present (victim gear), with quality
  - Web junk, trinkets, and cocooned story scraps
- **Animated Armor** — exactly **one** salvaged armor piece; Investigation quality sets the tier.
- **Construct** — multi-pool profile for flying swords, helmed horrors, golems, and shield guardians:
  - Parts (gears, arcane core shards, form trophies, rare guardian amulet shards)
  - Sparse workshop coin and **sheet equipment** when present
  - Rivets / scorched wiring junk, clockwork springs, creator schematics & golem manual pages
  - **Name scaling:** Flying Sword drops less; Iron Golem / Shield Guardian drop more (`lootScale`)
  - Animated Armor stays on its salvage-only profile (matched first)
- **Plant** — multi-pool profile for blights, myconids, shambling mounds, and treants:
  - Parts (plant fiber, living sap, form trophies, rare heartwood cores)
  - Sparse grove coin and **sheet equipment** tangled in vines when present
  - Dry leaves / thorns / moldy roots, blossom charms, grove warnings & blight maps
  - **Name scaling:** Twig Blight drops less; Shambling Mound / Treant drop more (`lootScale`)
- **Celestial** — multi-pool profile for pegasi, unicorns, couatls, planetars, and solars:
  - Parts (celestial feathers, radiant essence, form trophies, rare solar halo shards)
  - Temple/tribute currency and **sheet equipment** (angelic gear) when present
  - Shed down / prayer ribbons, dawn pearls, heavenly mandates & solar edicts
  - **Name scaling:** Pegasus drops less; Planetar / Solar drop more (`lootScale`)
- **Bosses (Tier 5)** — unique profiles matched before family generics:
  - **Ancient Red Dragon**, **Kraken**, **Tarrasque**, **Demon Lord**, **Archmage**, **Lich King**
  - Multiple **guaranteed** trophies / collectibles per kill
  - Rare crafting materials (heartfire, ink, world-eater bile, ichor, arcane thread, royal lich dust)
  - Story artifacts (throne edicts, sunken charts, death decrees, soul contracts)
  - Rich boss currency and high-quality sheet equipment
- **Goblin** — multi-pool humanoid profile:
  - Monster parts (ear, tooth, finger bone, blood vial)
  - Pocket currency (cp / sp / rare gp; CR-scaled)
  - Equipment cloned from the NPC’s **actual inventory**, with dynamic quality (Broken → Masterwork)
  - Junk, trinkets, and readable story scraps
- **Orc** — multi-pool humanoid profile (excludes half-orc):
  - Monster parts (tusk, ear, blood vial, rare heart)
  - Pocket currency (a bit richer than goblins; CR-scaled)
  - Equipment from the NPC’s **actual inventory** (greataxe, javelins, hide armor, etc.) with quality
  - Orc-themed junk / trinkets / war-order story scraps
- **Bugbear** — multi-pool goblinoid profile:
  - Parts (ear, fang, hide scrap, rare heart), coin, sheet gear, raid orders / tally
- **Human / Elf / Dwarf / Halfling** — civilized humanoid multi-pool profiles:
  - Alchemy samples (blood vial, hair lock) plus racial trinkets / junk / story scraps
  - Pocket currency and **sheet equipment** with quality (Broken → Masterwork)
  - Elf includes drow / eladrin; half-elf and duergar excluded
- **Zombie / Skeleton / Mummy** — undead multi-pool profiles with type-specific parts, burial junk, and sheet gear when present
- **Generic Undead** — fallback for wights, specters, ghosts, vampires, and other undead without a dedicated profile (also used when type is `undead`)
- **Generic Humanoid** — type fallback for humanoids that are not a known race, goblinoid, stock NPC role, or boss
- **Unknown** — last resort when name and type cannot be identified: pocket change plus maps / notes / posters (no monster parts)
- **Lich** — high-tier undead profile:
  - Rare parts (lich dust, necrotic crystal, soul ash, phylactery shard)
  - Much richer gp/pp hoard currency
  - Better equipment odds & quality from the sheet
  - High-value foci / soul-gem chips / phylactery notes / lichdom formula
  - Demilich scales down; archlich scales up
- **Ooze** — multi-pool profile for gray ooze, gelatinous cube, black pudding, and ochre jelly:
  - Parts (ooze residue, corrosive enzyme, type samples, rare protoplasm core)
  - Undigested coin and **sheet equipment** (gullet loot) with acid-worn quality bias
  - Dissolved boots / etched metal, slime-coated gems, dungeon warnings & lair maps
  - **Name scaling:** Gray Ooze drops less; Black Pudding drops more (`lootScale`)
- **Aberration** — multi-pool profile for mind flayers, beholders, aboleths, and kin:
  - Parts (ichor, tentacles, illithid/beholder/aboleth trophies, rare central eye lens / elder brain matter)
  - Lair/colony currency and **sheet equipment** (thrall gear) when present
  - Slime/chitin junk, psionic crystals, colony orders & stolen memory fragments
  - **Name scaling:** Intellect Devourer/Mouther drop less; Beholder/Death Tyrant/Aboleth drop more (`lootScale`)
- **Elemental** — multi-pool profile for fire/water/earth/air elementals and myrmidons:
  - Parts (elemental essence, ember cores / brine pearls / living stone / wind whorls, myrmidon plate shards)
  - Sparse coin; **sheet equipment** common on myrmidons
  - Elemental residue junk, binding sigils, summoning scraps & planar rift maps
  - **Name scaling:** base elementals at 1.0; myrmidons scale up (`lootScale`)
- **Giant** — multi-pool profile for hill, stone, frost, fire, cloud, and storm giants:
  - Parts (tooth, knuckle, hair, type-specific rocks/ice/slag/silk, rare storm spark stone)
  - Rich tribute currency and **sheet equipment** (weapons/armor/bags)
  - Boot scraps / crushed spokes, thumb rings, tribute lists & raiding maps
  - **Name scaling:** Hill Giant drops less; Storm Giant drops more (`lootScale`)
  - Excludes "giant spider" and similar beast names (those stay on beast/monstrosity profiles)
- **Monstrosity** — multi-pool profile for owlbears, basilisks, chimerae, hydras, purple worms, mimics, ropers, and kin:
  - Parts (hide, fang, creature-specific trophies, rare basilisk eye / purple worm tooth)
  - Nest/gullet currency and **sheet equipment** when present (prey gear)
  - Shed scales / sticky residue, petrified chips, hunter warnings & nest maps
  - **Name scaling:** Cockatrice drops less; Purple Worm drops more (`lootScale`)
- **Fey** — multi-pool profile for pixies, dryads, satyrs, redcaps, and hags:
  - Parts (fey dust, blood, pixie wing, dryad bark, satyr horn, redcap tooth, hag hair, rare hag eye)
  - Pocket currency and **sheet equipment** when present
  - Wilted petals / ribbons / bloodstained cap scraps, fairy-ring trinkets, bargains & coven notes
  - **Name scaling:** Pixie/Satyr drop less; Night Hag drops more (`lootScale`)
- **Fiend** — multi-pool profile for imps, quasits, hell hounds, and named devil/demon forms:
  - Parts (ichor, horn, brimstone, hellhound/imp/quasit bits, barbed spines, chain links, bone spurs, rare pit-fiend scale / balor ash)
  - Infernal coin (gp/pp leaning; CR-scaled) and **sheet equipment** for armed devils
  - Scorched junk, soul-coin chips / seals / abyssal runes, contracts & Blood War orders
  - **Name scaling:** Imp/Quasit drop less; Pit Fiend & Balor drop more (`lootScale`)
- **Dragon** — multi-pool profile (excludes dragonborn / half-dragon):
  - Monster parts (scale, fang, claw, blood, hide, horn, rare heart)
  - Hoard currency (gp/pp heavy; CR-scaled)
  - Equipment from the NPC’s **actual inventory** (hoard gear on the sheet)
  - Lair junk / scale trinkets / territorial story scraps
  - **Age scaling:** wyrmlings & young dragons drop **less**; adults & ancients drop **more** (`lootScale`)
- **Chest / Container** — seeded into the Actors tab on load:
  - **Chest** — wooden chest token art
  - **Container** — blank/invisible token (place over map scenery)
  - 1 HP, sparkles always while lootable, hide when emptied
  - Investigation → **official dnd5e/PHB equipment** from system packs (`equipment24`, `items`, `tradegoods`) by rarity, plus currency / LootForge junk & story (+ any items you put in its inventory)

## Profile architecture (v0.5+)

Creature profiles live under `scripts/data/profiles/`. Register new creatures in `profiles/index.js`.

- Legacy profiles use a flat `drops[]` table (wolf / animated armor).
- Multi-pool profiles use `pools` (`monsterParts`, `currency`, `equipment`, `junk`, `trinkets`, `story`, …).
- Optional `lootScale` on a profile multiplies quantities by name tokens (e.g. wyrmling/young/adult/ancient) or size.
- **Type fallback:** if no name/subtype profile matches, loot uses the creature’s type (Fey, Humanoid, Beast, Undead, etc.) via `TYPE_FALLBACKS` — dedicated profiles (Wolf, Goblin, Archmage, …) still win first.
- **Unknown fallback:** if type is missing or unrecognized, loot defaults to pocket change plus small story scraps (maps, notes, posters) via the `unknown` profile.
- Generation code stays generic — do not hardcode creature names in the generator.

## Player access

- **Double-left-click** a dead unowned NPC to loot
- Scene control **Loot Targeted Body** (target with `T`, then click)
- Hotkey **Alt+L**

## Install

Copy or symlink this repo to:

```text
{UserData}/Data/modules/lootforge/
```

Enable the module in a dnd5e world and reload.

## Item compendium

Canonical loot items live in **LootForge Items** (`lootforge.loot-items`).

Rebuild (maintainers only):

```bash
npm install
npm run pack
npm run verify:pack
```

## Out of scope (for now)

AI generation, crafting, vendors, biomes, QuestForge hooks beyond readable story items, subscriptions.
