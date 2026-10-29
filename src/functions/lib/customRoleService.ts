import {
  Attachment,
  DiscordAPIError,
  Guild,
  GuildFeature,
  GuildMember,
  Role,
} from "discord.js";
import { Jimp } from "jimp";
import fs from "node:fs/promises";
import path from "node:path";
import Client from "../../interfaces/ICustomClient.js";
import config from "../../config/config.json" with { type: "json" };

export const ROLE_ICONS_UNAVAILABLE_MESSAGE =
  "El servidor necesita Nivel 2 de boosts para usar iconos de rol.";
export const BOOSTER_REQUIRED_MESSAGE =
  "Necesitás ser booster para crearte un rol personalizado.";
export const CUSTOM_ROLES_NO_SLOTS_MESSAGE =
  "No hay slots disponibles para crear un rol personalizado en este servidor.";

const ICON_FORMATS = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_ICON_SIZE = 8 * 1024 * 1024;
const ICON_SIZE = 150;

function getIconDirectory(): string {
  return process.env.CUSTOM_ICONS_DIR || "/var/vscbot/custom_roles/";
}

function normalizeRoleName(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error("El nombre del rol no puede estar vacío.");
  }

  if (trimmed.length > 100) {
    throw new Error("El nombre del rol no puede superar los 100 caracteres.");
  }

  return trimmed;
}

export function canUseRoleIcons(guild: Guild): boolean {
  return guild.features.includes(GuildFeature.RoleIcons);
}

export function isBooster(member: GuildMember): boolean {
  const boosterRole = member.guild.roles.premiumSubscriberRole;

  return Boolean(
    member.premiumSince ||
    (boosterRole && member.roles.cache.has(boosterRole.id)),
  );
}

export async function getCustomRoleSlotState(guild: Guild): Promise<{
  available: boolean;
  used: number;
  limit: number;
  reserved: number;
}> {
  const rawLimit = Number(
    (config as any).CUSTOM_ROLES_SERVER_ROLE_LIMIT ?? 250,
  );
  const rawReserved = Number((config as any).CUSTOM_ROLES_RESERVED_SLOTS ?? 2);
  const limit = Number.isFinite(rawLimit) ? rawLimit : 250;
  const reserved = Number.isFinite(rawReserved) ? Math.max(0, rawReserved) : 2;

  let used = guild.roles.cache.size;

  try {
    const roles = await guild.roles.fetch();
    used = roles.size;
  } catch {
    /* use cache if fetch fails */
  }

  if (limit <= 0) {
    return { available: true, used, limit, reserved };
  }

  const maxAllowed = Math.max(0, limit - reserved);

  return {
    available: maxAllowed > 0 && used < maxAllowed,
    used,
    limit,
    reserved,
  };
}

export async function saveRoleIcon(
  icon: Attachment,
  storageId: string,
): Promise<string> {
  if (!icon.contentType || !ICON_FORMATS.includes(icon.contentType)) {
    throw new Error("El archivo debe ser PNG, JPG, GIF o WEBP.");
  }

  if (icon.size > MAX_ICON_SIZE) {
    throw new Error("El archivo supera el límite de 8 MB.");
  }

  const image = await Jimp.read(icon.url).catch(() => null);

  if (!image) {
    throw new Error("No se pudo procesar la imagen.");
  }

  image.resize({ w: ICON_SIZE, h: ICON_SIZE });

  const iconDirectory = getIconDirectory();
  await fs.mkdir(iconDirectory, { recursive: true });

  const iconPath = path.join(
    iconDirectory,
    `${storageId}.png`,
  ) as `${string}.${string}`;
  await image.write(iconPath);

  return iconPath;
}

export async function getCustomRoleForMember(
  member: GuildMember,
): Promise<Role | undefined> {
  const database = (member.client as Client).db;
  const customRole = await database.roles.custom.get(
    member.id,
    member.guild.id,
  );

  if (!customRole?.role_id) return undefined;

  let role: Role | null =
    member.guild.roles.cache.get(customRole.role_id) ?? null;

  if (!role) {
    try {
      role = await member.guild.roles.fetch(customRole.role_id);
    } catch (error) {
      if (!(error instanceof DiscordAPIError) || error.code !== 10011) {
        throw error;
      }
    }
  }

  if (!role) {
    if (customRole.id) {
      await database.roles.delete(customRole.id);
    }

    return undefined;
  }

  return role;
}

export async function updateCustomRoleForMember(
  member: GuildMember,
  name: string | undefined,
  icon: Attachment | undefined,
  storageId: string,
): Promise<Role> {
  if (!canUseRoleIcons(member.guild)) {
    throw new Error(ROLE_ICONS_UNAVAILABLE_MESSAGE);
  }

  if (name === undefined && icon === undefined) {
    throw new Error("Ingresá un nombre o un icono.");
  }

  const role = await getCustomRoleForMember(member);

  if (!role) {
    throw new Error("No tenés un rol personalizado.");
  }

  const roleName = name === undefined ? undefined : normalizeRoleName(name);
  const iconPath = icon ? await saveRoleIcon(icon, storageId) : undefined;

  if (roleName && role.name !== roleName) {
    await role.setName(roleName, "Update custom role name");
  }

  if (iconPath) {
    await role.setIcon(iconPath, "Update custom role icon");
  }

  return role;
}

const guildCreationLocks = new Map<string, Promise<void>>();

async function withGuildCreationLock<T>(
  guildId: string,
  task: () => Promise<T>,
): Promise<T> {
  const previous = guildCreationLocks.get(guildId) ?? Promise.resolve();
  const run = previous.catch(() => undefined).then(task);

  guildCreationLocks.set(
    guildId,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );

  return await run;
}

export async function createCustomRoleForMember(
  member: GuildMember,
  name: string,
  icon: Attachment,
  storageId: string,
): Promise<Role> {
  if (!canUseRoleIcons(member.guild)) {
    throw new Error(ROLE_ICONS_UNAVAILABLE_MESSAGE);
  }

  if (!isBooster(member)) {
    throw new Error(BOOSTER_REQUIRED_MESSAGE);
  }

  const database = (member.client as Client).db;
  const existingRole = await database.roles.custom.get(
    member.id,
    member.guild.id,
  );

  if (existingRole) {
    throw new Error("Ya tenés un rol personalizado.");
  }

  const roleName = normalizeRoleName(name);
  const iconPath = await saveRoleIcon(icon, storageId);

  try {
    return await withGuildCreationLock(member.guild.id, async () => {
      const currentRole = await database.roles.custom.get(
        member.id,
        member.guild.id,
      );

      if (currentRole) {
        throw new Error("Ya tenés un rol personalizado.");
      }

      const slotState = await getCustomRoleSlotState(member.guild);

      if (!slotState.available) {
        throw new Error(CUSTOM_ROLES_NO_SLOTS_MESSAGE);
      }

      const role = await member.guild.roles.create({
        name: roleName,
        icon: iconPath,
        position: 10,
        reason: "Custom role created from panel",
      });

      const trackerId = (config as any).CUSTOM_ROLE_TRACKER_ROLE_ID as
        string | undefined;
      let trackerAdded = false;

      try {
        await member.roles.add(role, "Custom role assignment");

        if (trackerId) {
          trackerAdded = await member.roles
            .add(trackerId, "custom role tracker assignment")
            .then(() => true)
            .catch(() => false);
        }

        await database.roles.custom.create(role, member.user, member.guild);
      } catch (error) {
        await role.delete("Error creating custom role").catch(() => null);

        if (trackerAdded && trackerId) {
          await member.roles
            .remove(trackerId, "Error creating custom role")
            .catch(() => null);
        }

        throw error;
      }

      return role;
    });
  } catch (error) {
    await fs.unlink(iconPath).catch(() => null);
    throw error;
  }
}

interface CustomRoleEntry {
  user_id_str: string;
  server_id_str: string;
  role_id_str: string;
  left_since?: string | null;
}

export async function syncCustomRoleTrackers(client: Client): Promise<void> {
  const trackerId = (config as any).CUSTOM_ROLE_TRACKER_ROLE_ID as
    string | undefined;
  if (!trackerId) return;

  const entries = await client.db.roles.custom.getAll();
  if (!entries?.length) return;

  const entriesByGuild = new Map<string, CustomRoleEntry[]>();

  for (const entry of entries) {
    const guildEntries = entriesByGuild.get(entry.server_id_str);

    if (guildEntries) {
      guildEntries.push(entry);
    } else {
      entriesByGuild.set(entry.server_id_str, [entry]);
    }
  }

  for (const [guildId, guildEntries] of entriesByGuild) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;

    await syncGuildCustomRoleTracker(guild, trackerId, guildEntries);
  }
}

async function syncGuildCustomRoleTracker(
  guild: Guild,
  trackerId: string,
  entries: CustomRoleEntry[],
): Promise<void> {
  const trackerRole = guild.roles.cache.get(trackerId);

  if (!trackerRole) {
    console.warn(
      `[custom-roles] El rol tracker ${trackerId} no existe en ${guild.name} (${guild.id}).`,
    );
    return;
  }

  const members = await guild.members.fetch().catch(() => guild.members.cache);
  const validUsers = new Set<string>();

  for (const entry of entries) {
    if (!guild.roles.cache.has(entry.role_id_str)) continue;

    const member = members.get(entry.user_id_str);
    if (!member) continue;
    if (!member.roles.cache.has(entry.role_id_str)) continue;

    validUsers.add(member.id);

    if (member.roles.cache.has(trackerId)) continue;

    await member.roles
      .add(trackerRole, "custom role tracker sync")
      .catch((error) => {
        console.warn(
          `[custom-roles] No se pudo asignar el rol tracker a ${member.id} en ${guild.id}:`,
          error,
        );
      });
  }

  for (const member of trackerRole.members.values()) {
    if (member.user.bot) continue;
    if (validUsers.has(member.id)) continue;

    await member.roles
      .remove(trackerId, "custom role tracker cleanup")
      .catch(() => null);
  }
}
