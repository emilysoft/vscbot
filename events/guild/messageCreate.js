const { Events } = require("discord.js");
const antiWalltexts = require("../../functions/automod/messageCreate/walltext");
const messageLogger = require("../../functions/loggers/messageLogger");
const antiCrypto = require("../../functions/automod/messageCreate/antiCrypto");
const welcome = require("../../functions/welcome");
const banDiscordInvite = require("../../functions/automod/messageCreate/banDiscordInvite");
const recomendationReactions = require("../../functions/recomendationReactions");
const bumpReminder = require("../../functions/automod/bumpReminder");
const removePhoneNumbers = require("../../functions/automod/messageCreate/removePhoneNumbers");
const errorLogger = require("../../functions/loggers/errorLogger");
const bumpChannelId = "813796911994896397";
//const neetAdviser = require(../functions/neetAdviser");
const { prefix, ignoredChannels, backupChannel } = require("../../config.json");
const { updateMorning } = require("../../timers/bcvUpdate");

const nsfwChannels = {
    aportes: "1013280756757430364",
    aportes2D: "942934915396288542",
    LGBT: "1053118780705874040",
};
module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            const client = message.client;
            if (!message.guild || message.channel.type === "dm") return;
            if (message.channel.id == "1017765691115446363") return; // server-log
            if (message.channel.id == "1036627246657577041") return; // consola
            if (message.channel.id == "821067797157118013") return; // mudae

            // automod
            removePhoneNumbers(message);
            banDiscordInvite(message, client);
            antiWalltexts(message, client, ignoredChannels, backupChannel);
            antiCrypto(message, client);
            welcome(message);
            bumpReminder(message, bumpChannelId);
            updateMorning(message);
            recomendationReactions(message, "813553405695361105");
            recomendationReactions(message, nsfwChannels.aportes, "nsfw");
            recomendationReactions(message, nsfwChannels.aportes2D, "nsfw");
            recomendationReactions(message, nsfwChannels.LGBT, "nsfw");
            messageLogger(message, "create");
            //  neetAdviser(message);

            //comandos
            if (message.content.startsWith(prefix)) {
                const commands = message.client.messageCommands;
                const arg = message.content
                    .substring(1)
                    .split(/ +/)
                    .slice(0, 1)
                    .join("")
                    .toLowerCase();
                if (commands.has(arg)) commands.get(arg)(message);
            }
        } catch (err) {
            errorLogger(err, message.client, "error");
            console.error(err);
        }
    },
};
