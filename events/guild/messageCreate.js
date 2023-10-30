const { Events } = require("discord.js");
const antiTextWall = require("../../functions/automod/messageCreate/antiTextWall");
const messageLogger = require("../../functions/loggers/messageLogger");
const antiCrypto = require("../../functions/automod/messageCreate/antiCrypto");
const gb = require("../../functions/gb");
const banDiscordInvite = require("../../functions/automod/messageCreate/banDiscordInvite");
const recomendationReactions = require("../../functions/recomendationReactions");
const removePhoneNumbers = require("../../functions/automod/messageCreate/removePhoneNumbers");
const errorLogger = require("../../functions/loggers/errorLogger");
//const neetAdviser = require(../functions/neetAdviser");
const { prefix } = require("../../config.json");
const bannedWords = require("../../functions/automod/messageCreate/bannedWords");
const nsfwAdviser = require("../../functions/nsfwAdviser");

const nsfwChannels = {
    aportes: "1013280756757430364",
    aportes2D: "942934915396288542",
    LGBT: "1053118780705874040",
};
module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            const { client } = message;
            // evita que actue sobre si mismo
            if (message.author.id == client.user.id) return;

            if (!message.guild || message.channel.type === "dm") return;

            // automod
            antiTextWall(message, client);
            banDiscordInvite(message, client);
            messageLogger(message, "create");
            gb(message);

            // notsobot
            if (message.author.id == "439205512425504771") return;
            removePhoneNumbers(message);
            bannedWords(message);
            nsfwAdviser(message);
            antiCrypto(message, client);
            //neetAdviser(message);

            if (message.author.bot) return;

            recomendationReactions(message, nsfwChannels.aportes, "nsfw");
            recomendationReactions(message, nsfwChannels.aportes2D, "nsfw");
            recomendationReactions(message, nsfwChannels.LGBT, "nsfw");

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
