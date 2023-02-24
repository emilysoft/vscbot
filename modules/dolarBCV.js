const { WebhookClient, EmbedBuilder } = require("discord.js");
const Axios = require("axios");
const webhookClient = new WebhookClient({
  url: "https://discord.com/api/webhooks/id/token",
});
module.exports = () => {
  Axios.get("https://s3.amazonaws.com/dolartoday/data.json")
    .then(({ data }) => {
      let exampleEmbed = new EmbedBuilder()
        .setColor("#ADD8E6")
        .setTitle(`Precio`)
        .setAuthor(message.author.tag, avatarPhoto) //,'https://discord.js.org')
        .setDescription(`${description} En <#${message.channelId}>`)
        //.addField('Inline field title', 'Some value here', true)
        //.setImage(avatarPhoto)
        .setTimestamp()
        .setFooter(`user ID: ${message.author.id}`, botAvatar);
      const channel = client.channels.cache.find(
        (channel) => channel.id === logChannelId
      );
      channel.send({ embeds: [exampleEmbed] });
    })
    .catch((err) => {
      console.log(err);
    });
};
