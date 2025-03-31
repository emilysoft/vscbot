import { Events, Message, TextChannel } from "discord.js"
import Client from "../../interfaces/ICustomClient.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import config from "../../config.json" with {type: "json"}
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
import logger from "../../functions/logger.js"
const LOGGER_STATUS = true
const module: IEvents = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            // evita que actue sobre si mismo
            if (!client.user) return
            if (message.author.id == client.user.id) return;
            if (!message.guild || message.channel instanceof TextChannel != true) return;
            messageLogger(message, "create", client as Client);

            //automod
            client.automod.forEach(automod => {
                if (!message.guild) return
                if (message.channel instanceof TextChannel != true) return

                if (message.author.bot && automod.ignoreBots)
                    return logger(`❌${message.channel.name} | ${automod.name}: no bots`)
                else logger(`✅${message.channel.name} | ${automod.name}: si bots`)

                if (!automod.vscOnly && message.guild.id != "813538324320092161")
                    return logger(`❌$${message.channel.name} | ${automod.name}: no vsc`)
                else logger(`✅${message.channel.name} | ${automod.name}: si vsc`)
                return automod.execute(message, client)
            })

            //comandos de texto
            if (message.content.startsWith(config.prefix)) {
                const commands = client.messageCommands;
                const arg = message.content
                    .substring(1)
                    .split(/ +/)
                    .slice(0, 1)
                    .join("")
                    .toLowerCase();
                if (!commands.has(arg)) return
                const cmd = commands.get(arg)
                if (!cmd || !cmd.run) return
                await cmd.run(message, client, arg);
            }
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
            console.error(err);
        }
    },
};

export default module


