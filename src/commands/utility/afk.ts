import { Message, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
  name: "afk",
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Establece tu estado AFK")
    .addStringOption((option) =>
      option.setName("razón").setDescription("texto")
    ),
  description: "Establece tu estado AFK",
  allowEdited: false,
  slashCommand: true,
  cooldown: 5,
  messageCommand: true,
  async execute(interaction: ChatInputCommandInteraction) {
    afk(interaction, interaction.user.id)
  },
  async run(message: Message) {
    afk(message, message.author.id)
  }
};

function afk(interaction: ChatInputCommandInteraction | Message, authorID: string) {
  interaction.reply({
    content: `<@${authorID}> se fue pal coño.`,
    allowedMentions: {
      repliedUser: false,
    },
  });
}

export default module
