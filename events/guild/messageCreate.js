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
const { updateMorning } = require("../../timers/bcvUpdate");
const bannedWords = require("../../functions/automod/messageCreate/bannedWords");
const nsfwAdviser = require("../../functions/nsfwAdviser");

const nsfwChannels = {
    aportes: "1013280756757430364",
    aportes2D: "942934915396288542",
    LGBT: "1053118780705874040"
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
            bannedWords(message)
            nsfwAdviser(message)
            antiTextWall(message, client);
            antiCrypto(message, client);
            gb(message)
            updateMorning(message);
            recomendationReactions(message, "813553405695361105"); //sugerencias
            recomendationReactions(message, "813970132191674398"); //#dibujos
            recomendationReactions(message, "1010377354020929536"); //#sugerencias mc
            recomendationReactions(message, nsfwChannels.aportes, "nsfw");
            recomendationReactions(message, nsfwChannels.aportes2D, "nsfw");
            recomendationReactions(message, nsfwChannels.LGBT, "nsfw");
            messageLogger(message, "create");
            //neetAdviser(message);

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
