const errorLogger = require("../../functions/loggers/errorLogger");
const OWNERS_ID = require("../../config.json").OWNER_ID;
const ERROR_LOGS_CHANNEL = require("../../config.json").ERROR_LOGS_CHANNEL;
const { SlashCommandBuilder } = require("discord.js");
const update = require("../../functions/allConnected")
//require("dotenv");

module.exports = {
    name: "updateactive",
    description: "actualiza la cantidad de activos",
    botPerms: [""],
    data: new SlashCommandBuilder()
        .setName("emote")
        .setDescription("Add emotes"),
    slashCommand: false,
    messageCommand: true,
    async run(message, args) {
        try {
            const newDate = new Date(); // Get current date
            newDate.setHours(0, 0, 0, 0); 
            update(newDate, message.client)
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
}
