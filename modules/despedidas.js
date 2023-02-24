module.exports = (member, client) => {
  const guild = client.guilds.cache.find((g) => g.id === "813538324320092161");
  const channel = guild.channels.cache.find(
    (c) => c.id === "1067289761401798696"
  );
  const { EmbedBuilder } = require("discord.js");
  const botAvatar =
    "https://cdn.discordapp.com/avatars/883827073049845801/c821a559d8df0079beb33abf9c6eeeda.png?size=96&quality=lossless";
  const avatarPhoto = `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`;
  const exampleEmbed = new EmbedBuilder()
    .setColor("#ec89ee")
    .setTitle(`${member.user.username} se fue pipipipipipi`)
    .setAuthor({ name: member.user.tag, iconURL: avatarPhoto })
    //        .setDescription(``)
    // .addField('Inline field title', 'Some value here', true)
    .setImage(
      "https://media.discordapp.net/attachments/813538324320092164/1067283461632692354/caption.gif?width=451&height=434"
    )
    ///		.setTimestamp()
    .setFooter({ text: `Venecos sin Contexto`, iconURL: botAvatar });
  channel.send({ embeds: [exampleEmbed] });
};
