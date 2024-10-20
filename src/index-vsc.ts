import Client from "./classes/ICustomClient.js"
const client = new Client();
import loadSlashCommands from "./handlers/loadSlashCommands.js"
import loadCommands from "./handlers/loadCommands.js"
import loadEvents from "./handlers/loadEvents.js"
//import "./loadenv.js"
import dotenv from 'dotenv';
dotenv.config()
loadSlashCommands(client)
loadCommands(client)
loadEvents(client)

//nodejs-listeners
process.on("unhandledRejection", (e) => console.error(e));
process.on("uncaughtException", (e) => console.error(e));
process.on("uncaughtExceptionMonitor", (e) => console.error(e));

client.login(process.env.TOKEN).catch((err) => console.log(`Dont possible connect with discord - Reason: "${err.message}"`));
client.on("ready", () => console.log("iniciado"))

export default client