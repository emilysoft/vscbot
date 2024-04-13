const { SlashCommandBuilder } = require("discord.js");
const getBCVdata = require("../../functions/getBCVdata");
const errorLogger = require("../../functions/loggers/errorLogger");
module.exports = {
    name: "bcv",
    description: "Obtiene tasas del Sistema Bancario (Bs/USD).",
    category: "utility",
    data: new SlashCommandBuilder()
        .setName("bcv")
        .setDescription("Obtiene tasas del Sistema Bancario (Bs/USD)."),
    slashCommand: true,
    messageCommand: true,
    async execute(interaction) {
        try {
            interaction
                .reply({
                    content: "Cargando...",
                    allowedMentions: {
                        repliedUser: false,
                    },
                })
                .then(async () => {
                    const client = interaction.client;
                    const embed = await getBCVdata(client);
                    interaction.editReply({
                        content: "",
                        embeds: [embed],
                        allowedMentions: { repliedUser: false },
                    });
                });
        } catch (err) {
            errorLogger(err, interaction.client, "error");
        }
    },
    async run(message) {
        try {
            message
                .reply({
                    content: "Cargando...",
                    allowedMentions: {
                        repliedUser: false,
                    },
                })
                .then(async (msg) => {
                    const client = message.client;
                    const embed = await getBCVdata(client);
                    msg.edit({
                        content: "",
                        embeds: [embed],
                        allowedMentions: { repliedUser: false },
                    });
                });
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};
