import Client from "../../../classes/ICustomClient.js"
import {Message, TextChannel} from "discord.js"
import logger from "../../loggers/automodLogger.js"
import errorLogger from "../../loggers/errorLogger.js"
const lvl10 = "813546760152547348";
const lvl5 = "813545491957940244";

//const regex = /\[steamcommunity.*\]\(.*\)|(best|hot|teens?|nitro|adobe|Onlyfans).*(leaks?|teens?|nudes|girls?|giveaway|porn|gratis)/
const module = (message: Message, client:Client) => {
    try {
        if (message.author.bot) return;
        const regex = /(https?:\/\/)?(www\.)?(((discord(app)?)?\.com\/invite)|((discord(app)?)?\.gg))\/(?<invite>.+)/gim;
        if(!message.member) return
        if (message.content.match(regex) != null) {
            if (message.member.roles.cache.some((role) => role.id === lvl10))
                return;
            if (message.member.roles.cache.some((role) => role.id === lvl5))
                return;
            message.delete();
            //            message.member.ban({ reason: "Discord Invite" });
            if(!message.guild) return
            const role = message.guild.roles.cache.find(
                (role) => role.name === "Muted"
            );
            if (role) {
                const member = message.guild.members.cache.get(message.author.id)
                if(!member) return
                member.roles.add(role, "Enviar mensaje de scam");

                if(message.channel instanceof TextChannel != true) return
                message.channel
                    .send(`**${message.author.username}** muteado por enviar scam`)
                    .then((r) => {
                        setTimeout(() => {
                            r.delete();
                        }, 5000);
                    });
            } else {
                throw new Error("hubo un error al encontrar el rol");
            }

            logger(
                message,
                client,
                "Discord Invite",
                "Ha sido muteado por enviar discord invite al ser un usuario nuevo"
            );
        }
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};

export default module