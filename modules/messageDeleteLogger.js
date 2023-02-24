module.exports = (message, client) => {
  if (message.author.bot) return;
  if (message.channel.id == "926515205855383562") {
    const { MessageEmbed } = require("discord.js");
    const botAvatar =
      "https://cdn.discordapp.com/attachments/847580112118743071/938042216209874944/c821a559d8df0079beb33abf9c6eeeda.png";
    const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
    const exampleEmbed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle(`Mensaje borrado en ${message.channel.name}`)
      .setAuthor(message.author.tag, avatarPhoto) //,'https://discord.js.org')
      .setDescription(message.content)
      .setTimestamp()
      .setFooter(`user ID: ${message.author.id}`, botAvatar);
    const channel = client.channels.cache.find(
      (channel) => channel.id === "1058499556758786158"
    );
    channel.send({ embeds: [exampleEmbed] });
  }
};
