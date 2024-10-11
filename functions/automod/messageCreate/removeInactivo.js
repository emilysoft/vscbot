import logger from "../../loggers/automodLogger.js"
import errorLogger from "../../loggers/errorLogger.js"
const module = (message) => {
    try {
        if (message.author.bot) return;
        if (message.channel.id === "1272621881543102567") {
            message.member.roles
                .remove("1272564404193460286", "rol removido por actividad")
                .then(() => {
                    message.delete();
                    let log = message.guild.channels.cache.get(
                        "1088423410905919550"
                    );
                    log.send(
                        `**${message.author.username}** ha vuelto de su inactividad ${message.author.id}`
                    );
                });
        }
    } catch (err) {
        errorLogger(err, message.client, "error", import.meta.url);
    }
};

export default module
