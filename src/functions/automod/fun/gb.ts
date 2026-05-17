import { Message } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";

export default {
  name: "gb",
  scope: "guild",
  ignoreBots: true,
  allowEdited: false,
  execute: async function (message: Message, client: Client) {
    try {
      const regex = /\.\s*t\s+g\s*b/gim;
      if (message.content.match(regex) != null) {
        message.delete().catch(() => null);
      }
    } catch (err) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  },
};

