import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import { Message, TextChannel } from "discord.js";
import config from "../../../config/index.js";
export default {
  name: "removeInactivo",
  ignoreBots: true,
  scope: "guild",
  execute: function (message: Message, client: Client) {
    try {
      if (message.author.bot) return;
      if (message.channel.id === config.channels.inactive) {
        if (!message.member) return;
        message.member.roles
          .remove(config.roles.inactive, "rol removido por actividad")
          .then(async () => {
            message.delete().catch(() => null);
            if (!message.guild) return;
            const log = message.guild.channels.cache.get(config.channels.memberLog);
            if (log instanceof TextChannel)
              log.send(
                `**${message.author.username}** ha vuelto de su inactividad ${message.author.id}`,
              );
          });
      }
    } catch (err: any) {
      if (err.code == 10008) return;
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  },
} as Iautomod;
