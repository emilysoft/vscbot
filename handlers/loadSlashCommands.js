import chalk from "chalk"
import { Collection } from "discord.js"
import fs from "node:fs"
import path from "node:path"

export default (client) => {
    console.log(chalk.white("Loading slash commands"));
    client.commands = new Collection();
    const commandFolders = fs.readdirSync(path.join(process.cwd(), "/commands"));
    for (const folder of commandFolders) {
        const commandFiles = fs
            .readdirSync(path.join(process.cwd(), `/commands/${folder}`))
            .filter((file) => file.endsWith("js"));
        for (const file of commandFiles) {
            let filePath = path.join(
                process.cwd(),
                `/commands/${folder}/${file}`
            );
            import(filePath).then(command => {
                command = command.default
                if (!command.slashCommand) {
                    console.log(
                        chalk.grey(
                            `[COMMAND SLASH DESACTIVATED] ${command.data.name}.`
                        )
                    );
                }
                else if("data" in command && "execute" in command) {
                    // Set a new item in the Collection with the key as the command name and the value as the exported module
                    client.commands.set(command.data.name, command);
                    console.log(
                        chalk.blueBright(
                            `[COMMAND SLASH LOADED] ${command.data.name}.`
                        )
                    );
                } else {
                    console.warn(
                        chalk.yellowBright(
                            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                        )
                    );
                }
            })
            //const command = require(filePath);
        }
    }
};
