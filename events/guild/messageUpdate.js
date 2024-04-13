const { Events } = require("discord.js");
const antiTextWall = require("../../functions/automod/messageCreate/antiTextWall");
const { ignoredChannels, backupChannel } = require("../../config.json");
const antiCrypto = require("../../functions/automod/messageCreate/antiCrypto");
const banDiscordInvite = require("../../functions/automod/messageCreate/banDiscordInvite");
const removePhoneNumbers = require("../../functions/automod/messageCreate/removePhoneNumbers");
const errorLogger = require("../../functions/loggers/errorLogger");
const messageLogger = require("../../functions/loggers/messageLogger");
const deleteThatShit = require("../../functions/deleteThatShit");

module.exports = {
    name: Events.MessageUpdate,
    async execute(message, oldM) {
        try {
            client = message.client;
            antiTextWall(message, client, ignoredChannels, backupChannel);
            removePhoneNumbers(message);
            banDiscordInvite(message, client);
            antiCrypto(message, client);
            deleteThatShit(message);
            messageLogger(message, "edit")            
            if (message.content.startsWith(">cats")) {
                getRandomCats.execute(message);
            }
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};
