const { SlashCommandBuilder } = require("discord.js");
const { OWNERS_ID } = require("../../config.json");
module.exports = {
    name: "say",
    category: "utility",
    usage: ">say texto",
    description: "Di algo por medio del bot",
    desactivated: false,
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Di algo por medio del bot"),
    async execute(message) {
        const authorID = message.author.id;
        if (!OWNERS_ID.some((id) => id === authorID)) return;
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
        message.channel.send(args);
    },
};
