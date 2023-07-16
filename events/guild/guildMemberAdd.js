const { Events } = require("discord.js");
const wlcRoles = require("../../functions/welcome/wlcRoles")
const wlcStaff = require("../../functions/welcome/wlcStaff");
const wlcID = require("../../functions/welcome/wlcID");
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        wlcRoles(member)
        wlcStaff(member)
        wlcID(member)
    },
};