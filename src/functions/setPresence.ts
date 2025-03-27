import errorLogger from "./loggers/errorLogger.js"
import Client from "../classes/ICustomClient.js"
const module = async (client:Client, text:string) => {
    try {
        function setPresence(client:Client, activity:string) {
            if(!client.user) return
            client.user.setPresence({
                activities: [{ name: activity }],
                status: "online",
            });
        }
        setPresence(client, text);
        //setTimeout(() => {
        //    setPresence(client, text);
        //}, 300000);
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};
export default module
