const { Events } = require("discord.js");
const errorLogger = require("../../functions/loggers/errorLogger");
const targetChannel = "1088423410905919550";
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const channel = member.guild.channels.cache.get(targetChannel);
            await channel.send(`${member.id}`);
        } catch (err) {
            errorLogger(err, member.client, "error");
        }
    },
};