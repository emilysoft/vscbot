import { Events, ChatInputCommandInteraction} from 'discord.js'
import commandSlashLogger from '../../functions/loggers/commandSlashLogger.js'
import errorLogger from '../../functions/loggers/errorLogger.js'
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
const module: IEvents = {
	name: Events.InteractionCreate,
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.isChatInputCommand()) return;
		commandSlashLogger(interaction)
		const command = client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			if(!command.execute) return
			await command.execute(interaction, client);
		} catch (error) {
			errorLogger(error, client, 'error')
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};

export default module
