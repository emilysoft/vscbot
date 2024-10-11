import { Events } from "discord.js"
import reactionLogger from "../../functions/loggers/reactionLogger.js"
const module = {
    name: Events.MessageReactionRemove,
    async execute(messageReaction, user) {
        reactionLogger(messageReaction, user, "remove");
    },
};
export default module
