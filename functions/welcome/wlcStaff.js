import errorLogger from "../loggers/errorLogger.js"
export default  async (member) => {
    try {
        if (member.user.bot) return;
        const guild = member.guild;
        const channel = guild.channels.cache.get("937087166645960714");
        await channel
            .send(
                `${member.user.username} ha entrado al servidor <@&1049626515849084988>`
            )
            .then((msg) => msg.delete());
    } catch (err) {
        errorLogger(err, member.client, "error");
    }
};
