import { SlashCommandBuilder } from "discord.js"
import config from "../../config.json" with {type:"json"}
import errorLogger from "../../functions/loggers/errorLogger.js"
const module = {
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
            if (!config.OWNERS_ID.some((id) => id === authorID)) return;
            const args = interaction.options.getString("texto", true);
            await interaction.channel.send(args).then(async () => {
                interaction.reply({
                    content: "Mensaje enviado",
                    ephemeral: true,
                });
            });
        } catch (err) {
            errorLogger(err, interaction.client, "error", import.meta.url);
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
            errorLogger(err, message.client, "error", import.meta.url);
        }
    },
};

export default module
