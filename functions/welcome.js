const errorLogger = require("./loggers/errorLogger");
module.exports = async (message) => {
    try {
        if (
            message.author.id == "282859044593598464" &&
            message.content.startsWith("**¡Bienvenido/a**")
        ) {
            message.react("👋");
            message
                .reply("<@&1049626515849084988>")
                .then((msg) => msg.delete());
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
