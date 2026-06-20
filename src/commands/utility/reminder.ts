import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  ColorResolvable,
} from "discord.js";
import { DateTime } from "luxon";
import Client from "../../interfaces/ICustomClient.js";
import ICommand from "../../interfaces/command.js";
import config from "../../config/config.json" with { type: "json" };
import { rescheduleReminder, cancelReminder } from "../../functions/timers/reminderScheduler.js";

const module: ICommand = {
  name: "reminder",
  description: "Gestiona recordatorios programados",
  slashCommand: true,
  cooldown: 3,
  allowEdited: false,
  messageCommand: false,
  data: new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Gestiona recordatorios programados")
    .addSubcommand(sub => sub
      .setName("create")
      .setDescription("Crear un recordatorio")
      .addChannelOption(opt => opt
        .setName("channel")
        .setDescription("Canal donde enviar el mensaje")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
      .addStringOption(opt => opt
        .setName("time")
        .setDescription("Hora en formato HH:MM (24h, ej: 18:30)")
        .setRequired(true))
      .addStringOption(opt => opt
        .setName("message")
        .setDescription("Mensaje del recordatorio")
        .setRequired(true)
        .setMaxLength(1000))
      .addBooleanOption(opt => opt
        .setName("recurring")
        .setDescription("Repetir diariamente a la misma hora")))
    .addSubcommand(sub => sub
      .setName("edit")
      .setDescription("Editar un recordatorio")
      .addNumberOption(opt => opt
        .setName("id")
        .setDescription("ID del recordatorio")
        .setRequired(true))
      .addChannelOption(opt => opt
        .setName("channel")
        .setDescription("Nuevo canal")
        .addChannelTypes(ChannelType.GuildText))
      .addStringOption(opt => opt
        .setName("time")
        .setDescription("Nueva hora (HH:MM)"))
      .addStringOption(opt => opt
        .setName("message")
        .setDescription("Nuevo mensaje")
        .setMaxLength(1000))
      .addBooleanOption(opt => opt
        .setName("recurring")
        .setDescription("Repetir diariamente")))
    .addSubcommand(sub => sub
      .setName("remove")
      .setDescription("Eliminar un recordatorio")
      .addNumberOption(opt => opt
        .setName("id")
        .setDescription("ID del recordatorio")
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName("list")
      .setDescription("Listar recordatorios pendientes")),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guild = interaction.guild;
      if (!guild) {
        await interaction.reply({ content: "Este comando solo funciona en un servidor.", ephemeral: true });
        return;
      }

      switch (subcommand) {
        case "create": await handleCreate(interaction, client); break;
        case "edit": await handleEdit(interaction, client); break;
        case "remove": await handleRemove(interaction, client); break;
        case "list": await handleList(interaction, client); break;
      }
    } catch (err) {
      console.error("[reminder] execute error:", err);
      client.errorLogger(err, client, "error", `${process.cwd()} commands/utility/reminder`);
      try {
        if (!interaction.replied) await interaction.reply({ content: "Ocurrió un error al ejecutar el comando.", ephemeral: true });
        else await interaction.editReply({ content: "Ocurrió un error al ejecutar el comando." }).catch(() => {});
      } catch { }
    }
  },
};

function parseTime(timeStr: string): DateTime | null {
  const parts = timeStr.split(":");
  if (parts.length !== 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const now = DateTime.now();
  let target = now.set({ hour, minute, second: 0, millisecond: 0 });
  if (target <= now) {
    target = target.plus({ days: 1 });
  }
  return target;
}

async function handleCreate(interaction: ChatInputCommandInteraction, client: Client) {
  const channel = interaction.options.getChannel("channel", true);
  const timeStr = interaction.options.getString("time", true);
  const message = interaction.options.getString("message", true);
  const recurring = interaction.options.getBoolean("recurring") || false;

  const targetTime = parseTime(timeStr);
  if (!targetTime) {
    await interaction.reply({ content: `Hora inválida: "${timeStr}". Usa el formato HH:MM (ej: 18:30).`, ephemeral: true });
    return;
  }

  const reminder = await client.db.reminders.create({
    server_id: interaction.guildId!,
    channel_id: channel.id,
    message,
    remind_at: targetTime.toISO()!,
    created_by: interaction.user.id,
    status: 'pending',
    recurring: recurring ? 1 : 0,
  });

  await rescheduleReminder(client, reminder.id!);

  const embed = new EmbedBuilder()
    .setTitle("✅ Recordatorio creado")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "ID", value: `#${reminder.id}`, inline: true },
      { name: "Canal", value: `<#${channel.id}>`, inline: true },
      { name: "Hora", value: targetTime.toFormat("HH:mm"), inline: true },
      { name: "Recurrente", value: recurring ? "Sí ✅" : "No", inline: true },
      { name: "Mensaje", value: message.length > 100 ? message.slice(0, 100) + "..." : message },
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleEdit(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const reminder = await client.db.reminders.get(id);

  if (!reminder || reminder.server_id !== interaction.guildId) {
    await interaction.reply({ content: `Recordatorio #${id} no encontrado.`, ephemeral: true });
    return;
  }

  if (reminder.status !== 'pending') {
    await interaction.reply({ content: `El recordatorio #${id} ya fue enviado o cancelado.`, ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel("channel");
  const timeStr = interaction.options.getString("time");
  const message = interaction.options.getString("message");
  const recurring = interaction.options.getBoolean("recurring");

  const updates: Record<string, any> = {};

  if (channel) updates.channel_id = channel.id;
  if (message) updates.message = message;
  if (recurring !== null) updates.recurring = recurring ? 1 : 0;

  if (timeStr) {
    const targetTime = parseTime(timeStr);
    if (!targetTime) {
      await interaction.reply({ content: `Hora inválida: "${timeStr}". Usa el formato HH:MM (ej: 18:30).`, ephemeral: true });
      return;
    }
    updates.remind_at = targetTime.toISO()!;
  }

  if (Object.keys(updates).length === 0) {
    await interaction.reply({ content: "No se especificaron cambios.", ephemeral: true });
    return;
  }

  await client.db.reminders.update(id, updates);
  await rescheduleReminder(client, id);

  const changed = Object.entries(updates).map(([k, v]) => {
    if (k === 'channel_id') return `canal: <#${v}>`;
    if (k === 'remind_at') return `hora: ${DateTime.fromISO(v).toFormat("HH:mm dd/MM/yyyy")}`;
    if (k === 'message') return `mensaje: ${(v as string).length > 80 ? (v as string).slice(0, 80) + "..." : v}`;
    if (k === 'recurring') return `recurrente: ${v ? 'Sí' : 'No'}`;
    return `${k}: ${v}`;
  }).join('\n');

  await interaction.reply({ content: `✅ Recordatorio #${id} actualizado:\n${changed}`, ephemeral: true });
}

async function handleRemove(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const reminder = await client.db.reminders.get(id);

  if (!reminder || reminder.server_id !== interaction.guildId) {
    await interaction.reply({ content: `Recordatorio #${id} no encontrado.`, ephemeral: true });
    return;
  }

  await cancelReminder(id);
  await client.db.reminders.cancel(id);

  await interaction.reply({ content: `❌ Recordatorio #${id} cancelado.`, ephemeral: true });
}

async function handleList(interaction: ChatInputCommandInteraction, client: Client) {
  const reminders = await client.db.reminders.getByGuild(interaction.guildId!);
  const pending = reminders.filter(r => r.status === 'pending');

  if (pending.length === 0) {
    await interaction.reply({ content: "No hay recordatorios pendientes.", ephemeral: true });
    return;
  }

  const lines = pending.map(r => {
    const time = DateTime.fromISO(r.remind_at);
    const recurring = r.recurring ? " 🔁" : "";
    return `#${r.id}${recurring} — <#${r.channel_id}> — ${time.toFormat("HH:mm dd/MM/yyyy")} — "${r.message.length > 50 ? r.message.slice(0, 50) + "..." : r.message}"`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`Recordatorios pendientes (${pending.length})`)
    .setDescription(lines.join('\n'))
    .setColor(config.EMBED_COLOR as ColorResolvable);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

export default module;
