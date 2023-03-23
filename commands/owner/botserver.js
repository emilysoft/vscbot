const errorLogger = require("../../functions/loggers/errorLogger");
const OWNERS_ID = require("../../config.json").OWNER_ID;
const ERROR_LOGS_CHANNEL = require("../../config.json").ERROR_LOGS_CHANNEL;
const { SlashCommandBuilder } = require("discord.js");
//require("dotenv");

module.exports = {
    name: "botservers",
    description: "Check what Servers the bot is in!",
    botPerms: ["UseExternalEmojis"],
    desactivated: true,
    data: new SlashCommandBuilder()
        .setName("botservers")
        .setDescription("Check what Servers the bot is in!"),
    async execute(client, message, args) {
        try {
            if (!OWNERS_ID.some((id) => id === message.author.id)) return;
            let data = [];
            client.guilds.cache.forEach((x) => {
                message.channel.send(
                    `🔹**${x.name}** | \`${x.memberCount}\` members (ID: ${x.id})\n............................`
                );
            });

            if (data.length > 0) {
                data.sort();
                data = `🔹 ` + data.join("\n🔹");
            } else {
                data = "[No server found]";
            }
        } catch (err) {
            errorLogger(err, message.client, "error");
            const errorlogs = client.channels.cache.get(ERROR_LOGS_CHANNEL);

            message.channel.send(
                `Whoops, We got a error right now! This error has been reported to Support center!`
            );

            errorlogs.send(`Error on bs commands!\n\nError:\n\n ${err}`);
        }
    },
};
