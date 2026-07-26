# LootForge

Interactive looting and harvesting for defeated creatures in Foundry VTT. Built for **Gambits Forge**.

## Status

| Item | Value |
| --- | --- |
| Version | **0.4.8** |
| Foundry | 13–14 (verified **14**) |
| System | dnd5e 4.0+ (verified **5.3.3**) |
| Scope | Creatures: **Wolf**, **Spider** (incl. Wolf Spider), **Animated Armor** |

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

- **Wolf** — wolf parts only (whole-word match; excludes “wolf spider”).
- **Spider / Wolf Spider** — spider silk, fangs, venom gland, eyes.
- **Animated Armor** — exactly **one** salvaged armor piece; Investigation quality sets the tier (padded → chain shirt → scale mail → breastplate → plate).

## Player access

Players generally cannot open the Token HUD of an unowned enemy corpse. LootForge provides:

- **Double-left-click** a dead unowned NPC to loot — sparkles are visual only; single/right-click do nothing
- Scene control **Loot Targeted Body** (target with `T`, then click)
- Hotkey **Alt+L** (targeted corpse, else nearest lootable corpse)

### Shared looting

- After DM Review, loot is **free-for-all** — multiple players may open and take
- Open loot windows stay in sync when anyone takes an item
- Closing leaves untaken items for others

## Install

Copy or symlink this repo to:

```text
{UserData}/Data/modules/lootforge/
```

Enable the module in a dnd5e world and reload.

## Settings (world)

- Allow all players to loot  
- Prevent duplicate generation  
- Show loot indicators  
- Enable rare drops  
- Debug logging  

## Item compendium

Canonical loot items live in the module pack **LootForge Items** (`lootforge.loot-items`).

Item and UI icons ship under `modules/lootforge/assets/` so Foundry core path changes cannot 404 them.

JSON sources: `packs/src/loot-items/` (developers only). The compiled LevelDB under `packs/loot-items/` is what Foundry loads — **no Node/npm/CLI is required for end users**.

Rebuild (maintainers only):

```bash
npm install
npm run pack
npm run verify:pack
```

**Compendium is treated as read-only source data.** LootForge never writes generated loot into the pack.

## Architecture

```text
packs/
  src/loot-items/        Editable Item JSON sources
  loot-items/            Compiled LevelDB pack
assets/
  items/                 Bundled item icons
  ui/                    Loot-bag overlay icon
scripts/
  main.js
  applications/          DM review + player window
  data/                  Definition IDs ↔ UUIDs + creature profiles
  modules/               Context, storage, generator, transfer, sockets, indicators
  ui/                    HUD / context / scene controls
templates/
styles/
lang/
```

Corpse loot is stored per **token** at `flags.lootforge.corpse` so linked actors do not share loot.

## Out of scope (for now)

AI generation, crafting, vendors, biomes, broad creature coverage, subscriptions.
