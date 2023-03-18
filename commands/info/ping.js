const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: "avatar",
    aliases: ["av"],
    category: "Utility",
    usage: "avatar/avatar @user",
    description: "Gives avatar for message author or mentioned user.",
    botPerms: ["EmbedLinks", "ManageMessages"],
    desactivated: false,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
}