const errorLogger = require("../../loggers/errorLogger");
const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../../config.json");
const path = require("path");
const { writeFile } = require("fs/promises");

module.exports = async message => {
  try {
    if (message.author.bot) return;
    if (message.channel.id == "1024260771326197781") return;

    let attachments = [];
    message.attachments.forEach(attach => attachments.push(attach.url));

    if (attachments.length > 0) {
      const avatarPhoto = await message.member.displayAvatarURL();
      const botAvatar = message.client.user.displayAvatarURL();
      const botsChannel = message.guild.channels.cache.find(
        channel => channel.id === "1276395542548582422"
      );

      let embeds = [];
      attachments.forEach(async (url, i) => {
        if (
          url.endsWith(".jpg") ||
          url.endsWith(".png") ||
          url.endsWith(".jpeg")
        ) {
          embeds.push(
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setTitle(message.author.username)
              .setDescription(
                `**Message sent by <@${message.author
                  .id}> deleted in <#${message.channel.id}>**`
              )
              .setAuthor({
                name: message.author.username,
                iconURL: avatarPhoto,
              })
              .setImage(url)
              .setTimestamp()
              .setFooter({
                text: `author: ${message.author
                  .id} | Message ID: ${message.id}`,
                iconURL: botAvatar,
              })
          );
      botsChannel.send(
        {
            embeds,
      });
        } else if (url.endsWith(".mp4")) {
          await fetch(url)
            .then(x => x.arrayBuffer())
            .then(x =>
              writeFile(path.join(__dirname + i + ".mp4"), Buffer.from(x))
            );
          embeds.push(
            new EmbedBuilder()
                .
              .setColor(EMBED_COLOR)
              .setTitle(message.author.username)
              .setDescription(
                `**Message sent by <@${message.author
                  .id}> deleted in <#${message.channel.id}>** ${url}`
              )
              .setAuthor({
                name: message.author.username,
                iconURL: avatarPhoto,
              })
              .setTimestamp()
              .setFooter({
                text: `author: ${message.author
                  .id} | Message ID: ${message.id}`,
                iconURL: botAvatar,
              })
          );
      botsChannel.send(
        {
            files: [
                path.join(__dirname + i + ".mp4")
            ]
      });
        }
      });


    }
  } catch (err) {
    errorLogger(err, message.client, "error");
  }
};



function images(attachments) {

}

function videos(attachments) {

}