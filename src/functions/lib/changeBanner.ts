import Client from "../../interfaces/ICustomClient.js";
import config from "../../config/index.js";
const module = async (client: Client) => {
  try {
    const guild = client.guilds.cache.get(config.guilds.main)
    guild?.edit({
      banner:"asd" 
    })
  } catch (err: any) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
};
export default module;
