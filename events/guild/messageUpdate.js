const { Events } = require("discord.js");
const antiWalltexts = require("../../functions/automod/messageCreate/walltext");
const { ignoredChannels, backupChannel } = require("../../config.json");
const antiCrypto = require("../../functions/automod/messageCreate/antiCrypto");
const banDiscordInvite = require("../../functions/automod/messageCreate/banDiscordInvite");
const removePhoneNumbers = require("../../functions/automod/messageCreate/removePhoneNumbers");
const errorLogger = require("../../functions/loggers/errorLogger");

module.exports = {
    name: Events.MessageUpdate,
    async execute(message, oldM) {
        try {
            antiWalltexts(message, client, ignoredChannels, backupChannel);
            removePhoneNumbers(message);
            banDiscordInvite(message, client);
            antiCrypto(message, client);
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};
