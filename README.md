# LootForge

Interactive looting and harvesting for defeated creatures in Foundry VTT. Built for **Gambits Forge**.

## Status

| Item | Value |
| --- | --- |
| Version | **0.5.0** |
| Foundry | 13–14 (verified **14**) |
| System | dnd5e 4.0+ (verified **5.3.3**) |
| Scope | **Wolf**, **Spider**, **Animated Armor**, **Goblin** (first humanoid multi-pool profile) |

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

- **Wolf** — wolf parts only (whole-word match; excludes “wolf spider”). Legacy `drops[]` profile.
- **Spider / Wolf Spider** — spider silk, fangs, venom gland, eyes.
- **Animated Armor** — exactly **one** salvaged armor piece; Investigation quality sets the tier.
- **Goblin** — multi-pool humanoid profile:
  - Monster parts (ear, tooth, finger bone, blood vial)
  - Pocket currency (cp / sp / rare gp; CR-scaled)
  - Equipment cloned from the NPC’s **actual inventory**, with dynamic quality (Broken → Masterwork)
  - Junk, trinkets, and readable story scraps

## Profile architecture (v0.5+)

Creature profiles live under `scripts/data/profiles/`. Register new creatures in `profiles/index.js`.

- Legacy profiles use a flat `drops[]` table (wolf / spider / animated armor).
- Multi-pool profiles use `pools` (`monsterParts`, `currency`, `equipment`, `junk`, `trinkets`, `story`, …).
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
