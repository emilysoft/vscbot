import Client from "../../../interfaces/ICustomClient.js" 
import Iautomod from "../../../interfaces/Iautomod.js" 
import {Message, TextChannel} from "discord.js"
export default {
    name:"removeInactivo",
    ignoreBots: true,
    vscOnly: true,
    execute: function(message:Message,client:Client) {
    try {
            if (message.author.bot) return;
            if (message.channel.id === "1272621881543102567") {
                if(!message.member) return
                message.member.roles
                    .remove("1272564404193460286", "rol removido por actividad")
                    .then(async () => {
                        await message.delete();
                        if(!message.guild) return
                        const log = message.guild.channels.cache.get(
                            "1088423410905919550"
                        );
                        if(log instanceof TextChannel) 
                        log.send(
                            `**${message.author.username}** ha vuelto de su inactividad ${message.author.id}`
                        );
                    });
            }
        } catch (err:any) {
            if(err.code == 10008) return
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod
