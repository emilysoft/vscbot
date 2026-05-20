import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  SlashCommandBuilder,
  ColorResolvable
} from "discord.js"

import config from "../../config/config.json" with {type: "json"}
import Client from "./../../interfaces/ICustomClient.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
  name: "help",
  description: "Mira todos los comandos",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Mira una lista de comandos"),
  slashCommand: true,
  cooldown: 2,
  allowEdited: false,
  messageCommand: true,
  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    const avatarPhoto = interaction.user.displayAvatarURL();
    help(interaction, avatarPhoto, interaction.user.tag, client);
  },
  async run(message: Message, client: Client) {
    const avatarPhoto = message.author.displayAvatarURL();
    help(message, avatarPhoto, message.author.tag, client);
  },
};


async function help(interaction: Message | ChatInputCommandInteraction, avatarPhoto: string, authorTag: string, client: Client) {
  try {
    const descriptions: string[] = [];

    // Fetch all global commands for your bot's application

    const commands = await interaction.guild?.commands.fetch()
    if (!commands) return
    console.log(commands)
    // Find the command object by its name

    // Return the command's ID
    //return command ? command.id : null;

    // Itera sobre todos los comandos
    client.commands.each((command) => {
      let commandInfo = "";

      // 1. Manejo de comandos normales (de mensaje o de barra sin subcomandos)
      // Si es un comando de mensaje o un comando de barra simple
      commandInfo += `\`/${command.name}\`: ${command.description}`;

      // 2. Extracción de subcomandos si es un comando de barra
      // Acceder a las opciones del SlashCommandBuilder
      // El método 'options' en Discord.js v14 puede devolver una mezcla de tipos de opciones.
      const options = command.data.options;

      // Filtrar solo las que son subcomandos
      const subcommands = options
      //const subcommands = options.filter(option =>
      //    option instanceof ApplicationCommandOptionType.Subcommand == true // Usamos ApplicationCommandOptionType para verificar el tipo
      //) as SlashCommandSubcommandBuilder[]; // Hacemos un casting al tipo de subcomando
      commandInfo += "\n   **Subcomandos:**"; // Separador para subcomandos
      const commandData = commands.find(cmd => command.name == cmd.name)
      if (!commandData) return
      subcommands.forEach((subcommand: any) => {
        // Añade cada subcomando con su descripción
        console.log(subcommand.id)
        commandInfo += `\n - </${command.name} ${subcommand.name}:${commandData.id}> : ${subcommand.description}`;
      });

      // Añade la información completa (comando + subcomandos si los hay)
      if (commandInfo) {
        descriptions.push(commandInfo);
      }
    });

    // ... (resto de la función help, creando y enviando el embed)
    const embed = new EmbedBuilder()
      .setColor(config.EMBED_COLOR as ColorResolvable)
      .setTitle(`Comandos de ${interaction.client.user.username}`)
      .setAuthor({ name: authorTag, iconURL: avatarPhoto })
      // Aquí usamos \`/${command.name}\` en lugar de \`>${command.name}\` para los comandos de barra
      // o podrías mantener `>` si también tienes comandos de prefijo (messageCommand)
      .setDescription(descriptions.join("\n\n")); // Usar doble salto de línea para separar comandos

    // ... (resto del embed y el reply)
    interaction.reply({
      embeds: [embed],
      allowedMentions: { repliedUser: false },
    });

  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
}




export default module
