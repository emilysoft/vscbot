import { Events, Message} from "discord.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import attachDelete from "../../functions/automod/messageCreate/attachDelete.js"
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
const module: IEvents = {
  name: Events.MessageDelete,
  async execute(message: Message) {
    try {
      attachDelete(message, client);
      messageLogger(message, "delete", client);
    } catch (err) {
      errorLogger(err, client, "error", process.cwd() + " ");
    }
  },
};

export default module
