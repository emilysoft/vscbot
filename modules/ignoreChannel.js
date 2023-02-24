const mysql = require("mysql");
const config = require("../database/config");
const { MessageEmbed } = require("discord.js");
const botAvatar =
  "https://cdn.discordapp.com/attachments/847580112118743071/938042216209874944/c821a559d8df0079beb33abf9c6eeeda.png";
module.exports = (dcMessage, client, action) => {
  let args = dcMessage.content.substring(">".length).split(" ").slice(1);
  let channelId = args[0];

  //busca si existe

  // insert statment
  let connection = mysql.createConnection(config);
  connection.connect((err) => {
    if (err) {
      dcMessage.reply("Hubo un error.");
      return console.error(`error: ${err.message}`);
    }
    console.log("Connected to the MySQL server.");
  });

  switch (action) {
    case "ignore": {
      let channel = client.channels.cache.find(
        (channel) => channel.id === channelId
      );
      if (channel === undefined) return dcMessage.reply("Canal no encontrado.");
      let searchChannel = `SELECT channelId FROM ignoredChannels WHERE channelId = '${channelId}' LIMIT 1`;
      let insertChannel = `INSERT INTO ignoredChannels(channelId) VALUES(${channelId})`;
      // execute the insert statment
      connection.query(searchChannel, (error, result) => {
        closeConnection();
        if (error) return console.error(error);
        if (result.length == 0) {
          connection.query(
            (insertChannel,
            (error) => {
              closeConnection();
              if (error) return console.log(error);
              return dcMessage.reply(`Canal <#${channelId}> ignorado.`);
            })
          );
        } else {
          return dcMessage.reply("Este canal ya está agregado.");
        }
      });
    }
    case "unignore": {
      let sql = `DELETE FROM ignoredChannels WHERE channelId = '${channelId}'`;
      connection.query(sql, (error) => {
        if (error) console.log(error);
        closeConnection();
        return dcMessage.reply(
          `Canal <#${channelId}> ahora será revisado por el automod.`
        );
      });
    }
    case "channels": {
      let sql = `SELECT channelId FROM ignoredchannels`;
      connection.query(sql, (error, results) => {
        closeConnection();
        if (error) return console.error(error);
        var channels = [];
        console.log(results[0].channelId);
        results.map((channel) =>
          channels.push(`<#${channel.channelId}>` + "\n")
        );
        const exampleEmbed = new MessageEmbed()
          .setColor("#ADD8E6")
          .setTitle(`Canales ignorados`)
          .setDescription(channels.join(""))
          .setTimestamp();
        return dcMessage.channel.send({ embeds: [exampleEmbed] });
      });
    }
  }
  function closeConnection() {
    connection.end(function (err) {
      if (err) return console.log("error:" + err.message);
      console.log("Close the database connection.");
    });
  }
};
