const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("help command"),
    async execute(message, client) {
        try {
            const { EmbedBuilder } = require("discord.js");
            const botAvatar =
                "https://cdn.discordapp.com/avatars/883827073049845801/c821a559d8df0079beb33abf9c6eeeda.png?size=96&quality=lossless";
            const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
            const exampleEmbed = new EmbedBuilder()
                .setColor("#ADD8E6")
                .setTitle(`Comandos de Bot sin Contexto`)
                .setAuthor({ name: message.author.tag, iconURL: avatarPhoto })
                .setDescription(
                    `\
                    \`>afk\`: le avisas al chat que te fuiste pal' coño. (el bot no se acuerda cuando regresas)
                    \`>gb\`: creas un globo con una imagen que adjuntes.
                    \`>ignore canal|canal id\`: ignoras un canal del automod (solo administrador)
                    \`>unignore canal|canal id\`: no ignoras un canal del automod (solo administrador)
                `
                )
                .setFooter({
                    text: `Venecos sin Contexto`,
                    iconURL: botAvatar,
                });
            await message.channel.send({ embeds: [exampleEmbed] });
        } catch (err) {
            errorLogger(err, client, "error");
        }
    },
};
