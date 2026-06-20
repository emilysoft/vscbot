import { Events } from "discord.js";
//import notifier from "node-notifier"
import inactivos from "../../functions/timers/inactivosReminder.js";
//const staffSleeping = require("../../useless/staffSleeping");
import timer from "../../functions/lib/timer.js";
import setPresence from "../../functions/lib/setPresence.js";
import Client from "../../interfaces/ICustomClient.js";
import bcv from "../../functions/timers/bcvUpdate.js";
import { initScheduler } from "../../functions/timers/eventScheduler.js";
import { initReminderScheduler } from "../../functions/timers/reminderScheduler.js";
import { initRssScheduler } from "../../functions/timers/rssScheduler.js";
import { initNewMemberRestrictionScheduler } from "../../functions/timers/newMemberRestrictionScheduler.js";
import { clearGulag } from "../../functions/automod/workers/clearChat.js";
import { deployCommands } from "../../handlers/deploy-commands.js";
import dotenv from "dotenv";
dotenv.config();

const module = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    setPresence(client, "");

    deployCommands().catch(console.error);
    await initScheduler(client);
    await initReminderScheduler(client);
    await initRssScheduler(client);
    await initNewMemberRestrictionScheduler(client);

    setInterval(
      () => {
        clearGulag(client);
      },
      1 * 60 * 60 * 1000,
    );
    setInterval(() => {
      setPresence(client);
      const hoy = new Date();
      timer(hoy, client);
      bcv(hoy, client);
      inactivos(hoy, client);
    }, 1000 * 60);
    if (client.user) console.log(`Listo! iniciado como ${client.user.tag}`);
  },
};

export default module;
