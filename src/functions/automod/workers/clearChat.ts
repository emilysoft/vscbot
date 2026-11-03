import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import config from "../../../config/index.js";

export default {
  name: "clearChat",
  ignoreBots: false,
  scope: "global",
  allowEdited: false,
  execute: async function (message: Message, client: Client) {
    try {
      if (!message.guild) return
      const { channel } = message
      if (!(channel instanceof TextChannel)) return
      if (message.guild.id == config.guilds.main &&
                 message.channel.id == config.channels.panaderia  ||
                 message.channel.id == config.channels.general ||
                 message.channel.id == config.channels.cienciasSociales
        ) {
        //general
        clearNSB(message, config.channels.panaderia);
        //general 2
        clearNSB(message, config.channels.general);
        clearNSB(message, config.channels.cienciasSociales);
        return
      }
      //neetoons
      if (message.guild.id == config.guilds.nsb && message.channel.id == config.channels.nsbGeneral) {
        clearNSB(message, config.channels.nsbGeneral);
      }
    } catch (err: any) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  }
} as Iautomod

async function clearNSB(message: Message, channelId: string) {
  //general
  if (message.channel.id != channelId) return;
  const { channel } = message;
  if (channel instanceof TextChannel != true) return;

  const messagesToDelete: string[] = [];
  //nekotina o nsb
  if (
    message.author.id == config.bots.notSoBot ||
    message.author.id == config.bots.nekotina
  ) {
    if (message.embeds.length == 0) return;
    if (message.reference?.messageId) {
      const repliedMsg = await message.channel.messages.fetch(
        message.reference.messageId
      );

      if (/\.\s*(caption|meme|\bi\b)/i.test(repliedMsg.content))
        return;
      messagesToDelete.push(repliedMsg.id);
    }
    messagesToDelete.push(message.id);
  }
  if (messagesToDelete.length == 0) return;

  setTimeout(async () => {
    console.log("limpiando chat")
    await channel.bulkDelete(messagesToDelete);
  }, 3 * 60 * 1000);
}

export async function clearBots(msg: Message) {
  //general
  const { channel } = msg;
  if (channel instanceof TextChannel != true) return;
  const messages = await channel.messages.fetch();
  if (!messages) return;
  const messagesToDelete = [];
  for (const [, message] of messages) {
    //nekotina o nsb
    if (
      message.author.id == config.bots.notSoBot ||
      message.author.id == config.bots.nekotina
    ) {
      messagesToDelete.push(message.id);
    }
  }

  await channel.bulkDelete(messagesToDelete);
}
export async function clearGulag(client: Client) {
  //general
  const dontdeletemsgid = config.messages.keepInGulag;
  const gulagId = config.channels.gulag;
  const guild = client.guilds.cache.get(config.guilds.main);
  if (!guild) return;
  const channel = await guild.channels.fetch(gulagId);

  if (channel instanceof TextChannel != true) return;
  let messages = await channel.messages.fetch({ limit: 1 });
  const lastMessage = messages.first();
  if (!lastMessage) return
  const haceTresDias = Date.now() - (2 * 24 * 60 * 60 * 1000)
  if (lastMessage.createdTimestamp > haceTresDias) return;
  messages = await channel.messages.fetch();
  if (!messages) return;
  const messagesToDelete = messages
    .filter((msg) => msg.id != dontdeletemsgid)
    .map((msg) => msg.id);
  console.log(messagesToDelete);
  await channel.bulkDelete(messagesToDelete);
}
