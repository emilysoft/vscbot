import { MessageReaction, User, Events } from "discord.js"
import reactionLogger from "../../functions/loggers/reactionLogger.js"
import IEvents from "../../interfaces/iEvents.js"
const module: IEvents = {
    name: Events.MessageReactionRemove,
    async execute(messageReaction: MessageReaction, user: User) {
        reactionLogger(messageReaction, user, "remove");
    },
};
export default module
