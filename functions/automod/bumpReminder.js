const errorLogger = require("../loggers/errorLogger");
module.exports = (message, targetChannelId) => {
    try {
        if (
            message.author.id == "302050872383242240" &&
            message.channelId == targetChannelId
        ) {
            let now = new Date();
            let hour = now.getHours();
            let day = now.getDate();

            // de domingo a viernes de 8pm a 10pm
            if (day < 6 && hour >= 8 && hour < 20) bump(message);
            // los sábados
            else if (hour >= 8 && hour < 15) bump(message);
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
function bump(message) {
    setTimeout(() => {
        message.channel.send(
            "Ya puedes bumpear de nuevo **/bump** <@&1015669369218539641>"
        );
    }, 2 * 60 * 60 * 1000);
}
