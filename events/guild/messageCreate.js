const { Events } = require("discord.js");
const antiCrypto = require("../../functions/automod/messageCreate/antiCrypto");
const mute = require("../../commands/moderation/mute");
const welcome = require("../../functions/welcome");
const help = require("../../commands/info/help");
const banDiscordInvite = require("../../functions/automod/messageCreate/banDiscordInvite");
const globo = require("../../commands/fun/globos/globo");
const recomendationReactions = require("../../functions/recomendationReactions");
const bumpReminder = require("../../functions/automod/bumpReminder");
const bumpChannelId = "813796911994896397";
const antiWalltexts = require("../../functions/automod/messageCreate/walltext");
const messageLogger = require("../../functions/loggers/messageLogger");
const say = require("../../commands/utility/say");
//const neetAdviser = require(../functions/neetAdviser");
const bcv = require("../../commands/utility/bcv");
const { prefix, ignoredChannels, backupChannel } = require("../../config.json");
const removePhoneNumbers = require("../../functions/automod/messageCreate/removePhoneNumbers");
const errorLogger = require("../../functions/loggers/errorLogger");
const { updateMorning } = require("../../timers/bcvUpdate");
const shutdown = require("../../commands/owner/shutdown");
const setRoleIcon = require("../../commands/utility/setRoleIcon");
const idToMention = require("../../commands/utility/idToMention");
const getRandomCats = require("../../commands/fun/getRandomCats");
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
                if (message.content.startsWith(">mute")) {
                    mute.execute(message);
                }
                if (message.content.startsWith(">say")) {
                    say.execute(message);
                }
                if (message.content.startsWith(">seticon")) {
                    setRoleIcon.execute(message);
                }
                if (message.content.startsWith(">bcv")) {
                    bcv.execute(message);
                }
                if (message.content.startsWith(">shutdown")) {
                    shutdown.execute(message.client, message);
                }
                if (message.content.startsWith(">help")) {
                    help.execute(message, client);
                }
                if (message.content.startsWith(">gb")) {
                    globo.execute(message);
                }
                if (message.content.startsWith(">getmention")) {
                    idToMention.execute(message);
                }
                if (message.content.startsWith(">cats")) {
                    getRandomCats.execute(message);
                }
            }
        } catch (err) {
            errorLogger(err, message.client, "error");
            console.error(e);
        }
    },
};
