import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"
import {Message, TextChannel} from "discord.js"
const lvl10 = "813546760152547348";
const lvl5 = "813545491957940244";

//const regex = /\[steamcommunity.*\]\(.*\)|(best|hot|teens?|nitro|adobe|Onlyfans).*(leaks?|teens?|nudes|girls?|giveaway|porn|gratis)/
export default {
    name:"autoKickSpam",
    vscOnly: true,
    ignoreBots: true,
    execute: async function(message:Message,client:Client) {
        try {
            const regex = /(https?:\/\/)?(www\.)?(((discord(app)?)?\.com\/invite)|((discord(app)?)?\.gg))\/(?<invite>.+)/gim;
            if(!message) return
            if(!message.member) return
            if(message.content.match(regex) != null) {
                if(!message.guild) return

                if(message.guild.id == "813538324320092161") {
                    if (message.member.roles.cache.some((role) => role.id === lvl10))
                        return;
                    if (message.member.roles.cache.some((role) => role.id === lvl5))
                        return;
                }

                await message.delete();
                const role = message.guild.roles.cache.find(
                    (role) => role.name === "Muted"
                );
                if (role) {
                    message.member.roles.add(role, "Enviar mensaje de scam");
                    if(message.channel instanceof TextChannel != true) return
                    await message.channel
                        .send(`**${message.author.username}** muteado por enviar scam`)
                        .then((r) => {
                            setTimeout(() => {
                                r.delete();
                            }, 5000);
                        });
                } else {
                    throw new Error("hubo un error al encontrar el rol");
                }

                client.automodLogger(
                    message,
                    client,
                    "Discord Invite",
                    "Ha sido muteado por enviar discord invite al ser un usuario nuevo"
                );
            }
        } catch (err:any) {
            if(err.code == 10008) return
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod