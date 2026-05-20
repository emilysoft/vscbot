import { Events, User, MessageReaction } from "discord.js"
import reactionLogger from "../../functions/loggers/reactionLogger.js"
import starboard from "../../functions/starboard.js"
import IEvents from "../../interfaces/iEvents.js"
import dotenv from "dotenv"
dotenv.config()

const module: IEvents = {
  name: Events.MessageReactionAdd,
  async execute(messageReaction: MessageReaction, user: User) {
    await starboard(messageReaction, user)
    reactionLogger(messageReaction, user, 'add')
  }
};

export default module
