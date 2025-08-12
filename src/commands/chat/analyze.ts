import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { Message, ChatInputCommandInteraction, TextChannel } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import ICommand from "../../interfaces/command.js";
import { analyzeChat } from '../../functions/chatAnalysis.js';

const module: ICommand = {
    name: "contexto",
    data: new SlashCommandBuilder()
        .setName("contexto")
        .setDescription("Analiza los últimos mensajes del canal y explica de qué se está hablando"),
    description: "Analiza el contexto del chat usando IA",
    cooldown: 60 * 5,
    allowEdited: false,
    messageCommand: false,
    slashCommand: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await analyze(interaction, client);
    },
    async run(message: Message, client: Client) {
        // No implementado por ahora
    }
};

export default module;

async function analyze(interaction: ChatInputCommandInteraction, client: Client) {
    try {
        const channel = interaction.channel;
        if (channel instanceof TextChannel != true) return;
        interaction.deferReply({ ephemeral: true });
        const limit = 50;
        const analysis = await analyzeChat(channel, limit);
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🤖 Análisis del Chat')
            .setDescription(analysis)
            .addFields(
                { name: 'Mensajes analizados', value: limit.toString(), inline: true },
                { name: 'Canal', value: channel.toString(), inline: true }
            )
            .setTimestamp();

        await interaction.followUp({
            embeds: [embed],
            ephemeral: true,
        });
    } catch (error) {
        client.errorLogger(error, client, "error", process.cwd() + " ");
    }
}
