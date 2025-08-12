import { Message, Events } from "discord.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import Client from "../../interfaces/ICustomClient.js"
import client from "./../../index-vsc.js"
import config from "../../config.json" with {type: "json"}
import IEvents from "../../interfaces/iEvents.js"
import ICommand from "../../interfaces/command.js"
export default {
    name: Events.MessageUpdate,
    async execute(message: Message, oldM: Message) {
        try {
            //automod
            client.automod.forEach(automod => {
                if (automod.ignoreBots == message.author.bot) return
                if (!automod.allowEdited) return
                automod.execute(message, client)
            })
            messageLogger(message, "edit", client as Client)
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
                if (!cmd.allowEdited) return
                await cmd.run(message, client, arg);
            }
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
} as IEvents
