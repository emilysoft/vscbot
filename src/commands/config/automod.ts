import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import ICommand from "../../interfaces/command.js";
import { isOwner } from "../../config/index.js";
import {
  ALL_MODULES,
  ALL_MODULES_LABEL,
  buildStatusPages,
} from "../../functions/lib/automodStatus.js";
import type { AutomodOverrideScope } from "../../db/automodManager.js";

const STATUS_BUTTON_PREFIX = "automod_status_";

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
      const snapshot = manager.snapshot();
      const pages = buildStatusPages({
        globalEnabled: snapshot.globalEnabled,
        disabled: snapshot.disabled,
        overrides: snapshot.overrides,
        modules: [...client.automod.entries()].map(([name, automod]) => ({
          name,
          scope: automod.scope,
        })),
      });

      if (pages.length === 1) {
        await interaction.reply({ embeds: pages, ephemeral: true });
        return;
      }

      let page = 0;
      await interaction.reply({
        embeds: [pages[page]],
        components: [buildStatusRow(page, pages.length)],
        ephemeral: true,
      });

      const reply = await interaction.fetchReply();
      const collector = reply.createMessageComponentCollector({
        filter: (button) =>
          button.user.id === interaction.user.id &&
          button.customId.startsWith(STATUS_BUTTON_PREFIX),
        time: 120_000,
      });

      collector.on("collect", async (button) => {
        page =
          button.customId === `${STATUS_BUTTON_PREFIX}prev`
            ? Math.max(0, page - 1)
            : Math.min(pages.length - 1, page + 1);
        await button.update({
          embeds: [pages[page]],
          components: [buildStatusRow(page, pages.length)],
        });
      });

      collector.on("end", async () => {
        await interaction
          .editReply({ components: [buildStatusRow(page, pages.length, true)] })
          .catch(() => null);
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

function buildStatusRow(
  page: number,
  total: number,
  disabled = false,
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${STATUS_BUTTON_PREFIX}prev`)
      .setLabel("Anterior")
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || page === 0),
    new ButtonBuilder()
      .setCustomId(`${STATUS_BUTTON_PREFIX}next`)
      .setLabel("Siguiente")
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || page >= total - 1),
  );
}

export default module;
