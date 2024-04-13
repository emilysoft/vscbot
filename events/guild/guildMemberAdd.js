const { Events } = require("discord.js");
const wlcStaff = require("../../functions/welcome/wlcStaff");
const wlcID = require("../../functions/welcome/wlcID");
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        wlcStaff(member);
        wlcID(member);
    },
};
