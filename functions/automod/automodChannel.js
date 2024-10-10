const errorLogger = require("../loggers/errorLogger");
const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../config.json");
regex =
    /(https?:\/\/)?(www\.)?(((discord(app)?)\.com\/invite)|((discord(app)?)?\.gg))\/(?<invite>.+)/gim;

module.exports = async (message) => {
    try {
        if (message.channel.id != "1055674206156750848") return;
        if (message.member.roles.cache.has("813568302294761486"))
            return message.member.timeout(null);
        const content = message.embeds[0].description;

        if (content.match(/viva\s+(maduro|chavez)/gim)) {
            let five = message.member.roles.cache.has("813546760152547348")
            let ten = message.member.roles.cache.has("813545491957940244")
            if (five || ten) return

            return await message.member.ban("decir viva maduro 😠")
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
                role = message.guild.roles.cache.find(
                    (role) => role.name === "Muted"
                );

                if (role)
                    message.member.roles
                        .add(role, "enviar spam")
                        .then(() => message.member.timeout(null));
            }
        }
        if (content.match(/steamcommunity/gim) != null) {
            await sendDM(message);
            await message.member.kick("Enviar spam");
            return;
        }
        if (content.match(/tenor\.com/gim)) return message.member.timeout(null);
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
