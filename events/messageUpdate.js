const { Events } = require('discord.js')
const antiWalltexts = require("../functions/automod/walltext");
const { prefix, ignoredChannels, backupChannel } = require("../config.json");
const antiCrypto = require('../functions/automod/antiCrypto');
const banDIscordInvite = require('../functions/automod/banDIscordInvite');
const removePhoneNumbers = require('../functions/automod/removePhoneNumbers');

module.exports = {
    name: Events.MessageUpdate,
    async execute(message, oldM) {
        antiWalltexts(message, client, ignoredChannels, backupChannel);
        removePhoneNumbers(message)
        banDIscordInvite(message, client)
        antiCrypto(message, client);
    }
}

