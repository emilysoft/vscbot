import { Message, ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, GuildChannel, TextChannel } from "discord.js";
import ICommand from "../../interfaces/command.js";
import config from "../../config.json" with {type: "json"}

const module: ICommand = {
    name: "setchanneldescription",
    data: new SlashCommandBuilder()
        .setName("setchanneldescription")
        .setDescription("Cambia la descripción (topic) del canal de texto actual.")
        .addStringOption((option) =>
            option
                .setName("descripcion")
                .setDescription("La nueva descripción para el canal.")
                .setRequired(true)
        ),
    description: "Cambia la descripción del canal de texto donde se ejecuta el comando.",
    cooldown: 0,
    allowEdited: false,
    slashCommand: true,
    messageCommand: false,
    async execute(interaction: ChatInputCommandInteraction) {
        const AUTHOR_ID = interaction.user.id;
        if (!config.OWNERS_ID.some((id) => id === AUTHOR_ID)) throw new Error("comando no autorizado");

        setChannelDescription(interaction, interaction.options.getString("descripcion", true));
    },
    async run(message: Message) {
        // No se implementa para comandos de mensaje en este ejemplo.
    }
};

async function setChannelDescription(interaction: ChatInputCommandInteraction | Message, newDescription: string) {
    if (interaction.channel instanceof TextChannel) {
        try {
            const actualChannelDescription = interaction.channel.topic
            await interaction.channel.setTopic(`${newDescription} ${actualChannelDescription}`);
            if (interaction instanceof ChatInputCommandInteraction) {
                await interaction.reply({ content: "La descripción del canal ha sido actualizada.", ephemeral: true });
            } else if (interaction instanceof Message) {
                await interaction.reply("La descripción del canal ha sido actualizada.");
            }
        } catch (error) {
            console.error("Error al cambiar la descripción del canal:", error);
            if (interaction instanceof ChatInputCommandInteraction) {
                await interaction.reply({ content: "Ocurrió un error al intentar cambiar la descripción del canal. Asegúrate de tener los permisos necesarios.", ephemeral: true });
            } else if (interaction instanceof Message) {
                await interaction.reply("Ocurrió un error al intentar cambiar la descripción del canal. Asegúrate de tener los permisos necesarios.");
            }
        }
    } else {
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ content: "Este comando solo puede ser usado en un canal de texto.", ephemeral: true });
        } else if (interaction instanceof Message) {
            await interaction.reply("Este comando solo puede ser usado en un canal de texto.");
        }
    }
}

export default module;
