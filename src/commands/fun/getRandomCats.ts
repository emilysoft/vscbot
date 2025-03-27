import { Message, SlashCommandBuilder, ChatInputCommandInteraction} from "discord.js"
import cats from "./cats.json" with {type:"json"}
import Client from "./../../interfaces/ICustomClient.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "cats",
    data: new SlashCommandBuilder()
        .setName("cats")
        .setDescription("Obtienes un gato random"),
    description: "obtiene un gato random",
    messageCommand: true,
    slashCommand: true,
    async execute(interaction : ChatInputCommandInteraction, client:Client) {
        getCats(interaction, client);
    },
    async run(message: Message, client:Client) {
        getCats(message, client);
    },
};

async function getCats(interaction : Message | ChatInputCommandInteraction, client:Client) {
    try {
        const cat = cats[Math.ceil(Math.random() * cats.length)];
        await interaction.reply({
            allowedMentions: {
                repliedUser: false,
            },
            content: cat,
        });
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
}

export default module