import logger from "../../loggers/automodLogger.js"
import errorLogger from "../../loggers/errorLogger.js"
const lvl10 = "813546760152547348";
const lvl5 = "813545491957940244";
const regex = /(https?:\/\/)?(www\.)?(((discord(app)?)\.com\/invite)|((discord(app)?)?\.gg))\/(?<invite>.+)/gim;
const module = async (message, client) => {
    try {
        let role;
        if (message.author.bot) return;
        if(message.author.id == "690796358579257424") return
        if(message.author.id == "302249242469335060") return
        if (message.content.match(regex) != null) {
            if (message.content.match(/promos\.discord\.gg/gim)) return;
            message.delete();
            //            message.member.ban({ reason: "Discord Invite" });
            if (
                message.content.match(
                    /(porn|teen|adobe|leaks|onlyfans|giveaway)/gim
                ) != null
            ) {
                await sendDM(message);
                return await message.member.kick("Enviar spam");
            } else {
                role = message.guild.roles.cache.find(
                    (role) => role.name === "Muted"
                );
            }

            if (role) {
                message.guild.members.cache
                    .get(message.author.id)
                    .roles.add(role, "Enviar mensaje de scam");
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

            logger(
                message,
                client,
                "Discord Invite",
                "Ha sido muteado por enviar discord invite al ser un usuario nuevo"
            );
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};

async function sendDM(message) {
    const avatarPhoto = message.member.displayAvatarURL();
    const botAvatar = message.client.user.displayAvatarURL();
    const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
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
export default module
