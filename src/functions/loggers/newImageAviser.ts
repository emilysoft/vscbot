import { Message, TextChannel } from "discord.js";
import config from "../../config/index.js";

const module = (message: Message) => {
  const size = message.attachments.size;
  const categories = [
    config.categories.general,
    config.categories.zonaGamer,
    config.categories.nsfw,
    config.categories.tickets,
  ];
  if (categories.includes(message.channel.id) && size > 0) {
    if (!message.member) return;
    if (message.member.roles.cache.has(config.roles.mediaStaff)) {
      if (!message.guild) return;
      const channel = message.guild.channels.cache.get(
        config.channels.imageLog,
      );
      if (channel instanceof TextChannel != true) return;
      channel.send(
        `<@${message.author.id}> Enviaron una archivo en <#${message.channel.id}> <@&${config.roles.mediaStaff}>`,
      );
    }
  }
};

export default module;
