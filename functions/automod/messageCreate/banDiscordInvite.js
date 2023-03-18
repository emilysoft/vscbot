const logger = require("../../loggers/automodLogger");
const errorLogger = require("../../loggers/errorLogger");
const lvl10 = "813546760152547348";
const lvl5 = "813545491957940244";
module.exports = (message, client) => {
    try { 
        if (message.author.bot) return;
        regex =
            /(https?:\/\/)?(www\.)?(((discord(app)?)?\.com\/invite)|((discord(app)?)?\.gg))\/(?<invite>.+)/gim;
        if (message.content.match(regex) != null) {
            if (message.member.roles.cache.some((role) => role.id === lvl10))
                return;
            if (message.member.roles.cache.some((role) => role.id === lvl5)) return;
            message.delete();
            message.member.ban({ reason: "Discord Invite" });

            logger(
                message,
                client,
                "Discord Invite",
                "Ha sido baneado por enviar discord invite al ser un usuario nuevo"
            );
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
