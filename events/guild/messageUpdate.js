import { Events } from "discord.js"
import antiTextWall from "../../functions/automod/messageCreate/antiTextWall.js"
import  config from "../../config.json" with {type:"json"}
import antiCrypto from "../../functions/automod/messageCreate/antiCrypto.js"
import banDiscordInvite from "../../functions/automod/messageCreate/banDiscordInvite.js"
import removePhoneNumbers from "../../functions/automod/messageCreate/removePhoneNumbers.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import deleteThatShit from "../../functions/deleteThatShit.js"

const module = {
    name: Events.MessageUpdate,
    async execute(message, oldM) {
        try {
            const client = message.client;
            antiTextWall(message, client, config.ignoredChannels, config.backupChannel);
            removePhoneNumbers(message);
            banDiscordInvite(message, client);
            antiCrypto(message, client);
            deleteThatShit(message);
            messageLogger(message, "edit")            
            if (message.content.startsWith(">cats")) {
                getRandomCats.execute(message);
            }
        } catch (err) {
            errorLogger(err, message.client, "error", import.meta.url);
        }
    },
};

export default module
