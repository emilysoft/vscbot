import {SlashCommandBuilder } from "discord.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "ignore",
    description:"ignora canales del automod",
    slashCommand: false,
    messageCommand: false,
    data: new SlashCommandBuilder()
        .setName("ignore")
        .setDescription("Ignoras un canal del automod."),
}
//                                    console.log("ejecutando ignore ");
//                                    if (
//                                        message.memer.roles.cache.some(
//                                            (role) => role.id === "844230283737038848"
//                                        )
//                                    )
//                                        ignoreChannel(message, client, "ignore");
//
export default module
