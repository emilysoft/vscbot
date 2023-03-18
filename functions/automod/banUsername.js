const automodLogger = require("../loggers/automodLogger");
const errorLogger = require("../loggers/errorLogger");
module.exports = (user, client) => {
    try {
        regex = {
            discordInvite:
                /(https?:\/\/)?(www\.)?(((discord(app)?)?\.com\/invite)|((discord(app)?)?\.?gg))\/(?<invite>.+)/gi,
            bio: /^(((a|@)+br(3|e)|m(i|y|!|¡)+ra+)\s+m(i|y)+\s+(la\s+)?)?((v|b)+(i|y|!|¡)+(o|0)|p+(e|3)+r+f+(i|y|!|¡)+l+)/gi,
            adrian: /^Adrian2000$/gi,
            sambox: /^sambox$/gi,
        };
        for (let ex in regex) {
            if (user.usename.match(regex[ex]) != null) {
                user.member.ban({
                    reason: "Usuario ya baneado o apodo con invite",
                });
                automodLogger(
                    message,
                    client,
                    "Usuario baneado",
                    "Usuario ya baneado o apodo con invite"
                );
                break;
            }
        }
    } catch (err) {
        errorLogger(err, client, "error");
    }
};