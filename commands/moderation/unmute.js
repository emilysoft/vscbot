const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "unmute",
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("unmute a person"),
    desactivated: true,
    description: "unmute a person",
    async execute(message) {
    
    }
}