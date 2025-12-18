// refactorizado para usar Promise.all
import { Events, Message, TextChannel } from "discord.js"
import Client from "../../interfaces/ICustomClient.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import config from "../../config/config.json" with {type: "json"}
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
import LevelSystem from "../../functions/levels/levelSystem.js"

const module: IEvents = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            const guild = message.guild
            // Evita que el bot actúe sobre sí mismo
            if (!client.user || message.author.id === client.user.id) return;
            if (!guild || !(message.channel instanceof TextChannel)) return;
            messageLogger(message, "create", client as Client);
            LevelSystem.processMessage(message, client);
            // Automod
            const automodActions = client.automod
                .filter(automod => {
                    // Ignora bots si la configuración lo indica
                    if (message.author.bot && automod.ignoreBots) {
                        return false;
                    }

                    if(automod.scope == "global") {
                        return true
                    }

                    if (automod.scope == "guild") {
                        if(guild.id == config.guildId) {
                            return true
                        }
                    }

                    return false
                })
            automodActions.forEach(async automod => {
                await automod.execute( message, client)
            })

            // Comandos de texto
            if (message.content.startsWith(config.prefix)) {
                const commands = client.messageCommands;
                const [commandName, ...argsArray] = message.content.substring(1).split(/ +/);
                const args = argsArray.join(" ");

                const cmd = commands.get(commandName);
                if (cmd && cmd.run) {
                    console.log(`Ejecutando comando ${cmd.name}`);
                    await cmd.run(message, client, args);
                }
            }
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
            console.error(err);
        }
    },
};

export default module;
