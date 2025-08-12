import { Events } from "discord.js"
//import notifier from "node-notifier"
import inactivos from "../../functions/timers/inactivosReminder.js"
//const staffSleeping = require("../../useless/staffSleeping");
import timer from "../../functions/lib/timer.js"
import setPresence from "../../functions/lib/setPresence.js"
import startBot from "../../functions/lib/startBot.js"
import allConnected from "../../functions/lib/allConnected.js"
import Client from "../../interfaces/ICustomClient.js"
import { clearGulag } from "../../functions/automod/workers/clearChat.js"
import dotenv from "dotenv";
dotenv.config();
//import dotenv from "dotenv";

let hoy;

const module = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {

        //const mongoURL = process.env.mongoURL;
        //if (!mongoURL) throw new Error("mongourl no definido");
        //await mongoose.connect(mongoURL)
        //    .then(() => {
        //        console.log("I have connected to database")
        //    })
        //    .catch(err => {
        //        throw new Error("I cannot connect to the database right now");
        //    })

        //startBot(client);
        setPresence(client, "");
        //vcConnection(client);
        setInterval(() => {
            clearGulag(client)
        }, 1 * 60 * 60 * 1000);
        setInterval(() => {
            setPresence(client);
            //vcConnection(client);

            hoy = new Date();
            //staffSleeping(hoy, client);
            timer(hoy, client);
            //bcv(hoy, client);
            inactivos(hoy, client);
            allConnected(hoy, client)
        }, 1000 * 60);
        if (client.user)
            console.log(`Listo! iniciado como ${client.user.tag}`);
    },
};

export default module
