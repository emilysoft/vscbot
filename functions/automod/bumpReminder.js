const path = require("path");
const notifier = require("node-notifier");
const errorLogger = require("../loggers/errorLogger");
module.exports = (message, targetChannelId) => {
    try {
        if (
            message.author.id == "302050872383242240" &&
            message.channelId == targetChannelId
        ) {
            let now = new Date();
            //comprueba si son las 8
            if (now.getHours() >= 8 && now.getHours() < 20) {
                setTimeout(() => {
                    message.channel
                        .send(
                            "Ya puedes bumpear de nuevo **/bump** <@&1015669369218539641>"
                        )
                    //notifier.notify({
                    //message: "Ya puedes bumpear de nuevo",
                    //icon: path.join(__dirname, 'logo.png'),
                    //wait: true
                    //});
                }, 7200000);
            }
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
