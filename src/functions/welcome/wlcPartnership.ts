import partnershitpsChannels from "./partnerships.json" with {type:"json"}
import { GuildMember, TextChannel } from "discord.js";
import Client from "../../interfaces/ICustomClient.js"
const module = async (member:GuildMember, client:Client) => {
    try {
        if (member.user.bot) return;
        const guild = member.guild;

        partnershitpsChannels.forEach(async (partner) => {
            let channel = guild.channels.cache.get(partner.id);
            if(channel instanceof TextChannel != true) return
            channel
                .send(
                    `${partner.name} te da la bienvenida <@${member.user.id}>`
                )
                .then(async (msg) => await msg.delete());
        });
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
};
export default module
