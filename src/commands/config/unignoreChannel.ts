import { SlashCommandBuilder } from "discord.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "unignore",
    description: "unignore channels",
    cooldown: 5,
    allowEdited: false,
    slashCommand: false,
    messageCommand: false,
    data: new SlashCommandBuilder()
        .setName("unignore")
        .setDescription("Agregas un canal al automod.")
}

export default module

//                                    console.log("ejecutando unignore");
//                                    if (
//                                        message.member.roles.cache.some(
//                                            (role) => role.id === "844230283737038848"
//                                        )
//                                    )
//                                        ignoreChannel(message, client, "unignore");
