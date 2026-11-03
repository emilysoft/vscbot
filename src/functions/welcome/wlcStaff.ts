import { Message, GuildMember, TextChannel } from "discord.js";
import Client from "../../interfaces/ICustomClient.js"
import config from "../../config/index.js"
export default  async (member:GuildMember, client:Client) => {
  try {
    if (member.user.bot) return;
    const guild = member.guild;
    const channel = guild.channels.cache.get(config.channels.bienvenida);
    if(channel instanceof TextChannel != true) return
    await channel
      .send(
        `${member.user.username} ha entrado al servidor <@&${config.roles.staff}>`
      )
      .then(async (msg:Message) => await msg.delete());
  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
};
