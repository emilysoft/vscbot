const path = require("node:path");
const { Events } = require("discord.js");
const notifier = require("node-notifier");
const vcConnection = require("../../functions/vcConnection");
const { updateAfternoon } = require("../../timers/bcvUpdate");
const lockBumpChannel = require("../../functions/automod/lockBumpChannel");
const staffSleeping = require("../../functions/automod/staffSleeping");
const timer = require("../../functions/timer");
const setPresence = require("../../functions/setPresence");
let hoy;
module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        notifier.notify({
            message: "vsc-bot iniciado",
            icon: path.join(__dirname, "../logo.png"),
            wait: true,
        });

        setPresence(client, "/help");
        vcConnection(client);
        // timers
        setInterval(() => {
            hoy = new Date();
            staffSleeping(hoy, client);
            timer(hoy, client);
            updateAfternoon(hoy, client);
            lockBumpChannel(hoy, client);
        }, 60000);

        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};
