import Client from "../interfaces/ICustomClient.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..");

export default async (client: Client) => {
  const eventsPath = path.join(distDir, "events");
  const eventFolders = await fs.readdir(eventsPath);
  console.warn(chalk.whiteBright("Loading events"));

  const promises = [];

  for (const folder of eventFolders) {
    const eventFiles = (await fs.readdir(path.join(eventsPath, folder)))
      .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, folder, file);
      // Recopilamos todas las promesas de importación
      promises.push(import(filePath));
    }
  }

  // Esperamos a que todas las promesas se resuelvan
  try {
    const loadedEvents = await Promise.all(promises);

    loadedEvents.forEach(eventModule => {
      const event = eventModule.default;
      if ("name" in event && "execute" in event) {
        console.log(
          chalk.greenBright(`[EVENT LOADED] ${event.name}.`)
        );
        if (event.once) {
          client.once(event.name, (...args: any) =>
            event.execute(...args)
          );
        } else {
          client.on(event.name, (...args: any) => event.execute(...args));
        }
      } else {
        console.warn(
          chalk.yellowBright(
            `[WARNING] The event is missing a required "name" or "execute" property.`
          )
        );
      }
    });
  } catch (error) {
    console.error(chalk.red("An error occurred while loading events:"), error);
  }
};
