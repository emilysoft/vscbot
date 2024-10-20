import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from "discord.js"
import getBCVdata from "../../functions/getBCVdata.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
import Client from "../../classes/ICustomClient.js"
import ICommand from "../../interfaces/command.js"
const module:ICommand = {
    name: "bcv",
    description: "Obtiene tasas del Sistema Bancario (Bs/USD).",
    //category: "utility",
    data: new SlashCommandBuilder()
        .setName("bcv")
        .setDescription("Obtiene tasas del Sistema Bancario (Bs/USD)."),
    slashCommand: false,
    messageCommand: true,
    async execute(interaction: ChatInputCommandInteraction, client:Client) {
        try {
            interaction
                .reply({
                    content: "Cargando...",
                    allowedMentions: {
                        repliedUser: false,
                    },
                })
                .then(async () => {
                    const embed = await getBCVdata(client);
                    if(!embed) return
                    interaction.editReply({
                        content: "",
                        embeds: [embed],
                        allowedMentions: { repliedUser: false },
                    });
                });
        } catch (err) {
            errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
    async run(message: Message, client:Client) {
        try {
            message
                .reply({
                    content: "Cargando...",
                    allowedMentions: {
                        repliedUser: false,
                    },
                })
                .then(async (msg) => {
                    const embed = await getBCVdata(client);
                    if(!embed) return
                    msg.edit({
                        content: "",
                        embeds: [embed],
                        allowedMentions: { repliedUser: false },
                    });
                });
        } catch (err) {
            errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};

export default module 