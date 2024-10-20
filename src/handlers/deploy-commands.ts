import { REST, Routes } from "discord.js"
import { clientId, guildId } from "../config.json"with {type:"json"}
import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"
const commands = [];
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
const commandFolders = fs.readdirSync(path.join(__dirname, "../commands"));
for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(path.join(__dirname, `../commands/${folder}`))
        .filter((file) => file.endsWith("js"));

    for (const file of commandFiles) {
        let filePath = path.join(__dirname, `../commands/${folder}/${file}`);
        const command = require(filePath);
        if (command.data == undefined) continue;
        if ("data" in command && "execute" in command) {
            if (!command.slashCommand) {
                console.log(
                    chalk.grey(
                        `[COMMAND DESACTIVATED] ${command.data.name}.`
                    )
                );
                continue;
            }
            commands.push(command.data.toJSON());
            console.log(
                chalk.bgGreenBright.black(
                    `[COMMAND LOADED] ${command.data.name}.`
                )
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
// Construct and prepare an instance of the REST module

// and deploy your commands!
(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        const token  = process.env.TOKEN
        if(!token) return
        const rest = new REST({ version: "10" }).setToken(token);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        //console.log(
        //    `Successfully reloaded ${data.length} application (/) commands.`
        //);
    
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
