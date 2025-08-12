import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from "discord.js"
import getBCVdata from "../../functions/lib/getBCVdata.js"
import Client from "../../interfaces/ICustomClient.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "bcv",
    description: "Obtiene tasas del Sistema Bancario (Bs/USD).",
    //category: "utility",
    data: new SlashCommandBuilder()
        .setName("bcv")
        .setDescription("Obtiene tasas del Sistema Bancario (Bs/USD)."),
    allowEdited: false,
    slashCommand: false,
    cooldown: 5,
    messageCommand: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
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
                    if (!embed) return interaction.editReply({
                        content: "Error al cargar",
                        allowedMentions: { repliedUser: false },
                    });

                    interaction.editReply({
                        content: "",
                        embeds: [embed],
                        allowedMentions: { repliedUser: false },
                    });
                });
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
    async run(message: Message, client: Client) {
        try {
            //message
            //    .reply({
            //        content: "Cargando...",
            //        allowedMentions: {
            //            repliedUser: false,
            //        },
            //    })
            //.then(async (msg) => {
            const embed = await getBCVdata(client);
            if (!embed) return
            //msg.edit({
            await message.reply({
                content: "",
                embeds: [embed],
                allowedMentions: { repliedUser: false },
            });
            //});
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};

export default module 
