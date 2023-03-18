const OWNER_ID = require("../../config.json").OWNER_ID;
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    name: "shutdown",
    description: "Shut's down the bot",
    desactivated: true,
    data: new SlashCommandBuilder()
        .setName("shutdown")
        .setDescription("shutdown the bot"),
    async execute(client, message, args) {
        if (!OWNER_ID)
            return message.channel.send("This command is developer Only");

        message.channel.send("Shutting down...").then((m) => {
            client.destroy();
        });
        await message.channel.send("The Bot has been ShutDown");
    },
};
