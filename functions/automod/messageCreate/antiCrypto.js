const errorLogger = require("../../loggers/errorLogger");

vscLog = require("../../loggers/automodLogger");
const lvl10 = "813546760152547348";
const lvl5 = "813545491957940244";
module.exports = (message, client) => {
    try {
        regex =
            /(\si|i)('ll|\swill)\s(help|teach)\s(the first|\w+)\s?((\S+\W+\D+)(\d{1,2}k|\$))/gim;
        if (message.content.match(regex) != null) {
            if (message.member.roles.cache.some((role) => role.id === lvl10))
                return;
            if (message.member.roles.cache.some((role) => role.id === lvl5))
                return;
            message.delete();
//            const role = message.guild.roles.cache.find(
//                (role) => role.name === "Muted"
//            );
//            if (role) {
//                message.guild.members.cache
//                    .get(message.author.id)
//                    .roles.add(role, "Enviar mensaje de scam")
//                message.channel
//                    .send(`**${message.author.tag}** muteado por enviar scam`)
//                    .then((r) => {
//                        setTimeout(() => {
//                            r.delete();
//                        }, 5000);
//                    });
//            } else {
//                throw new Error("hubo un error al encontrar elrol");
//            }

            message.member.ban({ reason: "Discord Invite spamming" });
            logger(
                message,
                client,
                "Spam de crypto",
                "ha sido baneado por enviar spam de cripto"
            );
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
