import { Events } from "discord.js"
import antiTextWall from "../../functions/automod/messageCreate/antiTextWall.js"
import nekotinaAdviser from "../../functions/automod/messageCreate/nekotinaAdviser.js"
import automodChannel from "../../functions/automod/automodChannel.js"
import deleteMee6 from "../../functions/automod/messageCreate/deleteMee6.js"
import deleteProbot from "../../functions/automod/messageCreate/deleteProbot.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import antiCrypto from "../../functions/automod/messageCreate/antiCrypto.js"
import attchAviser from "../../functions/automod/attachmentPermissionAdviser.js"
import gb from "../../functions/gb.js"
import banDiscordInvite from "../../functions/automod/messageCreate/banDiscordInvite.js"
import recomendationReactions from "../../functions/recomendationReactions.js"
import removePhoneNumbers from "../../functions/automod/messageCreate/removePhoneNumbers.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
import config from "../../config.json" with {type:"json"}
import bannedWords from "../../functions/automod/messageCreate/bannedWords.js"
import nsfwAdviser from "../../functions/nsfwAdviser.js"
import deleteThatShit from "../../functions/deleteThatShit.js"
//import downloadFacebookVideo from "../../functions/downloadFacebookVideo.js"
import removeInactivo from "../../functions/automod/messageCreate/removeInactivo.js"
import badWords from "../../functions/automod/messageCreate/badWords.js"
import ia from "../../functions/automod/messageCreate/ia.js"
import rules from "../../functions/rules.js"
const nsfwChannels = {
    aportes: "1013280756757430364",
    aportes2D: "942934915396288542",
    LGBT: "1053118780705874040",
    furry: "1172695535468150814",
    nube: "868499065984393308",
    galeria: "813562445729628170",
    memes: "813562363243921459",
};
const module = {
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
            if (message.content.startsWith(config.prefix)) {
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

export default module
