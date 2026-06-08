import { Events, User, MessageReaction } from "discord.js"
import reactionLogger from "../../functions/loggers/reactionLogger.js"
import starboard from "../../functions/starboard.js"
import { handleReactionAdd } from "../../functions/events/eventManager.js"
import Client from "../../interfaces/ICustomClient.js"
import IEvents from "../../interfaces/iEvents.js"
import dotenv from "dotenv"
dotenv.config()

const module: IEvents = {
  name: Events.MessageReactionAdd,
  async execute(messageReaction: MessageReaction, user: User) {
    await starboard(messageReaction, user)
    reactionLogger(messageReaction, user, 'add')

    if (messageReaction.emoji.name === '✅') {
      const client = messageReaction.client as Client
      await handleReactionAdd(client, messageReaction.message.id, user.id)
    }
  }
};

export default module
