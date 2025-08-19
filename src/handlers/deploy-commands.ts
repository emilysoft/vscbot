import { REST, Routes } from "discord.js";
//import config from "../config.json" with {type: "json"};
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();
const commands: any = [];
const CLIENT_ID = process.env.CLIENT_ID
const MAIN_SERVER = process.env.MAIN_SERVER

// Función principal asíncrona para manejar toda la lógica
async function main() {
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    const commandFolders = await fs.readdir(path.join(process.cwd(), "dist/commands"));

    for (const folder of commandFolders) {
        const commandFiles = (await fs
            .readdir(path.join(process.cwd(), `dist/commands/${folder}`)))
            .filter((file) => file.endsWith("js"));

        for (const file of commandFiles) {
            const filePath = path.join(process.cwd(), `dist/commands/${folder}/${file}`);

            try {
                // await import() devuelve un objeto de módulo.
                const module = await import(filePath);
                const command = module.default;

                if (!command || !command.data || !command.execute) {
                    console.warn(
                        chalk.bgYellowBright.black(
                            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                        )
                    );
                    continue; // Pasa al siguiente archivo
                }

                if (!command.slashCommand) {
                    console.log(
                        chalk.grey(
                            `[COMMAND DESACTIVATED] ${command.data.name}.`
                        )
                    );
                    continue; // Pasa al siguiente archivo
                }

                commands.push(command.data.toJSON());
                console.log(
                    chalk.bgGreenBright.black(
                        `[COMMAND LOADED] ${command.data.name}.`
                    )
                );
            } catch (error) {
                console.error(
                    chalk.bgRedBright.black(
                        `[ERROR] Failed to load command at ${filePath}:`, error
                    )
                );
            }
        }
    }

    // Llamamos a cargar() solo después de que todos los comandos se hayan cargado.
    await cargar();
}

// Construct and prepare an instance of the REST module
// and deploy your commands!
async function cargar() {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        const token = process.env.TOKEN;
        if (!token) {
            console.error(chalk.bgRedBright.black("[ERROR] Missing bot token in environment variables."));
            return;
        }

        const rest = new REST({ version: "10" }).setToken(token);

        // The put method is used to fully refresh all commands in the guild with the current set
        if (CLIENT_ID == undefined || MAIN_SERVER == undefined) throw new Error("erro falta client_id or main_server")
        const data: any = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, MAIN_SERVER),
            { body: commands }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(chalk.bgRedBright.black("[ERROR] Failed to deploy commands:"), error);
    }
}

// Iniciar la ejecución del script
main();
