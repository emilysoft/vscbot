const { OWNERS_ID } = require("../../config.json");
const { SlashCommandBuilder } = require("discord.js");
const errorLogger = require("../../functions/loggers/errorLogger");
module.exports = {
    name: "shutdown",
    description: "Shut's down the bot",
    desactivated: false,
    data: new SlashCommandBuilder()
        .setName("shutdown")
        .setDescription("shutdown the bot"),
    async execute(client, message, args) {
        try {

            if(!OWNERS_ID.some(id => id === message.author.id)) 

            message.channel.send("Shutting down...").then((m) => {
                client.destroy();
            });
            await message.channel.send("The Bot has been ShutDown");
        } catch (err) {
            errorLogger(err, client, "error");
        }
    },
};
