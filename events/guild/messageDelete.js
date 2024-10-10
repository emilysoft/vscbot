const { Events } = require("discord.js");
const errorLogger = require("../../functions/loggers/errorLogger");
const messageLogger = require("../../functions/loggers/messageLogger");
const attachDelete = require("../../functions/automod/messageCreate/attachDelete");
module.exports = {
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
