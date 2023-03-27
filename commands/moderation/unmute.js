const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "unmute",
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("unmute a person")
        .addUserOption(option => option.setName("id").setDescription("ingrese una id")),
    slashCommand: false,
    messageCommand:false,
    description: "unmute a person",
    async execute(message) {
    
    }
}