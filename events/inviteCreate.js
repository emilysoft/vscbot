const { Events } = require('discord.js')
const OnInviteIsCreate = require("../functions/OnInviteIsCreate");
module.exports = {
    name: Events.OnInviteIsCreate,
    async execute(invite) {
        OnInviteIsCreate(client, invite);
    }
}