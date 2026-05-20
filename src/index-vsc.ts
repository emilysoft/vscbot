import Client from "./interfaces/ICustomClient.js";
const client = new Client();
import loadSlashCommands from "./handlers/loadSlashCommands.js";
import loadCommands from "./handlers/loadCommands.js";
import loadEvents from "./handlers/loadEvents.js";
import dotenv from "dotenv";
import loadAutomod from "./handlers/loadAutomod.js";
import api from "./api/api.js"
dotenv.config();
await client.db.connect();
loadSlashCommands(client)
loadCommands(client)
loadEvents(client)
loadAutomod(client)
//nodejs-listeners
process.on("unhandledRejection", (e) => console.error(e));
process.on("uncaughtException", (e) => console.error(e));
process.on("uncaughtExceptionMonitor", (e) => console.error(e));

client
  .login(process.env.TOKEN)
  .catch((err) =>
    console.log(
      `Dont possible connect with discord - Reason: "${err.message}"`
    )
  );
client.on("clientReady", async () => {
  api()
  console.log("iniciado")
});

export default client;
