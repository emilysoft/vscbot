import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  EmbedBuilder,
  ColorResolvable,
  PermissionFlagsBits,
} from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import LevelSystem from "../../functions/levels/levelSystem.js";
import { DB_User, DB_Server, DB_UserLevel } from "../../db/Idatabase.js";
import ICommand from "../../interfaces/command.js";
import config from "../../config/config.json" with { type: "json" };

const module: ICommand = {
  name: "level",
  description: "Gestiona niveles",
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Gestiona niveles")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName("set_level")
        .setDescription("Establece el nivel de un usuario")
        .addUserOption(opt =>
          opt.setName("member").setDescription("Miembro").setRequired(true),
        )
        .addIntegerOption(opt =>
          opt
            .setName("level")
            .setDescription("Nuevo nivel")
            .setRequired(true)
            .setMinValue(1),
        ),
    ),
  slashCommand: true,
  cooldown: 3,
  allowEdited: false,
  messageCommand: false,

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    await interaction.deferReply();

    const subcommandName = interaction.options.getSubcommand();
    const { guild } = interaction;

    if (!guild) {
      await interaction.editReply(
        "Este comando solo funciona en un servidor.",
      );
      return;
    }

    switch (subcommandName) {
      case "set_level":
        await handleSetLevel(interaction, client);
        break;
      default:
        await interaction.editReply("Subcomando no válido.");
    }
  },
};

async function handleSetLevel(
  interaction: ChatInputCommandInteraction,
  client: Client,
) {
  const member = interaction.options.getMember("member") as GuildMember | null;
  const targetUser = interaction.options.getUser("member", true);
  const targetLevel = interaction.options.getInteger("level", true);
  const { guild } = interaction;

  if (!member || !guild) {
    await interaction.editReply("Miembro no encontrado en el servidor.");
    return;
  }

  if (targetUser.bot) {
    await interaction.editReply("No puedes establecer nivel a un bot.");
    return;
  }

  const userDB = (await client.db.users.get(targetUser)) as DB_User;
  if (!userDB?.id) {
    await interaction.editReply("Error al obtener usuario de la base de datos.");
    return;
  }

  let owner = guild.members.cache.get(guild.ownerId);
  if (!owner) {
    owner = await guild.fetchOwner();
  }

  let serverDB = (await client.db.guild.get(guild)) as DB_Server | undefined;
  if (!serverDB) {
    serverDB = await client.db.guild.create(guild, owner.user);
    if (!serverDB) {
      await interaction.editReply("Error al registrar el servidor.");
      return;
    }
  }

  const serverId = serverDB.id as number;
  const xp = LevelSystem.calculateXpNeeded(targetLevel);

  let userLevel = (await client.db.levels.get(
    targetUser,
    guild,
  )) as DB_UserLevel | undefined;

  if (!userLevel) {
    await client.db.levels.create({
      user_id: userDB.id as number,
      server_id: serverId,
      xp,
      level: targetLevel,
      last_message: new Date().toISOString(),
    });
  } else {
    userLevel.xp = xp;
    userLevel.level = targetLevel;
    userLevel.last_message = new Date().toISOString();
    await client.db.levels.update(userLevel);
  }

  await LevelSystem.syncRewardRoles(member, targetLevel, client);

  const embed = new EmbedBuilder()
    .setTitle("✅ Nivel actualizado")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "Usuario", value: targetUser.username, inline: true },
      { name: "Nuevo nivel", value: String(targetLevel), inline: true },
      {
        name: "XP total",
        value: xp.toLocaleString(),
        inline: true,
      },
    );

  await interaction.editReply({ embeds: [embed] });
}

export default module;
