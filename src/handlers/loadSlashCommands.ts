import Client from "../interfaces/ICustomClient.js";
import chalk from "chalk";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..");

export default async (client: Client) => {
  console.log(chalk.white("Loading slash commands"));

  const commandFolders = await fs.readdir(path.join(distDir, "commands"));

  const promises = [];

  for (const folder of commandFolders) {
    const commandFiles = (await fs
      .readdir(path.join(distDir, `commands/${folder}`)))
      .filter((file) => file.endsWith("js"));

    for (const file of commandFiles) {
      const filePath = path.join(
        distDir,
        `commands/${folder}/${file}`
      );
      // Agrega cada importación a nuestro array de promesas
      promises.push(import(filePath));
    }
  }

  // Espera a que todas las promesas se resuelvan
  try {
    const loadedCommands = await Promise.all(promises);

    loadedCommands.forEach(commandModule => {
      const command = commandModule.default;

      if (!command.slashCommand) {
        console.log(
          chalk.grey(
            `[COMMAND SLASH DESACTIVATED] ${command.data.name}.`
          )
        );
      } else if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log(
          chalk.blueBright(
            `[COMMAND SLASH LOADED] ${command.data.name}.`
          )
        );
      } else {
        console.warn(
          chalk.yellowBright(
            `[WARNING] The command at ${path.join(distDir, "commands")} is missing a required "data" or "execute" property.`
          )
        );
      }
    });

  } catch (err) {
    console.error("An error occurred while loading commands:", err);
  }
};
