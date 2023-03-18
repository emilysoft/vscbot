const { Events } = require('discord.js');
const errorLogger = require('../../functions/loggers/errorLogger');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			errorLogger(error, interaction.client, 'error')
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};