import { Events, User, MessageReaction} from "discord.js"
import reactionLogger from "../../functions/loggers/reactionLogger.js"
import IEvents from "../../interfaces/iEvents.js"
const module: IEvents = {
    name: Events.MessageReactionAdd,
    async execute(messageReaction: MessageReaction, user:User) {
        reactionLogger(messageReaction, user, 'add')
    }
};

export default module
