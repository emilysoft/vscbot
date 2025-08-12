import { ActivityType } from "discord.js"
import Client from "../../interfaces/ICustomClient.js"
const module = async (client: Client, text?: string) => {
    try {
        if (!client.user) return
        //client.user.setPresence({
        //    activities: [{ name: text }],
        //    status: "dnd",

        //});

        client.user.setStatus('dnd');
        client.user.setActivity(text ? text : "", { type: ActivityType.Listening });
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
};
export default module

