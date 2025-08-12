import { Events, ChatInputCommandInteraction } from 'discord.js'
import commandSlashLogger from '../../functions/loggers/commandSlashLogger.js'
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
const cooldowns = new Map<string, Map<string, number>>();
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
            if (!command.execute) return

            if (command.cooldown) {
                if (!cooldowns.has(command.name)) {
                    cooldowns.set(command.name, new Map<string, number>());
                }

                const now = Date.now();
                const timestamps = cooldowns.get(command.name)!;
                const cooldownAmount = command.cooldown * 1000;

                if (timestamps.has(interaction.user.id)) {
                    const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        await interaction.reply({ content: `Por favor, espera ${timeLeft.toFixed(1)} segundos antes de volver a usar \`${command.name}\`.`, ephemeral: true });
                        return;
                    }
                }

                timestamps.set(interaction.user.id, now);
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
                await command.execute(interaction, client);
            }



        } catch (error) {
            client.errorLogger(error, client, 'error')
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};

export default module
