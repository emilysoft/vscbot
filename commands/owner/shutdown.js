import config from "../../config.json" with {type:"json"}
import { SlashCommandBuilder } from "discord.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
import chalk from "chalk"
const module = {
    name: "shutdown",
    description: "Apagas el bot",
    slashCommand: true,
    permissions: ["owner"],
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("shutdown")
        .setDescription("Apagas el bot"),
    async execute(interaction) {
        if (config.OWNERS_ID[0] == interaction.user.id) {
            shutdown(interaction);
        } else {
            await interaction.reply({
                content: "Solo el owner puede apagar el bot",
                ephemeral: true,
            });
        }
    },
    async run(message) {
        if (config.OWNERS_ID[0] == message.author.id) {
            shutdown(message);
        }
    },
};

async function shutdown(interaction) {
    try {
        await interaction.reply({
            content: "Apagando bot...",
            allowedMentions: { repliedUser: false },
        });
        interaction.client.destroy();
        console.log(
            chalk.bgRed.white(
                `EL BOT HA SIDO APAGADO POR ${interaction.user.username}`
            )
        );
    } catch (err) {
        errorLogger(err, message.client, "error", import.meta.url);
    }
}
export default module
