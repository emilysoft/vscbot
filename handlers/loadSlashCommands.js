const chalk = require("chalk");
const { Collection } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

module.exports = (client) => {
    console.log(chalk.white("Loading slash commands"));
    client.commands = new Collection();
    const commandFolders = fs.readdirSync(path.join(__dirname, "../commands"));
    for (const folder of commandFolders) {
        const commandFiles = fs
            .readdirSync(path.join(__dirname, `../commands/${folder}`))
            .filter((file) => file.endsWith("js"));
        for (const file of commandFiles) {
            let filePath = path.join(
                __dirname,
                `../commands/${folder}/${file}`
            );
            const command = require(filePath);
            if (!command.slashCommand) {
                console.log(
                    chalk.grey(
                        `[COMMAND DESACTIVATED] ${command.data.name}.`
                    )
                );
                continue;
            }
            else if("data" in command && "execute" in command) {
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                client.commands.set(command.data.name, command);
                console.log(
                    chalk.greenBright(
                        `[COMMAND LOADED] ${command.data.name}.`
                    )
                );
            } else {
                console.warn(
                    chalk.yellowBright(
                        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                    )
                );
            }
        }
    }
};
