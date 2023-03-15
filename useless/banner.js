const { token } = require("../config");
const { MessageEmbed } = require("discord.js");
const axios = require("axios");
module.exports = async (message) => {
  let userId = message.author.id;
  let args = message.content.substring(">".length).split(" ").slice(1);
  let user = message.mentions.users.first() || { id: args[0] };
  console.log(user.id);
  if (user.id == undefined) {
    user = { id: userId };
    console.log(user.userId);
  }
  //  if(typeof(user) !== 'object')  user = { id:args[0] }

  //      let user2 = server.members.cache.get(args[0]).then(member => console.log(member))
  axios
    .get(`https://discord.com/api/users/${user.id}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    })
    .then((res) => {
      let { banner } = res.data;
      if (banner) {
        let extension = banner.startsWith("a") ? ".gif" : ".png";
        let url = `https://cdn.discordapp.com/banners/${user.id}/${banner}${extension}?size=2048`;
        const embed = new MessageEmbed()
          .setDescription(`Banner`)
          //.setDescription(`${user.tag}'s banner`)
          .setImage(url);
        message.channel.send({ embeds: [embed] });
      }
    })
    .catch(() => {
      message.reply("Usuario no encontrado");
    });
};
