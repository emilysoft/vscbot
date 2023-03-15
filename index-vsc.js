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

const loadEvents = require("./handler/loadEvents");
const loadCommands = require("./handler/loadCommands");
loadCommands(client);
loadEvents(client);

client.login(token);
