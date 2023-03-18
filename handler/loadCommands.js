const chalk = require("chalk");
const { Collection } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

module.exports = (client) => {
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
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ("data" in command && "execute" in command) {
                if(command.desactivated == true) {
                    console.log(
                        chalk.bgBlueBright.black(`[COMMAND DESACTIVATED] ${command.data.name}.`)
                    );
                    continue;
                } 
                client.commands.set(command.data.name, command);
                console.log(
                    chalk.bgGreenBright.black(`[COMMAND LOADED] ${command.data.name}.`)
                );
            } else {
                console.warn(
                    chalk.bgYellowBright.black(
                        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                    )
                );
            }
        }
    }
};
