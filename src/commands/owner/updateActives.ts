import { Message } from "discord.js"
import { SlashCommandBuilder } from "discord.js"
import update from "../../functions/lib/allConnected.js"
import Client from "../../interfaces/ICustomClient.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "updateactive",
    description: "actualiza la cantidad de activos",
    //botPerms: [""],
    data: new SlashCommandBuilder()
        .setName("emote")
        .setDescription("Add emotes"),
    allowEdited: false,
    cooldown: 0,
    slashCommand: false,
    messageCommand: true,
    async run(message: Message, client: Client) {
        try {
            const newDate = new Date(); // Get current date
            newDate.setHours(0, 0, 0, 0);
            update(newDate, client)
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
}
export default module
