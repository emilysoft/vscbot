import { ColorResolvable, Message, EmbedBuilder } from "discord.js"
import config from "../../../config.json" with {type:"json"}
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"
const regex = /(https?:\/\/)?(www\.)?(((discord(app)?)\.com\/invite)|((discord(app)?)?\.gg))\/(?<invite>.+)/gim;

export default {
    name:"automodChannel",
    ignoreBots: true,
    execute: async function(message:Message,client:Client) {
        try {
            if (message.channel.id != "1055674206156750848") return;
            if(!message.member) return
            if (message.member.roles.cache.has("813568302294761486"))
                return message.member.timeout(null);
            const content = message.embeds[0].description;
            if(!content) return
            if (content.match(/viva\s+(maduro|chavez)/gim)) {
                let five = message.member.roles.cache.has("813546760152547348")
                let ten = message.member.roles.cache.has("813545491957940244")
                if (five || ten) return

                return await message.member.ban({reason:"decir viva maduro 😠"})
            }
            else if(content.match(regex) != null) {
                if (content.match(/promos\.discord\.gg/gim)) return;
                if (
                    content.match(/(porn|teen|adobe|leaks|onlyfans|giveaway)/gim) !=
                    null
                ) {
                    await sendDM(message);
                    return await message.member.kick("Enviar spam");
                } else {
                    if(!message.guild) return
                    const role = message.guild.roles.cache.find(
                        (role) => role.name === "Muted"
                    );

                    if (role)
                        message.member.roles
                            .add(role, "enviar spam")
                            .then(() => {
                                if(!message.member) return 
                                message.member.timeout(null)
                            });
                }
            }
            if (content.match(/steamcommunity/gim) != null) {
                await sendDM(message);
                await message.member.kick("Enviar spam");
                return;
            }
            if (content.match(/tenor\.com/gim)) return message.member.timeout(null);
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod


async function sendDM(message:Message) {
    if(!message.member) return
    const avatarPhoto = message.member.displayAvatarURL();
    const botAvatar = message.client.user.displayAvatarURL();
    const embed = new EmbedBuilder()
        .setColor(config.EMBED_COLOR as ColorResolvable)
        .setTitle(message.author.username)
        .setDescription(
            `Has sido kickeado porque tu cuenta ha sido hackeada para spamear, cambia la contraseña y regresa de nuevo.`
        )
        .setAuthor({
            name: message.author.username,
            iconURL: avatarPhoto,
        })
        .setTimestamp()
        .setFooter({
            text: `Venecos sin Contexto | https://discord.gg/venezuela`,
            iconURL: botAvatar,
        });
    await message.member.user.createDM().then((dm) => {
        dm.send({
            embeds: [embed],
        });
    });
}