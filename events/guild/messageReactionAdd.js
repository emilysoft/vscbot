const { Events } = require("discord.js");
const reactionLogger = require('../../functions/loggers/reactionLogger.js')
module.exports = {
    name: Events.MessageReactionAdd,
    async execute(messageReaction, user) {
        reactionLogger(messageReaction, user, 'add')
    }
};
