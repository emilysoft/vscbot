const { Client, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
});
const loadEvents = require("./handlers/loadEvents");
const loadSlashCommands = require("./handlers/loadSlashCommands");
const loadCommands = require("./handlers/loadCommands");

loadSlashCommands(client)
loadCommands(client);
loadEvents(client);

client.login(token);