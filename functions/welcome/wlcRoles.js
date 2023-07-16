const errorLogger = require("../loggers/errorLogger");
module.exports = async (member) => {
    try {
        if (member.user.bot) return;
        const guild = member.guild;
        const channel = guild.channels.cache.get("1023581241334833203");
        await channel
            .send(`Hey! escoge tus roles aquí <@${member.user.id}>`)
            .then((msg) => msg.delete());
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
