import errorLogger from "../../functions/loggers/errorLogger.js"
import { SlashCommandBuilder } from "discord.js"
import update from "../../functions/allConnected.js"
const module = {
    name: "updateactive",
    description: "actualiza la cantidad de activos",
    botPerms: [""],
    data: new SlashCommandBuilder()
        .setName("emote")
        .setDescription("Add emotes"),
    slashCommand: false,
    messageCommand: true,
    async run(message, args) {
        try {
            const newDate = new Date(); // Get current date
            newDate.setHours(0, 0, 0, 0); 
            update(newDate, message.client)
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
}
export default module
