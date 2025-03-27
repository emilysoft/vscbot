import errorLogger from "./loggers/errorLogger.js";
import Client from "../classes/ICustomClient.js";
const module = async (client: Client) => {
    try {
        const guild = client.guilds.cache.get("813538324320092161")
        guild?.edit({
            banner:"asd" 
        })
    } catch (err: any) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};
export default module;
