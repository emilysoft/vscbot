const { Events } = require("discord.js");
const antiTextWall = require("../../functions/automod/messageCreate/antiTextWall");
const nekotinaAdviser = require("../../functions/automod/messageCreate/nekotinaAdviser");
const automodChannel = require("../../functions/automod/automodChannel");
const deleteMee6 = require("../../functions/automod/messageCreate/deleteMee6");
const deleteProbot = require("../../functions/automod/messageCreate/deleteProbot");
const messageLogger = require("../../functions/loggers/messageLogger");
const antiCrypto = require("../../functions/automod/messageCreate/antiCrypto");
const attchAviser = require("../../functions/automod/attachmentPermissionAdviser");
const gb = require("../../functions/gb");
const banDiscordInvite = require("../../functions/automod/messageCreate/banDiscordInvite");
const recomendationReactions = require("../../functions/recomendationReactions");
const removePhoneNumbers = require("../../functions/automod/messageCreate/removePhoneNumbers");
const errorLogger = require("../../functions/loggers/errorLogger");
//const neetAdviser = require(../functions/neetAdviser");
const { prefix } = require("../../config.json");
const bannedWords = require("../../functions/automod/messageCreate/bannedWords");
const nsfwAdviser = require("../../functions/nsfwAdviser");
const deleteThatShit = require("../../functions/deleteThatShit");
const downloadFacebookVideo = require("../../functions/downloadFacebookVideo");
const removeInactivo = require("../../functions/automod/messageCreate/removeInactivo");
const badWords = require("../../functions/automod/messageCreate/badWords");
const ia = require("../../functions/automod/messageCreate/ia");
const rules = require("../../functions/rules");
const nsfwChannels = {
    aportes: "1013280756757430364",
    aportes2D: "942934915396288542",
    LGBT: "1053118780705874040",
    furry: "1172695535468150814",
    nube: "868499065984393308",
    galeria: "813562445729628170",
    memes: "813562363243921459",
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
            automodChannel(message);
            messageLogger(message, "create");
            removeInactivo(message);
            gb(message);
            deleteThatShit(message);
            deleteMee6(message);
            deleteProbot(message);
            badWords(message);
            attchAviser(message);
            nekotinaAdviser(message);
            //downloadFacebookVideo(message);

            // notsobot
            if (message.author.id == "439205512425504771") return;
            removePhoneNumbers(message);
            bannedWords(message);
            //nsfwAdviser(message);
            antiCrypto(message, client);
            //neetAdviser(message);

            if (message.author.bot) return;

            ia(message);
            recomendationReactions(message, nsfwChannels.aportes, "heart");
            recomendationReactions(message, nsfwChannels.aportes2D, "heart");
            recomendationReactions(message, nsfwChannels.LGBT, "heart");
            recomendationReactions(message, nsfwChannels.furry, "heart");
            recomendationReactions(message, nsfwChannels.nube, "heart");
            recomendationReactions(message, nsfwChannels.galeria, "galeria");
            recomendationReactions(message, nsfwChannels.memes, "memes");
            recomendationReactions(message, nsfwChannels.test, "heart");
            recomendationReactions(message, "813970132191674398", "heart"); //dibujos
            recomendationReactions(message, "813562363243921459", "memes"); //shitposting

            rules(message);
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
