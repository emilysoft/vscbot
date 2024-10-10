const errorLogger = require("../../loggers/errorLogger");
module.exports = async (message, client) => {
    try {
        const { author, content } = message;
        if (author.id != "282859044593598464") return;
        if(message.channel.id == "813538324320092164") return
        if(content.match(/virgo/gim) != null)
        {
            setTimeout(async () => {
                await message.delete();
            }, 3500)
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
