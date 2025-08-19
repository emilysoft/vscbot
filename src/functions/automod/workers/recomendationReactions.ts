import { Message } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"

const UNKNOWN_EMOJI_CODE = 10014;

// Definición del enum para las reacciones
enum Emoji {
    SMASH = "<:smash:1328038080334270516>",
    PASS = "<:pass:1328037817816973413>",
    XD = "<:xd:1116468520885162025>",
    KEK = "<:kek:1116461713563328572>",
    WEABOLIKE = "<:weabolike:1116479128305143902>",
    WOW = "<:wow:1116468515399012434>",
    HEART = "❤",
    THUMBS_UP = "👍",
    THUMBS_DOWN = "👎"
}

// Centraliza las IDs de los canales y las reacciones
const CHANNEL_CONFIG = {
    "1013280756757430364": [Emoji.SMASH, Emoji.PASS],
    "942934915396288542": [Emoji.SMASH, Emoji.PASS],
    "1230709697129091102": [Emoji.SMASH, Emoji.PASS],
    "1172695535468150814": [Emoji.SMASH, Emoji.PASS],
    "1391598283897573446": [Emoji.SMASH, Emoji.PASS],
    "868499065984393308": [Emoji.SMASH, Emoji.PASS],
    "813562445729628170": [Emoji.KEK, Emoji.HEART, Emoji.WEABOLIKE, Emoji.WOW],
    "813562363243921459": [Emoji.XD, Emoji.KEK],
    "813970132191674398": [Emoji.HEART],
    "1321222701775454218": [Emoji.HEART],
};

const module: Iautomod = {
    name: "recomendationReactions",
    exclusive: true,
    ignoreBots: true,
    allowEdited: false,
    execute: async function (message: Message, client: Client) {
        if (message.author.bot || (message.attachments.size < 1 && !message.content.match(/https/gim))) {
            return;
        }

        const channelId = message.channel.id;
        const reactions = CHANNEL_CONFIG[channelId as keyof typeof CHANNEL_CONFIG];

        if (reactions) {
            // Se mapean las reacciones a un array de promesas
            const promises = reactions.map(emote => message.react(emote));

            try {
                // Se ejecutan todas las promesas concurrentemente
                await Promise.all(promises);
            } catch (err: any) {
                if (err.code === UNKNOWN_EMOJI_CODE) {
                    console.error(`Error: Uno o más emojis no pudieron ser agregados. Código: ${err.code}`);
                } else {
                    console.error(`Error desconocido al reaccionar. Código: ${err.code}`);
                }
            }
        }
    }
} as Iautomod;

export default module;
