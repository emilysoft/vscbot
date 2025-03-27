import {EmbedBuilder, ColorResolvable, Message, TextChannel} from "discord.js"
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"
import config from "../../../config.json"with {type:"json"}

export default {
    name:"banDiscordInvite",
    ignoreBots: true,
    execute: async function(message:Message,client:Client) {
        try {
            let role;
            if(message.author.id == "690796358579257424") return
            if(message.author.id == "302249242469335060") return
            const regex = /(https?:\/\/)?(www\.)?(((discord(app)?)\.com\/invite)|((discord(app)?)\.gg))/gim;
            if (message.content.match(regex) != null) {
                if (message.content.match(/promos\.discord\.gg/gim)) return;
                await message.delete();
                //            message.member.ban({ reason: "Discord Invite" });
                if (
                    message.content.match(
                        /(porn|teen|adobe|leaks|onlyfans|giveaway)/gim
                    ) != null
                ) {
                    await sendDM(message);
                    if(!message.member) return
                    return await message.member.kick("Enviar spam");
                } else {
                    if(!message.guild) return
                    role = message.guild.roles.cache.find(
                        (role) => role.name === "Muted"
                    );
                }

                if (role) {
                    const member = message.guild.members.cache.get(message.author.id)
                    if(!member) return
                    member.roles.add(role, "Enviar mensaje de scam");
                    if(message.channel instanceof TextChannel != true) return
                    message.channel
                        .send(
                            `**${message.author.username}** muteado por enviar scam`
                        )
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
