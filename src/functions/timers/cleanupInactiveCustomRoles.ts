import { EmbedBuilder, GuildMember, Role, TextChannel } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import config from "../../config/config.json" with { type: "json" };

const INTERVAL_MS = 24 * 60 * 60 * 1000;

export function startInactiveCustomRoleCleanup(client: Client): void {
  const settings = (config as any).INACTIVE_CUSTOM_ROLES;

  if (!settings?.ENABLED) return;

  const run = async () => {
    try {
      await cleanup(client);
    } catch (err) {
      client.errorLogger(err, client, "error");
    }
  };

  run();
  setInterval(run, INTERVAL_MS);
}

async function cleanup(client: Client): Promise<void> {
  const settings = (config as any).INACTIVE_CUSTOM_ROLES;
  const days = settings?.DAYS || 90;
  const logChannelId = settings?.LOG_CHANNEL_ID;
  const dryRun = !!settings?.DRY_RUN;

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const customRoles = await client.db.roles.custom.getAll();
  if (!customRoles?.length) return;

  for (const entry of customRoles) {
    try {
      const guild =
        client.guilds.cache.get(entry.server_id_str) ??
        (await client.guilds.fetch(entry.server_id_str).catch(() => null));

      if (!guild) continue;

      const member = await guild.members
        .fetch(entry.user_id_str)
        .catch(() => null);

      if (!member) {
        if (!entry.left_since) {
          await client.db.roles.custom.setLeftSince(
            entry.role_id_str,
            new Date().toISOString(),
          );
          continue;
        }

        const leftAt = new Date(entry.left_since).getTime();
        if (Number.isNaN(leftAt) || leftAt >= cutoff) {
          continue;
        }

        const role =
          guild.roles.cache.get(entry.role_id_str) ??
          (await guild.roles.fetch(entry.role_id_str).catch(() => null));

        if (!role) {
          await client.db.roles.custom.deleteByRoleIdStr(entry.role_id_str);
          continue;
        }

        const me = guild.members.me;
        if (!me || me.roles.highest.comparePositionTo(role) <= 0) {
          await logGoneHierarchySkip(guild, logChannelId, entry, role);
          continue;
        }

        if (dryRun) {
          await logGoneCleanup(guild, logChannelId, entry, role, true);
          continue;
        }

        await role
          .delete("Inactividad: ausente del servidor por 3 meses")
          .catch((err) => {
            client.errorLogger(err, client, "error");
          });

        await client.db.roles.custom.deleteByRoleIdStr(entry.role_id_str);

        await logGoneCleanup(guild, logChannelId, entry, role, false);
        continue;
      }

      if (entry.left_since) {
        await client.db.roles.custom.setLeftSince(entry.role_id_str, null);
      }

      if (guild.ownerId === entry.user_id_str) continue;

      const lastMessageIso = await client.db.logs.getLastMessageDate(
        entry.user_id_str,
        entry.server_id_str,
      );

      if (!lastMessageIso) continue;

      const lastMessageAt = new Date(lastMessageIso).getTime();
      if (Number.isNaN(lastMessageAt) || lastMessageAt >= cutoff) continue;

      const role =
        guild.roles.cache.get(entry.role_id_str) ??
        (await guild.roles.fetch(entry.role_id_str).catch(() => null));

      if (!role) {
        await client.db.roles.custom.deleteByRoleIdStr(entry.role_id_str);
        continue;
      }

      const me = guild.members.me;
      if (!me || me.roles.highest.comparePositionTo(role) <= 0) {
        await logHierarchySkip(
          guild,
          logChannelId,
          member,
          role,
          lastMessageIso,
        );
        continue;
      }

      const trackerId = (config as any).CUSTOM_ROLE_TRACKER_ROLE_ID;

      if (dryRun) {
        await logCleanup(
          guild,
          logChannelId,
          member,
          role,
          lastMessageIso,
          true,
        );
        continue;
      }

      if (member.roles.cache.has(role.id)) {
        await member.roles
          .remove(role, "Inactividad: sin mensajes en 3 meses")
          .catch(() => null);
      }

      if (trackerId && member.roles.cache.has(trackerId)) {
        await member.roles
          .remove(trackerId, "Inactividad: sin mensajes en 3 meses")
          .catch(() => null);
      }

      await role.delete("Inactividad: sin mensajes en 3 meses").catch((err) => {
        client.errorLogger(err, client, "error");
      });

      await client.db.roles.custom.deleteByRoleIdStr(entry.role_id_str);

      await logCleanup(
        guild,
        logChannelId,
        member,
        role,
        lastMessageIso,
        false,
      );
    } catch (err) {
      client.errorLogger(err, client, "error");
    }
  }
}

async function logCleanup(
  guild: any,
  channelId: string,
  member: GuildMember,
  role: Role,
  lastMessageIso: string,
  dryRun: boolean,
): Promise<void> {
  if (!channelId) return;

  const channel =
    guild.channels.cache.get(channelId) ??
    (await guild.channels.fetch(channelId).catch(() => null));

  if (!(channel instanceof TextChannel)) return;

  const lastMessageTimestamp = Math.floor(
    new Date(lastMessageIso).getTime() / 1000,
  );

  const embed = new EmbedBuilder()
    .setColor((config as any).EMBED_COLOR)
    .setTitle(
      dryRun
        ? "🧪 [DRY RUN] Rol personalizado por eliminar por inactividad"
        : "🗑️ Rol personalizado eliminado por inactividad",
    )
    .addFields(
      {
        name: "Usuario",
        value: `<@${member.id}> (${member.user.tag})`,
        inline: true,
      },
      { name: "Rol", value: `${role.name} (${role.id})`, inline: true },
      {
        name: "Último mensaje",
        value: `<t:${lastMessageTimestamp}:R>`,
        inline: true,
      },
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

async function logHierarchySkip(
  guild: any,
  channelId: string,
  member: GuildMember,
  role: Role,
  lastMessageIso: string,
): Promise<void> {
  if (!channelId) return;

  const channel =
    guild.channels.cache.get(channelId) ??
    (await guild.channels.fetch(channelId).catch(() => null));

  if (!(channel instanceof TextChannel)) return;

  const lastMessageTimestamp = Math.floor(
    new Date(lastMessageIso).getTime() / 1000,
  );

  const embed = new EmbedBuilder()
    .setColor((config as any).EMBED_COLOR)
    .setTitle(
      "⚠️ Rol personalizado por eliminar por inactividad - Jerarquía insuficiente",
    )
    .addFields(
      {
        name: "Usuario",
        value: `<@${member.id}> (${member.user.tag})`,
        inline: true,
      },
      { name: "Rol", value: `${role.name} (${role.id})`, inline: true },
      {
        name: "Último mensaje",
        value: `<t:${lastMessageTimestamp}:R>`,
        inline: true,
      },
      {
        name: "Acción",
        value:
          "No se eliminó el rol ni se limpió la base de datos (revisar manualmente)",
        inline: false,
      },
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

async function logGoneCleanup(
  guild: any,
  channelId: string,
  entry: any,
  role: Role,
  dryRun: boolean,
): Promise<void> {
  if (!channelId) return;

  const channel =
    guild.channels.cache.get(channelId) ??
    (await guild.channels.fetch(channelId).catch(() => null));

  if (!(channel instanceof TextChannel)) return;

  const leftSince = entry.left_since
    ? new Date(entry.left_since).getTime()
    : Date.now();
  const leftTimestamp = Math.floor(leftSince / 1000);

  const embed = new EmbedBuilder()
    .setColor((config as any).EMBED_COLOR)
    .setTitle(
      dryRun
        ? "🧪 [DRY RUN] Rol personalizado por eliminar - Ausente del servidor"
        : "🗑️ Rol personalizado eliminado - Ausente del servidor",
    )
    .addFields(
      {
        name: "Usuario",
        value: `<@${entry.user_id_str}> (${entry.user_id_str})`,
        inline: true,
      },
      { name: "Rol", value: `${role.name} (${role.id})`, inline: true },
      {
        name: "Ausente desde",
        value: `<t:${leftTimestamp}:R>`,
        inline: true,
      },
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

async function logGoneHierarchySkip(
  guild: any,
  channelId: string,
  entry: any,
  role: Role,
): Promise<void> {
  if (!channelId) return;

  const channel =
    guild.channels.cache.get(channelId) ??
    (await guild.channels.fetch(channelId).catch(() => null));

  if (!(channel instanceof TextChannel)) return;

  const leftSince = entry.left_since
    ? new Date(entry.left_since).getTime()
    : Date.now();
  const leftTimestamp = Math.floor(leftSince / 1000);

  const embed = new EmbedBuilder()
    .setColor((config as any).EMBED_COLOR)
    .setTitle(
      "⚠️ Rol personalizado por eliminar - Ausente del servidor - Jerarquía insuficiente",
    )
    .addFields(
      {
        name: "Usuario",
        value: `<@${entry.user_id_str}> (${entry.user_id_str})`,
        inline: true,
      },
      { name: "Rol", value: `${role.name} (${role.id})`, inline: true },
      {
        name: "Ausente desde",
        value: `<t:${leftTimestamp}:R>`,
        inline: true,
      },
      {
        name: "Acción",
        value:
          "No se eliminó el rol ni se limpió la base de datos (revisar manualmente)",
        inline: false,
      },
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}
