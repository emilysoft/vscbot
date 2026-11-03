import {
  AutocompleteInteraction,
  ChannelType,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import ICommand from "../../interfaces/command.js";
import config from "../../config/config.json" with { type: "json" };
import { isOwner } from "../../config/index.js";
import type { AutomodOverrideScope } from "../../db/automodManager.js";

/** Valor de módulo que representa "todos los automods". */
const ALL_MODULES = "*";
const ALL_MODULES_LABEL = "todos";

const module: ICommand = {
  name: "automod",
  description: "Gestiona los automods del servidor",
  slashCommand: true,
  cooldown: 5,
  allowEdited: false,
  messageCommand: false,
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Gestiona los automods del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub.setName("estado").setDescription("Ver el estado de los automods"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("activar")
        .setDescription("Enciende un automod en todo el servidor")
        .addStringOption((opt) =>
          opt
            .setName("modulo")
            .setDescription("Automod a encender")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("desactivar")
        .setDescription("Apaga un automod en todo el servidor")
        .addStringOption((opt) =>
          opt
            .setName("modulo")
            .setDescription("Automod a apagar")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("global")
        .setDescription("Enciende o apaga todos los automods de una vez")
        .addBooleanOption((opt) =>
          opt
            .setName("activado")
            .setDescription("true = todos encendidos, false = todos apagados")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("canal")
        .setDescription("Excepción por canal o categoría")
        .addChannelOption((opt) =>
          opt
            .setName("canal")
            .setDescription("Canal o categoría donde aplicar la excepción")
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildForum,
              ChannelType.GuildMedia,
              ChannelType.GuildCategory,
            )
            .setRequired(true),
        )
        .addBooleanOption((opt) =>
          opt
            .setName("activado")
            .setDescription("true = automod activo ahí, false = no se aplica")
            .setRequired(true),
        )
        .addStringOption((opt) =>
          opt
            .setName("modulo")
            .setDescription("Automod afectado (default: todos)")
            .setAutocomplete(true),
        ),
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const client = interaction.client as Client;
    const focused = String(interaction.options.getFocused()).toLowerCase();
    const subcommand = interaction.options.getSubcommand(false);

    const names = [...client.automod.keys()].sort();
    const choices =
      subcommand === "canal"
        ? [{ name: ALL_MODULES_LABEL, value: ALL_MODULES }, ...names.map((name) => ({ name, value: name }))]
        : names.map((name) => ({ name, value: name }));

    await interaction.respond(
      choices
        .filter((choice) => choice.name.toLowerCase().includes(focused))
        .slice(0, 25),
    );
  },

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        content: "No estás autorizado a usar este comando.",
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const manager = client.db.automod;

    if (subcommand === "estado") {
      await interaction.reply({
        embeds: [buildStatusEmbed(client)],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "global") {
      const enabled = interaction.options.getBoolean("activado", true);
      manager.setGlobal(enabled);
      await interaction.reply({
        content: enabled
          ? "Automod **encendido** en todo el servidor."
          : "Automod **apagado** en todo el servidor. Los toggles individuales se conservan.",
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "activar" || subcommand === "desactivar") {
      const name = interaction.options.getString("modulo", true);
      if (!client.automod.has(name)) {
        await interaction.reply({
          content: `No existe el automod \`${name}\`.`,
          ephemeral: true,
        });
        return;
      }

      const enabled = subcommand === "activar";
      manager.setAutomod(name, enabled);
      await interaction.reply({
        content: `Automod \`${name}\` ${enabled ? "**encendido**" : "**apagado**"}.`,
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "canal") {
      const channel = interaction.options.getChannel("canal", true);
      const enabled = interaction.options.getBoolean("activado", true);
      const target = interaction.options.getString("modulo") ?? ALL_MODULES;

      if (target !== ALL_MODULES && !client.automod.has(target)) {
        await interaction.reply({
          content: `No existe el automod \`${target}\`.`,
          ephemeral: true,
        });
        return;
      }

      const scope = resolveScope(channel);
      const current = manager.getOverride(scope, channel.id)?.off ?? [];
      const next = new Set(current);

      if (enabled) {
        next.delete(target);
      } else {
        next.add(target);
      }

      manager.setOverride(scope, channel.id, [...next]);

      const label = target === ALL_MODULES ? "todos los automods" : `\`${target}\``;
      await interaction.reply({
        content: enabled
          ? `${label} vuelve a aplicarse en <#${channel.id}>.`
          : `${label} ya no se aplica en <#${channel.id}>.`,
        ephemeral: true,
      });
      return;
    }
  },
};

function resolveScope(channel: { type: ChannelType }): AutomodOverrideScope {
  return channel.type === ChannelType.GuildCategory ? "categories" : "channels";
}

function buildStatusEmbed(client: Client): EmbedBuilder {
  const snapshot = client.db.automod.snapshot();
  const names = [...client.automod.keys()].sort();

  const modules = names
    .map((name) => {
      const off = snapshot.disabled.includes(name);
      return `${off ? "❌" : "✅"} \`${name}\` (${client.automod.get(name)?.scope ?? "guild"})`;
    })
    .join("\n");

  const overrides = [
    ...formatOverrides("Canales", snapshot.overrides.channels),
    ...formatOverrides("Categorías", snapshot.overrides.categories),
  ];

  const enabledCount = names.filter((n) => !snapshot.disabled.includes(n)).length;

  return new EmbedBuilder()
    .setColor(config.embedColor as ColorResolvable)
    .setTitle("🤖 Estado del automod")
    .setDescription(
      `**Global:** ${
        snapshot.globalEnabled
          ? "🟢 encendido"
          : "🔴 apagado (ningún automod se ejecuta)"
      }\n` +
        `**Módulos:** ${enabledCount}/${names.length} activos individualmente`,
    )
    .addFields(
      { name: "Módulos", value: modules || "Sin módulos cargados." },
      {
        name: "Excepciones",
        value: overrides.join("\n") || "Sin excepciones configuradas.",
      },
    )
    .setTimestamp();
}

function formatOverrides(
  title: string,
  rules: Record<string, { off: string[] }>,
): string[] {
  const entries = Object.entries(rules);
  if (!entries.length) return [];

  return [
    `**${title}:**`,
    ...entries.map(([id, rule]) => {
      const modules = rule.off
        .map((name) => (name === ALL_MODULES ? ALL_MODULES_LABEL : `\`${name}\``))
        .join(", ");
      return `<#${id}> — ${modules}`;
    }),
  ];
}

export default module;
