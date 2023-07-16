const errorLogger = require("./loggers/errorLogger");
const regex = /^(\.|!)[a-zA-Z]/i;
module.exports = (message) => {
    try {
        if (message.channel.id == "813564359874838558") {
            if (message.content.match(regex) != null) {
                message.reply("Usa <#1052733551893827644> para comandos.");
            }
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
