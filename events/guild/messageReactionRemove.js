const { Events } = require("discord.js");
const reactionLogger = require("../../functions/loggers/reactionLogger.js");
module.exports = {
    name: Events.MessageReactionRemove,
    async execute(messageReaction, user) {
        reactionLogger(messageReaction, user, "remove");
    },
};
