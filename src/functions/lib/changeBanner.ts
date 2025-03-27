import Client from "../../interfaces/ICustomClient.js";
const module = async (client: Client) => {
    try {
        const guild = client.guilds.cache.get("813538324320092161")
        guild?.edit({
            banner:"asd" 
        })
    } catch (err: any) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
};
export default module;
