import path from "node:path"
import { Events } from "discord.js"
//import notifier from "node-notifier"
import inactivos from "../../timers/inactivosReminder.js"
import bcv from "../../timers/bcvUpdate.js"
//const staffSleeping = require("../../useless/staffSleeping");
import timer from "../../functions/timer.js"
import setPresence from "../../functions/setPresence.js"
import startBot from "../../functions/startBot.js"
import allConnected from "../../functions/allConnected.js"
import Client from "../../classes/ICustomClient.js"
import { clearGulag } from "../../functions/automod/messageCreate/clearChat.js"
let hoy;

const module =  {
    name: Events.ClientReady,
    once: true,
    execute(client:Client) {
        startBot(client);
        //notifier.notify({
        //    message: "vsc-bot iniciado",
        //    icon: path.join(process.cwd(), "../logo.png"),
        //    wait: true,
        //});

        //setPresence(client, "");
        //vcConnection(client);
        setInterval(() => {
            clearGulag(client)
        }, 1 * 60 * 60 * 1000);
        setInterval(() => {
            //setPresence(client, "llamen a Dios");
            //vcConnection(client);

            hoy = new Date();
            //staffSleeping(hoy, client);
            timer(hoy, client);
            bcv(hoy, client);
            inactivos(hoy, client);
            allConnected(hoy, client)
        }, 1000 * 60);
        if(client.user)
            console.log(`Listo! iniciado como ${client.user.tag}`);
    },
};

export default module
