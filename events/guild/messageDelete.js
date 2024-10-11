import { Events } from "discord.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
import messageLogger from "../../functions/loggers/messageLogger.js"
import attachDelete from "../../functions/automod/messageCreate/attachDelete.js"
const module = {
  name: Events.MessageDelete,
  async execute(message) {
    try {
      attachDelete(message);
      messageLogger(message, "delete");
    } catch (err) {
      errorLogger(err, message.client, "error");
    }
  },
};

export default module
