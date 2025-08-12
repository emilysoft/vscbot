import config from "../../config.json" with {type: "json"}
import { Message, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import chalk from "chalk"
import Client from "../../interfaces/ICustomClient.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "shutdown",
    description: "Apagas el bot",
    slashCommand: true,
    allowEdited: false,
    cooldown: 1,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("shutdown")
        .setDescription("Apagas el bot"),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (config.OWNERS_ID[0] == interaction.user.id) {
            shutdown(interaction, client);
        } else {
            await interaction.reply({
                content: "Solo el owner puede apagar el bot",
                ephemeral: true,
            });
        }
    },
    async run(message: Message, client: Client) {
        if (config.OWNERS_ID[0] == message.author.id) {
            shutdown(message, client);
        }
    },
};

async function shutdown(interaction: ChatInputCommandInteraction | Message, client: Client) {
    try {
        await interaction.reply({
            content: "Apagando bot...",
            allowedMentions: { repliedUser: false },
        });
        interaction.client.destroy();
        if (interaction instanceof ChatInputCommandInteraction) {
            console.log(
                chalk.bgRed.white(
                    `EL BOT HA SIDO APAGADO POR ${interaction.user.username}`
                )
            );
        } else {
            console.log(
                chalk.bgRed.white(
                    `EL BOT HA SIDO APAGADO POR ${interaction.author.username}`
                ));
        }

    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
}
export default module
