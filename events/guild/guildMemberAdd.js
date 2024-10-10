const { Events } = require("discord.js");
const wlcStaff = require("../../functions/welcome/wlcStaff");
const wlcID = require("../../functions/welcome/wlcID");
const wlcPartnetship = require("../../functions/welcome/wlcPartnership");
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        wlcStaff(member);
        wlcID(member);
        wlcPartnetship(member);
    },
};
