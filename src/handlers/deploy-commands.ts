import { REST, Routes } from "discord.js"
//import { clientId, guildId } from "../config.json"with {type:"json"}
import config from "../config.json"with {type: "json"}
import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"
const commands: any = [];
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
const commandFolders = fs.readdirSync(path.join(process.cwd(), "dist/commands"));
for (const folder of commandFolders) {
    const commandFiles = fs
        //.readdirSync(path.join(process.cwd(), `dist/events/${folder}`))
        .readdirSync(path.join(process.cwd(), `dist/commands/${folder}`))
        .filter((file) => file.endsWith("js"));

    for (const file of commandFiles) {
        let filePath = path.join(process.cwd(), `dist/commands/${folder}/${file}`);
        //const command = require(filePath);
        await import(filePath).then(async command => {
            command = command.default
            if (command.data == undefined) return;
            if ("data" in command && "execute" in command) {
                if (!command.slashCommand) {
                    console.log(
                        chalk.grey(
                            `[COMMAND DESACTIVATED] ${command.data.name}.`
                        )
                    );
                    return;
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
        })
        await cargar();
    }
}
// Construct and prepare an instance of the REST module

// and deploy your commands!
async function cargar() {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        const token = process.env.TOKEN
        if (!token) return
        const rest = new REST({ version: "10" }).setToken(token);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );

        //console.log(
        //    `Successfully reloaded ${data.length} application (/) commands.`
        //);

    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
}
