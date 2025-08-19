// refactorizado para usar Promise.all
import { Events, Message, TextChannel } from "discord.js"
import Client from "../../interfaces/ICustomClient.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import config from "../../config/config.json" with {type: "json"}
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"

const module: IEvents = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            // Evita que el bot actúe sobre sí mismo
            if (!client.user || message.author.id === client.user.id) return;
            if (!message.guild || !(message.channel instanceof TextChannel)) return;
            messageLogger(message, "create", client as Client);

            // Automod
            const automodPromises = client.automod
                .filter(automod => {
                    // Ignora bots si la configuración lo indica
                    if (message.author.bot && automod.ignoreBots) {
                        return false;
                    }

                    // Filtra por servidores: solo VSC o solo otros
                    const isExclusiveServer = message.guild!.id === "813538324320092161";
                    if (automod.exclusive && isExclusiveServer)
                        return true

                    if (!automod.exclusive && !isExclusiveServer)
                        return true
                })
                .map(automod => automod.execute(message, client));
            // Ejecuta todas las promesas de automod de forma concurrente
            await Promise.all(automodPromises);
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
