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

export const ROLE_ICONS_UNAVAILABLE_MESSAGE =
  "El servidor necesita Nivel 2 de boosts para usar iconos de rol.";
export const BOOSTER_REQUIRED_MESSAGE =
  "Necesitás ser booster para crearte un rol personalizado.";

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

  const existingRole = await (member.client as Client).db.roles.custom.get(
    member.id,
    member.guild.id,
  );

  if (existingRole) {
    throw new Error("Ya tenés un rol personalizado.");
  }

  const roleName = normalizeRoleName(name);
  const iconPath = await saveRoleIcon(icon, storageId);
  const role = await member.guild.roles.create({
    name: roleName,
    icon: iconPath,
    position: 10,
    reason: "Custom role created from panel",
  });

  try {
    await member.roles.add(role, "Custom role assignment");
    await (member.client as Client).db.roles.custom.create(
      role,
      member.user,
      member.guild,
    );
  } catch (error) {
    await role.delete("Error creating custom role").catch(() => null);
    throw error;
  }

  return role;
}
