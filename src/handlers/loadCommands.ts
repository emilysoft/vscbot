import {Collection} from "discord.js"
import Client from "../classes/ICustomClient.js"
import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"
export default (client:Client) => {
    client.messageCommands = new Collection()
    console.log(chalk.whiteBright("Loading message commands"));
    const commandFolders = fs.readdirSync(
        path.join(process.cwd(), "dist/commands")
    );
    for (const folder of commandFolders) {
        const commandFiles = fs
            .readdirSync(path.join(process.cwd(), `dist/commands/${folder}`))
            .filter((file) => file.endsWith("js"));
        for (const file of commandFiles) {
            let filePath = path.join(
                process.cwd(),
                `dist/commands/${folder}/${file}`
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
