import { SlashCommandBuilder, TextChannel } from "discord.js"
import config from "../../config/config.json" with {type: "json"}
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "say",
    //category: "utility",
    description: "Di algo por medio del bot",
    slashCommand: true,
    cooldown: 1,
    messageCommand: true,
    allowEdited: false,
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Di algo por medio del bot")
        .addStringOption((option) =>
            option.setName("texto").setDescription("ingrese un texto")
        ),
    async execute(interaction, client) {
        try {
            const authorID = interaction.user.id;
            if (!config.OWNERS_ID.some((id) => id === authorID)) return;
            const args = interaction.options.getString("texto", true);
            if (interaction.channel instanceof TextChannel != true) return
            interaction.channel.send(args).then(async () => {
                interaction.reply({
                    content: "Mensaje enviado",
                    ephemeral: true,
                });
            });
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
    async run(message, client) {
        try {
            const authorID = message.author.id;
            if (!config.OWNERS_ID.some((id) => id === authorID)) return;
            if (message)
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
            if (message.channel instanceof TextChannel != true) return
            message.channel.send(args);
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};

export default module
