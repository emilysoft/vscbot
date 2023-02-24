module.exports = (client, invite) => {
  if (invite.inviter.bot) return;
  const { EmbedBuilder } = require("discord.js");
  const logChannelId = "1018749794736414720";
  const botAvatar =
    "https://cdn.discordapp.com/attachments/948782010955104376/1018753972091232336/c821a559d8df0079beb33abf9c6eeeda.png";
  const exampleEmbed = new EmbedBuilder()
    .setColor("#ADD8E6")
    .setTitle(`Invitación creada`)
    .setAuthor({ name: invite.inviter.tag, iconURL: invite.avatar }) //,'https://discord.js.org')
    .setDescription(
      `<@${invite.inviter.id}> creó una invitación en <#${invite.channel.id}>`
    )
    // .addField('Inline field title', 'Some value here', true)
    .setTimestamp()
    .setFooter({ text: `user ID: ${invite.inviter.id}`, iconURL: botAvatar });
  const channel = client.channels.cache.find(
    (channel) => channel.id === logChannelId
  );
  channel.send({ embeds: [exampleEmbed] });
};
