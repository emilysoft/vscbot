import { Message, Events, TextChannel } from "discord.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import Client from "../../interfaces/ICustomClient.js"
import client from "./../../index-vsc.js"
import config from "../../config/config.json" with {type: "json"}
import IEvents from "../../interfaces/iEvents.js"
export default {
  name: Events.MessageUpdate,
  async execute(message: Message) {
    try {
      const guild = message.guild
      if (!guild) return
      if (!(message.channel instanceof TextChannel)) return

      //automod
      client.automod.forEach(automod => {
        // Ignora bots si la configuración lo indica
        if (message.author.bot && automod.ignoreBots) return
        // Los automods de guild solo aplican en el servidor principal
        if (automod.scope === "guild" && guild.id !== config.guilds.main) return
        if (automod.onMessageUpdate) {
          automod.onMessageUpdate(message, client)
        }
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
