import { SlashCommandBuilder } from "discord.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
import cats from "./cats.json" with {type:"json"}
const module = {
    name: "cats",
    data: new SlashCommandBuilder()
        .setName("cats")
        .setDescription("Obtienes un gato random"),
    description: "obtiene un gato random",
    messageCommand: true,
    slashCommand: true,
    async execute(interaction) {
        getCats(interaction);
    },
    async run(message) {
        getCats(message);
    },
};

async function getCats(interaction) {
    try {
        const cat = cats[Math.ceil(Math.random() * cats.length)];
        await interaction.reply({
            allowedMentions: {
                repliedUser: false,
            },
            content: cat,
        });
    } catch (err) {
        errorLogger(err, interaction.client, "error", import.meta.url);
    }
}

export default module