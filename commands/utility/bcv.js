import { SlashCommandBuilder } from "discord.js"
import getBCVdata from "../../functions/getBCVdata.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
export default {
    name: "bcv",
    description: "Obtiene tasas del Sistema Bancario (Bs/USD).",
    category: "utility",
    data: new SlashCommandBuilder()
        .setName("bcv")
        .setDescription("Obtiene tasas del Sistema Bancario (Bs/USD)."),
    slashCommand: false,
    messageCommand: false,
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
            errorLogger(err, interaction.client, "error", import.meta.url);
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
            errorLogger(err, message.client, "error", import.meta.url);
        }
    },
};
