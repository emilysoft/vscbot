import { Message } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"
const nsfwChannels = {
    aportes: "1013280756757430364",
    aportes2D: "942934915396288542",
    LGBT: "1230709697129091102",
    furry: "1172695535468150814",
    nube: "868499065984393308",
    galeria: "813562445729628170",
    memes: "813562363243921459",
};

const module: Iautomod = {
    name:"recomendationReactions",
    ignoreBots: true,
    execute: function(message:Message,client:Client) {
        recomendationReactions(message, nsfwChannels.aportes, "nsfw", client as Client);
        recomendationReactions(message, nsfwChannels.aportes2D, "nsfw", client as Client);
        recomendationReactions(message, nsfwChannels.LGBT, "nsfw", client as Client);
        recomendationReactions(message, nsfwChannels.furry, "nsfw", client as Client);
        recomendationReactions(message, nsfwChannels.nube, "nsfw", client as Client);
        recomendationReactions(message, nsfwChannels.galeria, "galeria", client as Client);
        recomendationReactions(message, nsfwChannels.memes, "memes", client as Client);
        recomendationReactions(message, "813970132191674398", "heart", client as Client); //dibujos
        recomendationReactions(message, "813562363243921459", "memes", client as Client); //shitposting
        recomendationReactions(message, "1321222701775454218", "heart", client); //24
    }
} as Iautomod
async function recomendationReactions (message:Message, targetChannel:string, type:string, client:Client) {
    try {
        const attachments = message.attachments.size;  
        const isURL = message.content.match(/https/gim)
        if (message.author.bot) return;
        if (message.channel.id != targetChannel) return;
        if(attachments < 1 && !isURL) return 

        switch(type) {
            case "heart":
                await message.react("❤");
                break;
            case "memes": 
                await message.react("<:xd:1116468520885162025>");
                await message.react("<:kek:1116461713563328572>");
                break;
            case "nsfw":
                await message.react("<:smash:1328038080334270516>");
                await message.react("<:pass:1328037817816973413>");
                break;
            case "galeria":
                await message.react("<:kek:1116461713563328572>");
                await message.react("❤");
                await message.react("<:weabolike:1116479128305143902>");
                await message.react("<:wow:1116468515399012434>");
                break;
            default: 
                await message.react("👍")
                await message.react("👎");
        }
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
};
export default module
