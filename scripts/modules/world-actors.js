import { MODULE_ID } from "./constants.js";
import { log } from "./logger.js";

export const CONTAINER_KIND_CHEST = "chest";
export const CONTAINER_KIND_BLANK = "blank";

const CHEST_IMG = `modules/${MODULE_ID}/assets/tokens/chest.svg`;
const BLANK_IMG = `modules/${MODULE_ID}/assets/tokens/blank.png`;

export function isLootContainerActor(actor) {
  if (!actor) return false;
  try {
    if (actor.getFlag?.(MODULE_ID, "isContainer")) return true;
  } catch {
    // ignore
  }
  return Boolean(actor.flags?.[MODULE_ID]?.isContainer);
}

export function getContainerKind(actor) {
  if (!isLootContainerActor(actor)) return null;
  try {
    return actor.getFlag?.(MODULE_ID, "containerKind")
      ?? actor.flags?.[MODULE_ID]?.containerKind
      ?? null;
  } catch {
    return actor.flags?.[MODULE_ID]?.containerKind ?? null;
  }
}

async function ensureLootForgeActorFolder() {
  const existing = game.folders?.find((f) => f.type === "Actor" && f.name === "LootForge");
  if (existing) return existing;
  if (!game.user?.isGM) return null;
  try {
    const created = await Folder.create({
      name: "LootForge",
      type: "Actor",
      sorting: "a",
      color: "#6a4a28"
    });
    return created ?? null;
  } catch (err) {
    log.warn("Could not create LootForge actor folder", err);
    return null;
  }
}

function findContainerActor(kind) {
  return game.actors?.find((actor) => (
    isLootContainerActor(actor) && getContainerKind(actor) === kind
  )) ?? null;
}

function buildContainerActorData({ name, kind, img, folderId }) {
  return {
    name,
    type: "npc",
    img,
    folder: folderId,
    ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS?.NONE ?? 0 },
    system: {
      details: {
        type: {
          value: "construct",
          subtype: "",
          custom: "Loot Container"
        },
        cr: 0,
        biography: {
          value: kind === CONTAINER_KIND_BLANK
            ? "<p>Invisible LootForge container. Place over map scenery. Players double-click the sparkles to loot.</p>"
            : "<p>LootForge chest. Place on the scene; sparkles mark it as lootable. Players double-click to loot.</p>"
        }
      },
      attributes: {
        hp: {
          value: 1,
          max: 1,
          temp: 0,
          formula: ""
        },
        ac: { flat: 10, calc: "flat" }
      },
      traits: {
        size: "med"
      }
    },
    prototypeToken: {
      name,
      displayName: CONST.TOKEN_DISPLAY_MODES?.OWNER_HOVER ?? 20,
      displayBars: CONST.TOKEN_DISPLAY_MODES?.NONE ?? 0,
      actorLink: false,
      disposition: CONST.TOKEN_DISPOSITIONS?.NEUTRAL ?? 0,
      width: 1,
      height: 1,
      texture: {
        src: img,
        scaleX: 1,
        scaleY: 1,
        alphaThreshold: 0
      },
      bar1: { attribute: null },
      bar2: { attribute: null },
      lockRotation: true
    },
    flags: {
      [MODULE_ID]: {
        isContainer: true,
        containerKind: kind,
        seededByLootForge: true
      }
    }
  };
}

async function ensureContainerActor({ name, kind, img, folderId }) {
  const existing = findContainerActor(kind);
  if (existing) {
    const patch = {};
    if (!existing.getFlag(MODULE_ID, "isContainer")) {
      patch[`flags.${MODULE_ID}.isContainer`] = true;
    }
    if (existing.getFlag(MODULE_ID, "containerKind") !== kind) {
      patch[`flags.${MODULE_ID}.containerKind`] = kind;
    }
    const hp = Number(existing.system?.attributes?.hp?.value);
    const hpMax = Number(existing.system?.attributes?.hp?.max);
    if (!(hpMax >= 1) || !(hp >= 1)) {
      patch["system.attributes.hp.value"] = 1;
      patch["system.attributes.hp.max"] = 1;
    }
    const tokenSrc = existing.prototypeToken?.texture?.src;
    if (tokenSrc !== img) {
      patch["prototypeToken.texture.src"] = img;
      patch.img = img;
    }
    if (Object.keys(patch).length) {
      try {
        await existing.update(patch);
      } catch (err) {
        log.warn(`Failed to refresh seeded actor ${name}`, err);
      }
    }
    return existing;
  }

  try {
    const created = await Actor.create(buildContainerActorData({
      name,
      kind,
      img,
      folderId
    }), { renderSheet: false });
    log.info(`Seeded world actor: ${name}`, created?.uuid);
    return created ?? null;
  } catch (err) {
    log.error(`Failed to create world actor ${name}`, err);
    return null;
  }
}

export async function ensureWorldLootActors() {
  if (!game.user?.isGM) return;
  if (game.system?.id !== "dnd5e") return;

  const folder = await ensureLootForgeActorFolder();
  const folderId = folder?.id ?? null;

  await ensureContainerActor({
    name: "Chest",
    kind: CONTAINER_KIND_CHEST,
    img: CHEST_IMG,
    folderId
  });

  await ensureContainerActor({
    name: "Container",
    kind: CONTAINER_KIND_BLANK,
    img: BLANK_IMG,
    folderId
  });
}

export function registerContainerTokenHooks() {
  Hooks.on("createToken", async (tokenDoc) => {
    if (!game.user?.isGM || !tokenDoc) return;
    if (!isLootContainerActor(tokenDoc.actor)) return;

    try {
      if (!tokenDoc.getFlag(MODULE_ID, "isContainer")) {
        await tokenDoc.update({
          [`flags.${MODULE_ID}.isContainer`]: true,
          [`flags.${MODULE_ID}.containerKind`]: getContainerKind(tokenDoc.actor)
            ?? CONTAINER_KIND_CHEST
        });
      }
    } catch (err) {
      log.warn("Failed to stamp container flag on token", err);
    }
  });
}
