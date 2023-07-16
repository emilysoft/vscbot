const errorLogger = require("../functions/loggers/errorLogger");
const targetChannelID = "948782010955104376";
const text = /URL returned an empty response/gim;

module.exports = async (message, client) => {
    try {
        if (!message.author.id == "439205512425504771") return;
        if (message.embeds.length > 0) {
            let description = message.embeds[0].description;
            if (description) {
                if (description.match(text) != null) action(message);
            }
        } else if(message.content.length > 0) {
            if (message.content.match(text) != null) action(message);
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};

async function action(message) {
    const guild = message.guild;
    const targetChannel = guild.channels.cache.get(targetChannelID);
    if (message.reference) {
        await message.channel.messages
            .fetch(message.reference.messageId)
            .then((msg) => {
                targetChannel.send(
                    `<@302249242469335060> borra este tag ${msg.content}`
                );
            })
            .catch(console.error);
    }
}
