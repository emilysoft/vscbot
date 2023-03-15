module.exports = async (message, targetChannel) => {
    try {
        if (message.channelId != targetChannel) return;
        if (message.channel.isThread()) return;
        await message.react("👍")
        await message.react("👎")
    } catch (e) {
        errorLogger(e, message, client, "error");
    }
};
