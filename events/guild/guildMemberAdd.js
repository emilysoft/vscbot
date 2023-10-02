const { Events } = require("discord.js");
const wlcRoles = require("../../functions/welcome/wlcRoles")
const wlcStaff = require("../../functions/welcome/wlcStaff");
const wlcID = require("../../functions/welcome/wlcID");
const banUsername = require("../../functions/automod/banUsername");
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        //banUsername(member)
        wlcRoles(member)
        wlcStaff(member)
        wlcID(member)
    },
};