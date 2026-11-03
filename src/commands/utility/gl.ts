import { SlashCommandBuilder, Message, TextChannel } from "discord.js";
import ICommand from "../../interfaces/command.js";
import Client from "../../interfaces/ICustomClient.js";
import config from "../../config/index.js";

const GENERAL_1 = config.roles.general1;
const GENERAL_2 = config.roles.general2;
const GENERAL_CHANNEL_1 = config.channels.panaderia;
const GENERAL_CHANNEL_2 = config.channels.general;
const module: ICommand = {
  name: "gl",
  description: "cambia de general",
  data: new SlashCommandBuilder()
    .setName("gl")
    .setDescription("cambiar de general"),
  cooldown: 1,
  slashCommand: false,
  allowEdited: false,
  messageCommand: false,
  async run(message: Message, client: Client) {
    try {
      await message.delete().catch(() => null);
      let channel;
      const member = message.member;
      if (!member) return;
      if (member.roles.cache.has(GENERAL_1)) {
        await member.roles.remove(GENERAL_1);
        await member.roles.add(GENERAL_2);
        channel = message.client.channels.cache.get(GENERAL_CHANNEL_2);
      } else if (member.roles.cache.has(GENERAL_2)) {
        await member.roles.remove(GENERAL_2);
        await member.roles.add(GENERAL_1);
        channel = message.client.channels.cache.get(GENERAL_CHANNEL_1);
      } else {
        await member.roles.add(GENERAL_2);
      }
      if (channel instanceof TextChannel != true) return;
      await channel.send(`<@${message.author.id}>`).then((msg) => msg.delete());
    } catch (err) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  },
};

export default module;
