import { Message, GuildMember, TextChannel } from "discord.js";
import errorLogger from "../loggers/errorLogger.js"
import Client from "../../classes/ICustomClient.js"
export default  async (member:GuildMember, client:Client) => {
    try {
        if (member.user.bot) return;
        const guild = member.guild;
        const channel = guild.channels.cache.get("937087166645960714");
        if(channel instanceof TextChannel != true) return
        await channel
            .send(
                `${member.user.username} ha entrado al servidor <@&1049626515849084988>`
            )
            .then(async (msg:Message) => await msg.delete());
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};
