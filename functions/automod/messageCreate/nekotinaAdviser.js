const errorLogger = require("../../loggers/errorLogger");
const regex = /^(neko|!)/;
module.exports = async (message) => {
    try {
        if (message.author.bot) return;
        if (message.channel.id == "1112164583344443433") {
            if (message.content.match(regex) != null) {
                message.reply("Usa <#1277384727615242342> para usar nekotina.");
            }
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
