import {
  ChatInputCommandInteraction,
  Role,
  SlashCommandBuilder,
  AutocompleteInteraction
} from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import { DB_Role, DB_RewardRoles, DB_Server } from '../../db/Idatabase.js';
import ICommand from "../../interfaces/command.js";

const module: ICommand = {
  name: "levelsetup",
  description: "Configura el sistema de niveles",
  data: new SlashCommandBuilder()
    .setName("levelsetup")
    .setDescription("Configura el sistema de niveles del servidor")
    .addSubcommand(subcommand =>
      subcommand
        .setName("rewarded_role")
        .setDescription("Asigna un rol como recompensa por nivel")
        .addIntegerOption(option =>
          option
            .setName("nivel")
            .setDescription("Nivel requerido para obtener el rol")
            .setAutocomplete(true)
            .setRequired(true))
        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription("Rol que se entregará")
            .setRequired(true))
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const choices = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const filtered = choices.filter(choice => choice.toString().startsWith(focusedValue));

    await interaction.respond(
      filtered.map(choice => ({ name: choice.toString(), value: choice }))
    );
  },

  slashCommand: true,
  cooldown: 2,
  allowEdited: false,
  messageCommand: false,

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    setup(interaction, client);
  },
};

async function setup(interaction: ChatInputCommandInteraction, client: Client) {
  try {
    await interaction.deferReply();
    const subcommandName = interaction.options.getSubcommand();
    const { guild, user } = interaction;

    console.log(`\n[COMMAND: levelsetup] Ejecutado por ${user.tag} (${user.id}) en ${guild?.name}`);

    if (!guild) return interaction.editReply({ content: "Este comando solo funciona en servidores." });


    let owner = guild.members.cache.get(guild.ownerId)
    if(!owner) {
      owner = await guild.fetchOwner()
    }
    const serverDB = await client.db.guild.get(guild) as DB_Server;

    if (!serverDB?.id) {
      console.error(`[ERROR: DB] No se pudo obtener el serverDB para el servidor: ${guild.id}`);
      return interaction.editReply({ content: "Error al registrar el servidor." });
    }

    switch (subcommandName) {
      case "rewarded_role": {
        const nivel = interaction.options.getInteger("nivel", true);
        const role = interaction.options.getRole('role', true);

        if (!(role instanceof Role)) {
          return interaction.editReply({ content: "El objeto proporcionado no es un rol válido." });
        }

        console.info(`[INFO] Configurando recompensa: Nivel ${nivel} -> Rol: ${role.name}`);

        const roleDB = await client.db.roles.ensure({ role, server: serverDB }) as DB_Role;

        // Fix TS2345: Verificamos que el ID exista antes de proceder
        if (!roleDB?.id) {
          console.warn(`[WARN] No se pudo asegurar el rol ${role.id} en la base de datos.`);
          return interaction.editReply({ content: "Error al registrar el rol." });
        }

        const existingReward = await client.db.levels.rewardLevels.get(nivel, serverDB) as DB_RewardRoles | undefined;

        // Definimos el objeto con el tipo explícito para evitar errores de asignación
        const rewardData: DB_RewardRoles = {
          role_id: roleDB.id,
          level: nivel,
          server_id: serverDB.id
        };

        if (!existingReward?.id) {
          await client.db.levels.rewardLevels.create(rewardData);
          console.log(`[SUCCESS] Nueva recompensa creada para el nivel ${nivel}.`);
        } else {
          await client.db.levels.rewardLevels.update(rewardData);
          console.log(`[SUCCESS] Recompensa actualizada para el nivel ${nivel}.`);
        }

        return interaction.editReply({ content: `✨ Nivel **${nivel}** vinculado a **${role.name}**.` });
      }

      default:
        return interaction.editReply("Comando no válido.");
    }
  } catch (err) {
    console.error(`[CRITICAL ERROR] Error en la ejecución:`, err);
    return interaction.editReply({ content: "Algo salió fatal en el servidor, reina." });
  }
}

export default module;
