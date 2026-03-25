import {
    Message,
    EmbedBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ColorResolvable
} from "discord.js"
import Client from "../../interfaces/ICustomClient.js";
import LevelSystem from "../../functions/levels/levelSystem.js"
import { DB_User, DB_Server, RankData } from '../../db/Idatabase.js'
import ICommand from "../../interfaces/command.js"

const module: ICommand = {
    name: "rank",
    description: "Mira tu rank",
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Mira tu rank"),
    slashCommand: true,
    cooldown: 2,
    allowEdited: false,
    messageCommand: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        rank(interaction, client);
    },
    async run() {

    }
};
// Comando de ejemplo: Ejecutado cuando el usuario hace !rank
async function rank(interaction: ChatInputCommandInteraction, client: Client) {

    const user = interaction.options.getUser('target') || interaction.user;
    const guild = interaction.guild;

    if (!guild) return interaction.reply("Este comando solo funciona en un servidor.");

    // 1. Obtener todos los datos de visualización
    const rankData = await LevelSystem.getRankData(user, guild, client)

    if (!rankData) {
        return interaction.reply(`Lo siento, ${user.username} no tiene datos de nivel aún.`);
    }

    // 2. Obtener el Rank (Posición) que se calcula al momento
    // Necesitas el ID de la DB, que está en userDB
    const userDB = await client.db.users.get(user) as DB_User;

    let owner = guild.members.cache.get(guild.ownerId)
    if(!owner) {
        owner = await guild.fetchOwner()
    }
    let serverDB = await client.db.guild.get(guild) as DB_Server | undefined;
    if(!serverDB) {
        serverDB = await client.db.guild.create(guild, owner.user)
    }


    if(!userDB || !userDB.id || !serverDB || !serverDB.id ) throw new Error("error con el comando rank")
    // **Añadir el Rank al objeto RankData**
    rankData.rank = await client.db.levels.getRank(userDB.id, serverDB.id) as number | undefined


    // 3. Formatear y Mostrar el resultado
    const progressPercent = (rankData.xpProgress / (rankData.xpProgress + rankData.xpToNextLevel)) * 100;

    const embed = new EmbedBuilder()
        .setTitle(`📊 Perfil de Rango de ${rankData.username}`)
        .setDescription(`**Nivel:** ${rankData.level}`)
        .addFields(
            { name: 'Total XP', value: rankData.totalXp.toLocaleString(), inline: true },
            { name: 'Posición', value: rankData.rank ? `#${rankData.rank}` : 'N/A', inline: true },
            { name: 'Progreso', value: `Faltan ${rankData.xpToNextLevel} XP para el Nivel ${rankData.level + 1}`, inline: false }
        )
        .setFooter({ text: `Barra de progreso: ${progressPercent.toFixed(2)}%` });

    await interaction.reply({ embeds: [embed] });
}

export default module
