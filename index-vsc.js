import { Client, Collection} from "discord.js"
import config from "./config.json" with {type:"json"}
const client = new Client({ intents: [34571] });
client.iaUser = new Collection();
import loadSlashCommands from "./handlers/loadSlashCommands.js"
import loadCommands from "./handlers/loadCommands.js"
import loadEvents from "./handlers/loadEvents.js"

loadSlashCommands(client)
loadCommands(client)
loadEvents(client)

//nodejs-listeners
process.on("unhandledRejection", (e) => console.error(e));
process.on("uncaughtException", (e) => console.error(e));
process.on("uncaughtExceptionMonitor", (e) => console.error(e));

client.login(config.token).catch((err) => {
    console.log(
        `Dont possible connect with discord - Reason: "${err.message}"`
    );
});

