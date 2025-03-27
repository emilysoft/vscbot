import { ChannelType, Events, ForumChannel, Message, TextChannel } from "discord.js"
import Client from "../../classes/ICustomClient.js"
import antiTextWall from "../../functions/automod/messageCreate/antiTextWall.js"
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
//import nsfwAdviser from "../../functions/nsfwAdviser"
import deleteThatShit from "../../functions/deleteThatShit.js"
//import downloadFacebookVideo from "../../functions/downloadFacebookVideo.js"
import removeInactivo from "../../functions/automod/messageCreate/removeInactivo.js"
import badWords from "../../functions/automod/messageCreate/badWords.js"
import ia from "../../functions/automod/messageCreate/ia.js"
import newThread from "../../functions/automod/messageCreate/newThread.js"
import clearChat from "../../functions/automod/messageCreate/clearChat.js"
import rules from "../../functions/rules.js"
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"

const nsfwChannels = {
    aportes: "1013280756757430364",
    aportes2D: "942934915396288542",
    LGBT: "1230709697129091102",
    furry: "1172695535468150814",
    nube: "868499065984393308",
    galeria: "813562445729628170",
    memes: "813562363243921459",
};
const module: IEvents = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            // evita que actue sobre si mismo
            if(!client.user) return
            if (message.author.id == client.user.id) return;
            if (!message.guild || message.channel instanceof TextChannel != true) return;
            console.log(message.content)
            // automod
            antiTextWall(message, client as Client);
            banDiscordInvite(message, client as Client);
            automodChannel(message, client as Client);
            messageLogger(message, "create", client as Client);
            newThread(message);
            removeInactivo(message, client as Client);
            gb(message, client as Client);
            deleteThatShit(message, client as Client);
            deleteMee6(message, client as Client);
            deleteProbot(message, client as Client);
            badWords(message, client as Client);
            attchAviser(message, client as Client);
            clearChat(message, client as Client);
            //downloadFacebookVideo(message);
            // notsobot
            if (message.author.id == "439205512425504771") return;
            removePhoneNumbers(message, client as Client);
            //bannedWords(message, client as Client);
            //nsfwAdviser(message);
            antiCrypto(message, client as Client);
            //neetAdviser(message);

            if (message.author.bot) return;

            ia(message, client as Client);
            recomendationReactions(message, nsfwChannels.aportes, "nsfw", client as Client);
            recomendationReactions(message, nsfwChannels.aportes2D, "nsfw", client as Client);
            recomendationReactions(message, nsfwChannels.LGBT, "nsfw", client as Client);
            recomendationReactions(message, nsfwChannels.furry, "nsfw", client as Client);
            recomendationReactions(message, nsfwChannels.nube, "nsfw", client as Client);
            recomendationReactions(message, nsfwChannels.galeria, "galeria", client as Client);
            recomendationReactions(message, nsfwChannels.memes, "memes", client as Client);
            //recomendationReactions(message, nsfwChannels.test, "heart", client);
            recomendationReactions(message, "813970132191674398", "heart", client as Client); //dibujos
            recomendationReactions(message, "813562363243921459", "memes", client as Client); //shitposting
            recomendationReactions(message, "1321222701775454218", "heart", client); //24

            rules(message);
            //comandos

            if (message.content.startsWith(config.prefix)) {
                const commands = client.messageCommands;
                const arg = message.content
                    .substring(1)
                    .split(/ +/)
                    .slice(0, 1)
                    .join("")
                    .toLowerCase();
                if (!commands.has(arg)) return 
                const cmd = commands.get(arg)
                if(!cmd || !cmd.run) return
                await cmd.run(message, client, arg);
            }
        } catch (err) {
            errorLogger(err, client, "error", process.cwd() + " ");
            console.error(err);
        }
    },
};

export default module
