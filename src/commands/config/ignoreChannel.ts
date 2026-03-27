import { SlashCommandBuilder } from "discord.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "ignore",
    cooldown: 5,
    description: "ignora canales del automod",
    allowEdited: false,
    slashCommand: false,
    messageCommand: false,
    data: new SlashCommandBuilder()
        .setName("ignore")
        .setDescription("Ignoras un canal del automod."),
}
export default module
