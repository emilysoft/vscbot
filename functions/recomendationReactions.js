module.exports = async (message, targetChannel, type) => {
    try {
        const attachments = message.attachments.size;  
        const isURL = message.content.match(/https/gim)

        if (message.channelId != targetChannel) return;
        if (message.channel.isThread()) return;
        if(attachments < 1 && !isURL) return 

        switch(type) {
            case "heart": 
                await message.react("❤");
                break;
            case "memes": 
                await message.react("<:xd:1116468520885162025>");
                await message.react("<:kek:1116461713563328572>");
                break;
            case "galeria":
                await message.react("<:weabolike:1116479128305143902>");
                await message.react("<:kek:1116461713563328572>");
                await message.react("<:wow:1116468515399012434>");
                await message.react("<:gatoSad:1116462047815798886>");
                break;
            default: 
                await message.react("👍")
                await message.react("👎");
        }
    } catch (err) {
        errorLogger(err, message, client, "error");
    }
};
