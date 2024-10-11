import errorLogger from "../../functions/loggers/errorLogger.js"
const targetChannel = "1088423410905919550";
export default async (member) => {
    try {
        const channel = member.guild.channels.cache.get(targetChannel);
        await channel.send(`${member.id}`);
    } catch (err) {
        errorLogger(err, member.client, "error", import.meta.url);
    }
};
