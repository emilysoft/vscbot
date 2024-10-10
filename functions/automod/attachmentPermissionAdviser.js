const errorLogger = require("../loggers/errorLogger");
const regex =
    /(puedo|deja)\s+(pasar|enviar|mandar)\s+(unas\s+|una\s+)?(imagenes|capturas?|imagen|foto|fotos|videos|m(e|o)m(o|e)s)/gim;
module.exports = async (message) => {
    try {
        if (message.author.bot) return;
        if (message.member.roles.cache.has("813546760152547348")) return;
        if (message.member.roles.cache.has("813545491957940244")) return;
        if (message.content.match(regex) != null) {
            message.reply(
                "https://tenor.com/view/embed-fail-embed-discord-memes-no-image-perms-image-perms-flex-gif-24899732"
            );
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
