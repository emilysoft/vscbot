import { Events } from "discord.js"
import reactionLogger from "../../functions/loggers/reactionLogger.js"
const module = {
    name: Events.MessageReactionAdd,
    async execute(messageReaction, user) {
        reactionLogger(messageReaction, user, 'add')
    }
};

export default module
