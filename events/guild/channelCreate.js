const { Events } = require("discord.js");
const newChannelAdviser = require("../../functions/newChannelAdviser");
module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        newChannelAdviser(channel)
    },
};
