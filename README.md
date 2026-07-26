# LootForge

Interactive looting and harvesting for defeated creatures in Foundry VTT. Built for **Gambits Forge**.

## Status

| Item | Value |
| --- | --- |
| Version | **0.2.3** (WoW-style player loot sessions) |
| Foundry | 13–14 (verified **14**) |
| System | dnd5e 4.0+ (verified **5.3.3**) |
| Scope | Fully supported creature: **Wolf** |

## Wolf MVP flow

1. Wolf reaches 0 HP / dead status.
2. GM right-clicks the wolf → **Generate Loot**.
3. LootForge detects beast/wolf context and prompts a **Survival** roll (unless disabled in settings).
4. **DM Loot Review** opens with LootForge-owned items (pelt, fang, meat, claw, rare alpha fang).
5. GM can edit quantities, reroll, remove/add items, choose a character.
6. **Confirm and Assign** sockets the assigned player clients, auto-opens their loot window, and shows a loot-bag above the corpse.
7. Player **double-clicks** items, uses **Loot All**, or **Done** (leftovers go to the corpse actor inventory).
8. Corpse flag updates; when empty the bag indicator disappears.
9. GM can **Reset Loot** to regenerate.

## Player access (no enemy-token ownership required)

Players generally cannot open the Token HUD of an unowned enemy corpse. LootForge provides:

- **Double-click** a dead creature to loot
- **Auto-open** player loot window on assignment (socket)
- **Loot-bag PIXI overlay** above the corpse (click to reopen)
- Scene control **Loot Targeted Body** (target with `T`, then click)
- Context menu **Loot Body** where Foundry exposes it
- Hotkey **Alt+L** (targeted corpse, else nearest assigned corpse)

### WoW-style looting

- Only **one player** can loot a corpse at a time
- Closing the loot window (or **Done**) leaves untaken items on the **corpse actor inventory** for the next player
- Setting **Allow all players to loot**: any player may start looting; loot auto-generates
- When that setting is off: early player loot attempts show **Waiting for the DM**, and the DM gets a **Start Roll** popup

## Install

Copy or symlink this repo to:

```text
{UserData}/Data/modules/lootforge/
```

Enable the module in a dnd5e world and reload.

## Settings (world)

- Manual generation only  
- Require Survival roll  
- Default Survival total  
- Allow players to request loot  
- Prevent duplicate generation  
- Show loot indicators  
- Enable rare drops  
- Debug logging  

## Item compendium

Canonical wolf items live in the module pack **LootForge Items** (`lootforge.loot-items`).

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

AI generation, crafting, vendors, biomes, other creatures, subscriptions.
