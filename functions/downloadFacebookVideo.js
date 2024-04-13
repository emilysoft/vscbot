const { spawn } = require("child_process");
const errorLogger = require("./loggers/errorLogger");
var statu = 0;
module.exports = (message) => {
    try {
        if (message.content.match(/^>\s*dl/)) {
            message.channel.sendTyping();
            let msg = "ya hay un comando ejecutandose";
            if (statu == 1)
                return message.reply(msg).catch((err) => {
                    if (err.code == 50035) message.channel.send(msg);
                });
            const regex = /https:\/\/(www\.)?facebook\.com/;
            if (message.content.match(regex)) {
                statu = 1;
                const arg = message.content.split(/\s+/)[1];
                const comando = spawn("C:/Users/Neet/AppData/Local/Programs/Python/Python311/Scripts/facebook_downloader.exe", [arg]);
                comando.stdout.on("data", (data) => {
                    statu = 0;
                    const result = data.toString();
                    if (result.includes("error")) {
                        let msg = {
                            content: `Hubo un error, intente de nuevo.`,
                            allowedMentions: { repliedUser: false },
                        };
                        message.reply(msg).catch((err) => {
                            if (err == 50035) message.channel.send(msg);
                        });
                    } else {
                        let msg = {
                            content: `[Descargar](${result})`,
                            allowedMentions: { repliedUser: false },
                        };
                        message.reply(msg).catch((err) => {
                            if (err.code == 50035) message.channel.send(msg);
                        });
                    }
                });
            } else {
                let msg = {
                    content: "inserte un link de facebook",
                    allowedMentions: { repliedUser: false },
                };
                message.reply(msg).catch((err) => {
                    if (err.code == 50035) message.channel.send(msg);
                });
            }
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
