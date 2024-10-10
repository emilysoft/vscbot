const errorLogger = require("../../loggers/errorLogger");
module.exports = async (message, client) => {
    try {
        const { author, content } = message;
        if (
            author.id == "159985870458322944" &&
            content.match(/1023633373731766312/gim) == null &&
            message.embeds.length == 0
        ) {
            await message.delete();
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
