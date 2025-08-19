import { Message, ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, GuildChannel, TextChannel } from "discord.js";
import ICommand from "../../interfaces/command.js";
import config from "../../config/config.json" with {type: "json"}

const module: ICommand = {
    name: "setchannelname",
    data: new SlashCommandBuilder()
        .setName("setchannelname")
        .setDescription("Cambia el nombre del canal de texto actual.")
        .addStringOption((option) =>
            option
                .setName("nombre")
                .setDescription("El nuevo nombre para el canal.")
                .setRequired(true)
        ),
    description: "Cambia el nombre del canal de texto donde se ejecuta el comando.",
    cooldown: 1,
    allowEdited: false,
    slashCommand: true,
    messageCommand: false,
    async execute(interaction: ChatInputCommandInteraction) {
        const AUTHOR_ID = interaction.user.id;
        if (!config.OWNERS_ID.some((id) => id === AUTHOR_ID)) throw new Error("comando no autorizado");
        setChannelName(interaction, interaction.options.getString("nombre", true));
    },
    async run(message: Message) {
        // No se implementa para comandos de mensaje en este ejemplo.
    }
};

async function setChannelName(interaction: ChatInputCommandInteraction | Message, newName: string) {
    if (interaction.channel instanceof TextChannel) {
        try {
            await interaction.channel.setName(`👀・${newName}`);
            if (interaction instanceof ChatInputCommandInteraction) {
                interaction.reply({ content: `El nombre del canal ha sido cambiado a **${newName}**`, ephemeral: true });
            } else if (interaction instanceof Message) {
                interaction.reply(`El nombre del canal ha sido cambiado a **${newName}**`);
            }
        } catch (error) {
            console.error("Error al cambiar el nombre del canal:", error);
            if (interaction instanceof ChatInputCommandInteraction) {
                interaction.reply({ content: "Ocurrió un error al intentar cambiar el nombre del canal. Asegúrate de tener los permisos necesarios.", ephemeral: true });
            } else if (interaction instanceof Message) {
                interaction.reply("Ocurrió un error al intentar cambiar el nombre del canal. Asegúrate de tener los permisos necesarios.");
            }
        }
    } else {
        if (interaction instanceof ChatInputCommandInteraction) {
            interaction.reply({ content: "Este comando solo puede ser usado en un canal de texto.", ephemeral: true });
        } else if (interaction instanceof Message) {
            interaction.reply("Este comando solo puede ser usado en un canal de texto.");
        }
    }
}

export default module;
