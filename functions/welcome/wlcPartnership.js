const errorLogger = require("../loggers/errorLogger");
const partnershitpsChannels = require("./partnerships.json");
module.exports = async (member) => {
    try {
        if (member.user.bot) return;
        const guild = member.guild;

        partnershitpsChannels.forEach(async (partner) => {
            let channel = guild.channels.cache.get(partner.id);
            channel
                .send(
                    `${partner.name} te da la bienvenida <@${member.user.id}>`
                )
                .then((msg) => msg.delete());
        });
    } catch (err) {
        errorLogger(err, member.client, "error");
    }
};
