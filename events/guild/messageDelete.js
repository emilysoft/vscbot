const { Events } = require("discord.js");
const errorLogger = require("../../functions/loggers/errorLogger");
const messageLogger = require("../../functions/loggers/messageLogger");

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        try {
            messageLogger(message, "delete");
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};
