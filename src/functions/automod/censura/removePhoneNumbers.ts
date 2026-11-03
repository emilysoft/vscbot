import isNumberInMessage from "../../lib/isNumberInMessage.js";
import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import config from "../../../config/index.js";

const inmunidad = [
  config.roles.outOfContext,
  config.roles.moderacion,
  config.roles.silenced,
  config.roles.muted,
];

export default {
  name: "removePhoneNumbers",
  scope: "guild",
  ignoreBots: true,
  execute: async function (message: Message, client: Client) {
    if (message.channel instanceof TextChannel != true) return;
    if (message.author.id == config.bots.notSoBot) return; // posiblemente es nsb
    if (message.channel.parentId === config.categories.administracion) return; //administracion
    if (message.channel.parentId === config.categories.registro) return; // registro
    if (message.channel.parentId === config.categories.extralaborales) return; //extralaborales

    if (isNumberInMessage(message)) {
      try {
        for (const roleId of inmunidad) {
          if (!message.member) return;
          if (message.member.roles.cache.some((role) => role.id === roleId))
            return;
        }
        await message.delete().catch(() => null);
        if (!message.guild) return;
        if (!message.member) return;
        const muted = message.guild.roles.cache.find(
          (role) => role.name === "Muted",
        );
        if (muted) {
          message.member.roles.add(muted, "Enviar un numero de teléfono");
        } else {
          message.member.timeout(
            6 * 24 * 60 * 60 * 1000,
            "Pasar un numero de telefono",
          );
        }

        client.automodLogger(
          message,
          client,
          "Número de teléfono",
          "ha sido muteado por enviar un posible numero de teléfono",
        );
      } catch (err: any) {
        if (err.code == 10008) return;
        client.errorLogger(err, client, "error", process.cwd() + " ");
      }
    }
  },
} as Iautomod;
