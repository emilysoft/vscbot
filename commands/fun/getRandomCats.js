const { SlashCommandBuilder } = require("discord.js");
const errorLogger = require("../../functions/loggers/errorLogger");
const cats = require("./cats.json");
module.exports = {
    name: "cats",
    data: new SlashCommandBuilder()
        .setName("cats")
        .setDescription("obtiene un gato random"),
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
            files: [cat],
        });
    } catch (err) {
        errorLogger(err, interaction.client, "error");
    }
}
