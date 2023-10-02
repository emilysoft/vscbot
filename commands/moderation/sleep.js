const { SlashCommandBuilder } = require("discord.js");
const { sleep } = require("../../functions/automod/staffSleeping");
module.exports = {
    name: "sleep",
    data: new SlashCommandBuilder()
        .setName("sleep")
        .setDescription(
            "Deny all basic general's channel permissions for everyone."
        ),
    slashCommand: true,
    messageCommand: true,
    async execute() {
        sleep();
    },
    async run() {
        sleep();
    },
};
