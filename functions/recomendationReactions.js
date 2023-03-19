module.exports = async (message, targetChannel, nsfw) => {
    try {
        if (message.channelId != targetChannel) return;
        if (message.channel.isThread()) return;
        if (nsfw) await message.react("🔥");
        else await message.react("👍");

        await message.react("👎");
    } catch (err) {
        errorLogger(err, message, client, "error");
    }
};
