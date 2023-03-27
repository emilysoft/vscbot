const { Collection } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const chalk = require("chalk")
module.exports = (client) => {
    client.messageCommands = new Collection();
    console.log(chalk.whiteBright("Loading message commands"));
    const commandFolders = fs.readdirSync(
        path.join(__dirname, "../commands")
    );
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
            if (!command.messageCommand) {
                console.log(
                    chalk.grey(
                        `[COMMAND DESACTIVATED] ${command.name}.`
                    )
                );
                continue;
            } else if ("name" in command && "run" in command && "description" in command) {
                client.messageCommands.set(command.name, command.run);
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
        }
    }
};
