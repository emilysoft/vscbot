import { Collection } from "discord.js"
import Client from "../interfaces/ICustomClient.js"
import path from "node:path"
import { fileURLToPath } from "node:url"
import chalk from "chalk"
import fs from "node:fs/promises";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..");
export default async (client: Client) => {
  client.messageCommands = new Collection()
  console.log(chalk.whiteBright("Loading message commands"));
  const commandFolders = await fs.readdir(
    path.join(distDir, "commands")
  );
  for (const folder of commandFolders) {
    const commandFiles = (await fs
      .readdir(path.join(distDir, `commands/${folder}`)))
      .filter((file) => file.endsWith("js"));
    for (const file of commandFiles) {
      const filePath = path.join(
        distDir,
        `commands/${folder}/${file}`
      );
      import(filePath).then(command => {
        command = command.default
        if (!command.messageCommand) {
          console.log(
            chalk.grey(
              `[COMMAND DESACTIVATED] ${command.name}.`
            )
          );
        } else if ("name" in command && "run" in command && "description" in command) {
          client.messageCommands.set(command.name, command);
          console.log(
            chalk.greenBright(
              `[COMMAND LOADED] ${command.name}.`
            )
          );
        } else {
          console.warn(
            chalk.yellowBright(
              `[WARNING] The command at ${filePath} is missing a required "name" or "run" or "description" property.`
            )
          );
        }
      })
    }
  }
};
