const { OWNERS_ID } = require("../../config.json");
const { SlashCommandBuilder } = require("discord.js");
const errorLogger = require("../../functions/loggers/errorLogger");
const chalk = require("chalk");
module.exports = {
    name: "shutdown",
    description: "Apagas el bot",
    slashCommand: true,
    permissions: ["owner"],
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("shutdown")
        .setDescription("Apagas el bot"),
    async execute(interaction) {
        if (OWNERS_ID[0] == interaction.user.id) {
            shutdown(interaction);
        } else {
            await interaction.reply({
                content: "Solo el owner puede apagar el bot",
                ephemeral: true,
            });
        }
    },
    async run(message) {
        if (OWNERS_ID[0] == message.author.id) {
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
        errorLogger(err, message.client, "error");
    }
}
