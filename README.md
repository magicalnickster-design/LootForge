# LootForge

Interactive looting and harvesting for defeated creatures in Foundry VTT.
Built for **Gambits Forge**.

## Compatibility

| | |
| --- | --- |
| Version | 0.6.0 |
| Foundry | 13–14 (verified 14) |
| System | dnd5e 4.0+ (verified 5.3.3) |

## Features

- Survival / Investigation rolls when looting dead NPCs
- DM review before players take loot
- Shared free-for-all Items window after approval
- Harvest tables for common MM creatures, humanoids, dragons, undead, and more
- Type-based fallbacks when a creature has no dedicated table
- Generic scrap loot (coin + notes/maps) when nothing matches
- Placeable Chest / Container actors for map loot
- Gambits Forge account login with Tier 1+ entitlement checks

## Licensing

LootForge requires an active **Gambits Forge Tier 1 or higher** subscription.

- The **GM** must be signed in with an entitled Gambits Forge account.
- **Players do not need** their own LootForge subscription to loot in that GM’s world.
- Loot generation stays local inside Foundry. LootForge does not use AI and does not consume generation credits.
- Entitlements refresh on startup (when online), after login, when fewer than 7 days remain, or via **Check Subscription**.
- A cached entitlement remains usable offline until the **server-issued** expiration (maximum 30 days from cache fetch). Expiration is never extended locally.

Configure the account from **Module Settings → Gambits Forge Account**.

## How it works

1. A creature dies — sparkles mark it as lootable.
2. A player double-clicks an unowned dead NPC. The module rolls Survival (beasts) or Investigation (everything else).
3. The GM gets a review window to edit, reroll, add, or remove items.
4. Save & Close (or Close) releases the loot. Players get the shared Items window.
5. When emptied, sparkles clear and the corpse hides.
6. GM **Reset Loot** puts the corpse back into play.

GMs who double-click a dead creature still open the character sheet. Use the HUD, **Alt+L**, or the scene control to loot as GM. Players who own an actor (including a dead PC) keep normal sheet access.

## Player controls

- Double-left-click an unowned dead NPC
- Scene control **Loot Targeted Body** (target with `T`)
- Hotkey **Alt+L**

## Install

Copy or symlink this folder to:

```text
{UserData}/Data/modules/lootforge/
```

Enable **LootForge** in a dnd5e world and reload.

## Compendium

Loot items ship in **LootForge Items** (`lootforge.loot-items`).

Maintainers rebuilding the pack:

```bash
npm install
npm run pack
npm run verify:pack
```

## Creature tables

Profiles live in `scripts/data/profiles/`. Matching order:

1. Specific name / subtype (Wolf, Goblin, Archmage, …)
2. Creature type family (fey, beast, undead, …)
3. Unknown scrap table (coin + maps/notes)

## Not included

Crafting, vendors, biomes, and QuestForge hooks beyond readable story items.
