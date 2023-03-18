const { Events } = require("discord.js");
const OnInviteIsCreate = require("../../functions/OnInviteIsCreate");
module.exports = {
    name: Events.InviteCreate,
    async execute(invite) {
        OnInviteIsCreate(client, invite);
    },
};
