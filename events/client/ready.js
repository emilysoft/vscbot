const path = require("node:path");
const { Events } = require("discord.js");
const notifier = require("node-notifier");
const vcConnection = require("../../functions/vcConnection");
const { updateMonitor } = require("../../timers/bcvUpdate");
const staffSleeping = require("../../useless/staffSleeping");
const timer = require("../../functions/timer");
const setPresence = require("../../functions/setPresence");
const startBot = require("../../functions/startBot");

let hoy;

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        startBot(client);
        notifier.notify({
            message: "vsc-bot iniciado",
            icon: path.join(__dirname, "../logo.png"),
            wait: true,
        });

        setPresence(client, "/help");
        //vcConnection(client);

        //timers
        setInterval(() => {
            setPresence(client, "/help");
            //vcConnection(client);

            hoy = new Date();
            //staffSleeping(hoy, client);
            timer(hoy, client);
            updateMonitor(hoy, client);
        }, 1000 * 60);

        console.log(`Listo! iniciado como ${client.user.tag}`);
    },
};
