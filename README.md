# LootForge

Interactive looting and harvesting for defeated creatures in Foundry VTT. Built for **Gambits Forge**.

This repository currently ships a **D&D 5e wolf harvesting prototype**.

## Current project status

| Item | Status |
| --- | --- |
| Repository | Greenfield module (prototype) |
| Game system | D&D 5e only |
| Foundry target | Core **v13** (`compatibility.minimum/verified: 13`) |
| dnd5e target | **4.0+**, verified against **5.3.3** APIs |
| Creature coverage | Wolf prototype loot table |
| AI / external APIs | None |

## Prototype gameplay loop

1. Place a **Wolf** actor token on a scene.
2. Mark the wolf defeated (Token HUD **dead** status, or reduce HP to 0).
3. As a **player**, target the wolf (hotkey **T**), or as GM open its Token HUD.
4. Use one of these **Loot Body** actions (left-click alone does nothing):
   - Token toolbar **sack** button (left scene controls)
   - Right-click the corpse → **Loot Body**
   - **Alt+L** (default keybind) while the corpse is targeted/selected
   - Token HUD sack icon (usually GM / owned tokens only)
5. LootForge classifies the wolf as **Harvest** and requests a **Survival** roll from your assigned character.
6. Roll totals map to loot tiers (Poor → Best). Natural 20 adds a bonus item.
7. A loot dialog shows creature, skill, roll, tier, items, and quantities.
8. **Claim Loot** creates `loot` items on your assigned character (and posts chat links). Closing posts loot to chat instead.
9. The token is flagged `flags.lootforge.looted = true` and cannot be looted again.
10. GMs can click **Loot Body** again on a looted corpse to reset the flag.

**Player tip:** Keep a GM client connected. Players cannot write flags on enemy tokens, so LootForge relays that write to the active GM.

**GM tip:** GMs usually have no assigned character. If more than one PC exists, LootForge asks who is looting. Put at least one character token on the scene for easy testing.

## Install in a Foundry development world

1. Copy or symlink this repository into your Foundry user data modules folder as **`lootforge`** (folder name must match `module.json` `id`):

   ```text
   {UserData}/Data/modules/lootforge/
   ```

   Example symlink:

   ```bash
   ln -s /path/to/LootForge /path/to/FoundryUserData/Data/modules/lootforge
   ```

2. Launch Foundry VTT **v13** with the **dnd5e** system.
3. Open your world → **Settings → Manage Modules** → enable **LootForge**.
4. Reload the world.

## Test checklist (Wolf)

1. Import or create an NPC named **Wolf** (beast, CR ¼ is ideal).
2. Place a token on a scene.
3. Assign yourself a player character (or select an owned character token) so Survival can be rolled.
4. Apply the **dead** status to the wolf (or drop HP to 0).
5. Open the wolf Token HUD and click the **sack** icon, **or** target the wolf and use the Token toolbar **Loot Body** tool.
6. Complete the Survival roll.
7. Confirm the dialog shows items such as Wolf Pelt / Wolf Fang / Raw Meat.
8. Claim loot and verify items appear on the character sheet.
9. Try looting again — it should be blocked.
10. As GM, click Loot Body again and accept the reset prompt, then retest.

## Module layout

```text
lootforge/
├── module.json
├── README.md
├── lang/en.json
├── styles/lootforge.css
├── templates/loot-dialog.hbs
└── scripts/
    ├── main.js
    ├── data/prototype-loot-tables.js
    ├── services/
    │   ├── creature-classifier.js
    │   ├── loot-flags.js
    │   ├── roll-service.js
    │   ├── loot-generator.js
    │   ├── loot-claimer.js
    │   └── loot-workflow.js
    └── ui/
        ├── token-hud.js
        ├── scene-controls.js
        └── loot-dialog.js
```

## Assumptions / APIs to verify in your install

These were written against current Foundry v13 + dnd5e 5.x documentation and source, but should be confirmed in your running world:

| Assumption | API / behavior |
| --- | --- |
| Skill rolls | `Actor#rollSkill({ skill: "sur" }, { configure: false }, { create: true })` returns `D20Roll[] \| null` |
| Natural die | `roll.d20.total` and/or `roll.isCritical` for natural 20 |
| Creature type | `actor.system.details.type.value` (`"beast"` for wolves) |
| Challenge rating | `actor.system.details.cr` |
| Defeated check | `TokenDocument#hasStatusEffect("dead")`, with HP ≤ 0 fallback |
| Loot flag | `TokenDocument#setFlag("lootforge", "looted", true)` |
| Token HUD hook | `renderTokenHUD` with native `HTMLElement` (`html.querySelector`) |
| Scene controls | `getSceneControlButtons` object map (`controls.tokens.tools...`) |
| Dialogs | `foundry.applications.api.DialogV2.wait` / `.confirm` |
| Templates | `foundry.applications.handlebars.loadTemplates` / `renderTemplate` |
| Claim path | `Actor#createEmbeddedDocuments("Item", [{ type: "loot", ... }])` |
| Assigned character | `game.user.character` |

If `rollSkill` still uses the older string signature in an older dnd5e build (`actor.rollSkill("sur")`), adjust `scripts/services/roll-service.js` accordingly.

## Out of scope (intentionally)

- AI / external APIs
- Authentication, subscriptions, crafting, biomes
- Full item compendium
- Non-dnd5e systems
- Nature / Medicine harvest variants
- Broad creature loot libraries beyond the wolf prototype
