const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
module.exports = {
    name: "avatar",
    aliases: ["av"],
    category: "Utility",
    usage: "avatar/avatar @user",
    description: "Gives avatar for message author or mentioned user.",
    botPerms: ["EmbedLinks", "ManageMessages"],
    desactivated: true,
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Gives avatar for message author or mentioned user."),
    async execute(client, message, args) {
        let user = message.mentions.users.first() || message.author;
        let embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`${user.username}'s Avatar`)
            .setDescription(
                `[Avatar Link](${user.displayAvatarURL({
                    size: 2048,
                    dynamic: true,
                    format: "png",
                })})`
            )
            .setImage(
                user.avatarURL({ size: 2048, dynamic: true, format: "png" })
            );

        message.channel.send({ embeds: [embed] });
        message.delete();
    },
};
