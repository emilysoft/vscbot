import { Events } from 'discord.js'
import commandSlashLogger from '../../functions/loggers/commandSlashLogger.js'
import errorLogger from '../../functions/loggers/errorLogger.js'

const module = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		commandSlashLogger(interaction)
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

export default module
