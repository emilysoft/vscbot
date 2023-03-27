const {SlashCommandBuilder } = require("discord.js")
module.exports = {
    name: "ignore",
    slashCommand: false,
    messageCommand: false,
    data: new SlashCommandBuilder()
        .setName("ignore")
        .setDescription("Ignoras un canal del automod.")
}
//                                    console.log("ejecutando ignore ");
//                                    if (
//                                        message.memer.roles.cache.some(
//                                            (role) => role.id === "844230283737038848"
//                                        )
//                                    )
//                                        ignoreChannel(message, client, "ignore");