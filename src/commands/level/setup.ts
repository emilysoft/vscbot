import {
    ChatInputCommandInteraction,
    Role,
    SlashCommandBuilder,
    AutocompleteInteraction
} from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import LevelSystem from "../../functions/levels/levelSystem.js";
import { DB_UserLevel, DB_Role, DB_RewardRoles, DB_Server } from '../../db/Idatabase.js';
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
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("ensure_levels")
                .setDescription("Sincroniza niveles de usuarios basados en sus roles actuales")
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
    const startTime = Date.now();
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

            case "ensure_levels": {
                console.info(`[INFO] Iniciando sincronización masiva de niveles en ${guild.name}...`);

                const rewardRolesDB = await client.db.levels.rewardLevels.getAll(serverDB.id) as DB_RewardRoles[] | undefined;
                if (!rewardRolesDB?.length) {
                    console.warn(`[WARN] Intento de sincronización sin roles de recompensa configurados.`);
                    return interaction.editReply("Configura recompensas primero.");
                }

                const rewardRoles = (await Promise.all(rewardRolesDB.map(async (reward) => {
                    const roleData = await client.db.roles.get({ id: reward.role_id });
                    return roleData?.role_id ? { level: reward.level, role_id: roleData.role_id } : null;
                }))).filter(Boolean) as { level: number, role_id: string }[];

                const members = await guild.members.fetch();
                const logs = await client.db.levels.getAllLogs("2025-10-16T11:27:00.000Z");

                if (!logs) throw new Error("Fallo al leer logs del sistema.");

                type logDATA = { userDB_id: number; messages: string[] };
                const datesByUser = new Map<string, logDATA>();

                for (const log of logs) {
                    if (!datesByUser.has(log.user_id)) {
                        datesByUser.set(log.user_id, { userDB_id: log.userDB_id, messages: [] });
                    }
                    datesByUser.get(log.user_id)!.messages.push(log.creation_date);
                }

                let updatedCount = 0;
                console.log(`[PROCESS] Procesando ${members.size} miembros...`);

                for (const [memberId, member] of members) {
                    if (member.user.bot) continue;

                    const memberRewardRoles = rewardRoles.filter(r => member.roles.cache.has(r.role_id));

                    if (memberRewardRoles.length > 0) {
                        const highestLevelRole = memberRewardRoles.sort((a, b) => b.level - a.level)[0];
                        const targetLevel = highestLevelRole.level;

                        // Intentamos obtener el usuario de la tabla de niveles
                        let userLevel = await client.db.levels.get(member.user, guild) as DB_UserLevel;

                        if (!userLevel) {
                            // Fix TS2339: Usamos el método de obtención de usuario base que tengas disponible
                            // Nota: Asegúrate de que 'client.db.user.get' sea el nombre correcto en tu sistema
                            const userBase = await client.db.users.get(member.user) as { id: number } | undefined;

                            if (!userBase?.id) {
                                // Si no está en logs ni en la tabla de usuarios, no podemos sincronizarlo
                                continue;
                            }

                            // Fix TS2345: Agregamos 'last_message' (propiedad requerida por DB_UserLevel)
                            await client.db.levels.create({
                                user_id: userBase.id,
                                server_id: serverDB.id,
                                xp: LevelSystem.calculateXpNeeded(targetLevel),
                                level: targetLevel,
                                last_message: new Date().toISOString()
                            });
                            updatedCount++;
                            console.debug(`[DEBUG] Usuario ${member.user.username} creado con nivel ${targetLevel}.`);
                        } else {
                            // Si ya existe, solo actualizamos si el nivel es diferente
                            if (userLevel.level !== targetLevel) {
                                userLevel.level = targetLevel;
                                userLevel.xp = LevelSystem.calculateXpNeeded(targetLevel);
                                await client.db.levels.update(userLevel);
                                updatedCount++;
                                console.debug(`[DEBUG] Usuario ${member.user.username} actualizado al nivel ${targetLevel}.`);
                            }
                        }

                        // Procesamos mensajes antiguos para sumar el XP de los logs
                        const userLogInfo = datesByUser.get(memberId);
                        if (userLogInfo && userLogInfo.messages.length > 0) {
                            for (const date of userLogInfo.messages) {
                                await LevelSystem.processMessage(member, client, new Date(date).getTime());
                            }
                        }
                    }
                }

                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`[SUCCESS] Sincronización terminada. Miembros ajustados: ${updatedCount}. Tiempo: ${duration}s.`);
                return interaction.editReply(`Sincronización terminada. Se ajustaron ${updatedCount} usuarios.`);
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
