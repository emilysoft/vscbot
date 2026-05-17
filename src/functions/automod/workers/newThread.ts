import { Message, Role, TextChannel } from "discord.js";
import vscChannels from "../../..//config/vsc_channels.json" with { type: "json" };
import Iautomod from "../../../interfaces/Iautomod.js";
import Client from "../../../interfaces/ICustomClient.js";
const linkRegex =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const intentos = new Map();
export default {
  name: "newThread",
  scope: "guild",
  ignoreBots: true,
  allowEdited: false,
  execute: async function (message: Message, client: Client) {
    try {
      //if (message.type === 21 || message.type === 18) return  //  threadStarterMessage || // threadCreated
      if (message.channel instanceof TextChannel != true) return;
      const channelOptions = vscChannels.find(
        (channel) => channel.id == message.channel.id,
      );
      if (!channelOptions) return;
      if (channelOptions.fileRequired) {
        if (!message.guild) return;
        const muted: Role | undefined = message.guild.roles.cache.find(
          (role) => role.name === "Muted",
        );
        if (
          message.attachments.size < 1 &&
          message.content.match(linkRegex) == null
        ) {
          await message.delete().catch(() => null);
          if (intentos.get(message.author.id) === 2) {
            if (!message.member) return;
            if (!muted) return;
            message.member.roles
              .add(muted, `usar mal el canal <#${message.channel.id}>`)
              .then(() => intentos);
            intentos.delete(message.author.id);
          }

          if (intentos.get(message.author.id) === undefined) {
            intentos.set(message.author.id, 1);
          } else {
            let tries = intentos.get(message.author.id);
            intentos.set(message.author.id, ++tries);
          }

          return message.channel
            .send(
              `<@${message.author.id}> No has enviado un archivo o link de descarga.`,
            )
            .then((msg) => setTimeout(() => msg.delete(), 5 * 1000));
        }
      } else {
        if (message.reference) {
          await message.delete().catch(() => null);
          return message.channel
            .send(`<@${message.author.id}> Responde en el hilo del mensaje`)
            .then((msg) => setTimeout(() => msg.delete(), 5 * 1000));
        }
      }
      if (channelOptions.thread) {
        message.startThread({
          name: message.author.username,
          reason: "Comienzo del hilo",
        });
      }
    } catch (err) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
      console.log(err);
    }
  },
} as Iautomod;
