import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  MessageComponentInteraction,
  SlashCommandBuilder,
} from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import ICommand from "../../interfaces/command.js";
import { DB_LevelLeaderboardEntry, DB_Server } from "../../db/Idatabase.js";
import config from "../../config/config.json" with { type: "json" };

const PAGE_SIZE = 10;
const MAX_PAGES = 3;
const COLLECTOR_TIME_MS = 2 * 60 * 1000;

const module: ICommand = {
  name: "top",
  description: "Muestra el top de niveles del servidor",
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Muestra el top de niveles del servidor"),
  slashCommand: true,
  cooldown: 5,
  allowEdited: false,
  messageCommand: false,
  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    await top(interaction, client);
  },
  async run() {},
};

function buildComponents(
  page: number,
  totalPages: number,
  interactionId: string,
  disabled = false,
): ActionRowBuilder<ButtonBuilder>[] {
  if (totalPages <= 1) return [];

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`top:prev:${interactionId}`)
      .setLabel("◀ Anterior")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || page === 0),
    new ButtonBuilder()
      .setCustomId(`top:page:${interactionId}`)
      .setLabel(`Página ${page + 1}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`top:next:${interactionId}`)
      .setLabel("Siguiente ▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || page >= totalPages - 1),
  );

  return [row];
}

function buildEmbed(
  guildName: string,
  entries: DB_LevelLeaderboardEntry[],
  page: number,
  totalPages: number,
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .setTitle(`🏆 Top de niveles — ${guildName}`)
    .setFooter({
      text: `Página ${page + 1}/${totalPages} • ${entries.length} jugadores`,
    })
    .setTimestamp();

  if (!entries.length) {
    return embed.setDescription(
      "Aún no hay datos de niveles en este servidor.",
    );
  }

  const start = page * PAGE_SIZE;
  const lines = entries.slice(start, start + PAGE_SIZE).map((entry, index) => {
    const rank = start + index + 1;
    const position =
      rank === 1
        ? "🥇"
        : rank === 2
          ? "🥈"
          : rank === 3
            ? "🥉"
            : `**#${rank}**`;

    return `${position} <@${entry.discord_id}> — Nivel **${entry.level}** • ${entry.xp.toLocaleString()} XP`;
  });

  return embed.setDescription(lines.join("\n"));
}

async function top(interaction: ChatInputCommandInteraction, client: Client) {
  const { guild } = interaction;

  if (!guild) {
    await interaction.reply({
      content: "Este comando solo funciona en un servidor.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  const serverDB = (await client.db.guild.get(guild)) as DB_Server | undefined;
  const entries = serverDB?.id
    ? await client.db.levels.getLeaderboard(serverDB.id, PAGE_SIZE * MAX_PAGES)
    : [];

  const totalPages = Math.max(
    1,
    Math.min(MAX_PAGES, Math.ceil(entries.length / PAGE_SIZE)),
  );
  let currentPage = 0;

  await interaction.editReply({
    embeds: [buildEmbed(guild.name, entries, currentPage, totalPages)],
    components: buildComponents(currentPage, totalPages, interaction.id),
    allowedMentions: { parse: [] },
  });

  if (totalPages <= 1) return;

  const message = await interaction.fetchReply();

  const collector = message.createMessageComponentCollector({
    filter: (i: MessageComponentInteraction) =>
      i.user.id === interaction.user.id,
    time: COLLECTOR_TIME_MS,
  });

  collector.on("collect", async (i: MessageComponentInteraction) => {
    const delta = i.customId.startsWith("top:prev:")
      ? -1
      : i.customId.startsWith("top:next:")
        ? 1
        : 0;

    const nextPage = Math.max(0, Math.min(totalPages - 1, currentPage + delta));

    if (nextPage === currentPage) {
      await i.deferUpdate();
      return;
    }

    currentPage = nextPage;

    await i.update({
      embeds: [buildEmbed(guild.name, entries, currentPage, totalPages)],
      components: buildComponents(currentPage, totalPages, interaction.id),
      allowedMentions: { parse: [] },
    });
  });

  collector.on("end", async () => {
    await interaction
      .editReply({
        components: buildComponents(
          currentPage,
          totalPages,
          interaction.id,
          true,
        ),
      })
      .catch(() => {});
  });
}

export default module;
