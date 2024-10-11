import nsfwCommands from "./nsfwCommands.json" with {type:"json"}
import errorLogger from "./loggers/errorLogger.js"
const module = (message) => {
    try {
        if (message.channel.id == "813564359874838558") {
            nsfwCommands.forEach((cmd) => {
                let regex = new RegExp(`^!\\s*${cmd}`);
                if (message.content.match(regex) != null) {
                    message.reply("Usa <#1052733551893827644> para comandos.");
                }
            });
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};

export default module
