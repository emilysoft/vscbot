import { GuildMember, TextChannel } from "discord.js";
import errorLogger from "../../functions/loggers/errorLogger.js"
import Client from "../../classes/ICustomClient.js"
const targetChannel = "1088423410905919550";
export default async (member:GuildMember, client:Client) => {
    try {
        const channel = member.guild.channels.cache.get(targetChannel);
        if(channel instanceof TextChannel) 
        await channel.send(`${member.id}`);
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};
