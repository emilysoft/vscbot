import errorLogger from "../../functions/loggers/errorLogger.js"
import config from "../../config.json" with {type:"json"}
import { SlashCommandBuilder } from "discord.js"
//require("dotenv");

const module = {
    name: "botservers",
    description: "Check what Servers the bot is in!",
    botPerms: ["UseExternalEmojis"],
    slashCommand: false,
    messageCommand: false,
    data: new SlashCommandBuilder()
        .setName("botservers")
        .setDescription("Check what Servers the bot is in!"),
    async execute(client, message, args) {
        try {
            if (!config.OWNERS_ID.some((id) => id === message.author.id)) return;
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
            errorLogger(err, message.client, "error", import.meta.url);
            const errorlogs = client.channels.cache.get(config.ERROR_LOGS_CHANNEL);

            message.channel.send(
                `Whoops, We got a error right now! This error has been reported to Support center!`
            );

            errorlogs.send(`Error on bs commands!\n\nError:\n\n ${err}`);
        }
    },
};

export default module
