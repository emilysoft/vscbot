import { Message, Events } from "discord.js"
import antiTextWall from "../../functions/automod/messageCreate/antiTextWall.js"
import antiCrypto from "../../functions/automod/messageCreate/antiCrypto.js"
import banDiscordInvite from "../../functions/automod/messageCreate/banDiscordInvite.js"
import removePhoneNumbers from "../../functions/automod/messageCreate/removePhoneNumbers.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import deleteThatShit from "../../functions/deleteThatShit.js"
import Client from "../../classes/ICustomClient.js"
import client from "./../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
const module: IEvents = {
    name: Events.MessageUpdate,
    async execute(message: Message, oldM: Message) {
        try {
            antiTextWall(message, client as Client);
            removePhoneNumbers(message, client as Client);
            banDiscordInvite(message, client as Client);
            antiCrypto(message, client as Client);
            deleteThatShit(message, client as Client);
            messageLogger(message, "edit", client as Client)            
        } catch (err) {
            errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};

export default module
