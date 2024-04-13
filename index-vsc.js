const { Client } = require("discord.js");
const { token } = require("./config.json");
const client = new Client({ intents: [38531] });

require("./handlers/loadSlashCommands")(client);
require("./handlers/loadCommands")(client);
require("./handlers/loadEvents")(client);

//nodejs-listeners
process.on("unhandledRejection", (e) => console.error(e));
process.on("uncaughtException", (e) => console.error(e));
process.on("uncaughtExceptionMonitor", (e) => console.error(e));

client.login(token).catch((err) => {
    console.log(
        `Dont possible connect with discord - Reason: "${err.message}"`
    );
});
