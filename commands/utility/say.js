const { SlashCommandBuilder } = require("discord.js");
const { OWNERS_ID } = require("../../config.json");
const errorLogger = require("../../functions/loggers/errorLogger");
module.exports = {
    name: "say",
    category: "utility",
    description: "Di algo por medio del bot",
    slashCommand: true,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Di algo por medio del bot")
        .addStringOption((option) =>
            option.setName("texto").setDescription("ingrese un texto")
        ),
    async execute(interaction) {
        try {
            const authorID = interaction.user.id;
            if (!OWNERS_ID.some((id) => id === authorID)) return;
            const args = interaction.options.getString("texto", true);
            await interaction.channel.send(args).then(async () => {
                interaction.reply({
                    content: "Mensaje enviado",
                    ephemeral: true,
                });
            });
        } catch (err) {
            if (err.code == "CommandInteractionOptionNotFound") {
                interaction.reply({
                    content: "Introduzca los datos requeridos",
                    ephemeral: true,
                });
            } else {
                errorLogger(err, interaction.client, "error");
            }
        }
    },
    async run(message) {
        try {
            const authorID = message.author.id;
            if (!OWNERS_ID.some((id) => id === authorID)) return;
            message.delete();
            const args = message.content
                .substring(1)
                .split(/ +/)
                .slice(1)
                .join(" ");
            if (!args) {
                message.reply("Por favor especifique algo");
                return;
            }
            message.channel.send(args);
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};
