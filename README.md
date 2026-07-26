# LootForge

Interactive looting and harvesting for defeated creatures in Foundry VTT. Built for **Gambits Forge**.

## Status

| Item | Value |
| --- | --- |
| Version | **0.2.0** (Wolf MVP) |
| Foundry | 13–14 (verified **14**) |
| System | dnd5e 4.0+ (verified **5.3.3**) |
| Scope | Fully supported creature: **Wolf** |

## Wolf MVP flow

1. Wolf reaches 0 HP / dead status.
2. GM right-clicks the wolf → **Generate Loot**.
3. LootForge detects beast/wolf context and prompts a **Survival** roll (unless disabled in settings).
4. **DM Loot Review** opens with LootForge-owned items (pelt, fang, meat, claw, rare alpha fang).
5. GM can edit quantities, reroll, remove/add items, choose a character.
6. **Confirm and Assign** opens the player loot window for the assignee (or locally if solo GM).
7. Player **Take** / **Take All** creates stacked `loot` items on the character.
8. Corpse flag updates; when empty the body is marked **Looted**.
9. GM can **Reset Loot** to regenerate.

## Player / GM controls

- Right-click corpse → Generate Loot / View Loot / Looted  
- Token toolbar sack button  
- Token HUD sack icon  
- **Alt+L**

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

## Architecture

```text
scripts/
  main.js
  applications/          DM review + player window
  data/                  Loot definitions + creature profiles
  modules/               Context, storage, generator, transfer, sockets
  ui/                    HUD / context / scene controls
templates/
styles/
lang/
```

Corpse loot is stored per **token** at `flags.lootforge.corpse` so linked actors do not share loot.

## Out of scope (for now)

AI generation, crafting, vendors, biomes, other creatures, subscriptions.
