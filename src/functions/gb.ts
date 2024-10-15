import { Message } from "discord.js";
import errorLogger from "./loggers/errorLogger.js"
import Client from "../classes/ICustomClient.js"
const module = (message:Message, client:Client) => {
    try {
        const regex = /\.\s*t\s+g\s*b/gim;
        if (message.content.match(regex) != null) message.delete();
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ")
    }
};

export default module