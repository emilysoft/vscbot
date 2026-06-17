import { REST, Routes } from "discord.js";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

export async function collectCommands(): Promise<any[]> {
  const commands: any[] = [];
  const commandFolders = await fs.readdir(path.join(process.cwd(), "dist/commands"));

  for (const folder of commandFolders) {
    const commandFiles = (await fs
      .readdir(path.join(process.cwd(), `dist/commands/${folder}`)))
      .filter((file) => file.endsWith("js"));

    for (const file of commandFiles) {
      const filePath = path.join(process.cwd(), `dist/commands/${folder}/${file}`);

      try {
        const module = await import(filePath);
        const command = module.default;

        if (!command || !command.data || !command.execute) {
          console.warn(
            chalk.bgYellowBright.black(
              `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            )
          );
          continue;
        }

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
      } catch (error) {
        console.error(
          chalk.bgRedBright.black(
            `[ERROR] Failed to load command at ${filePath}:`, error
          )
        );
      }
    }
  }

  return commands;
}

export async function deployCommands(clientId?: string, guildId?: string): Promise<number> {
  const commands = await collectCommands();

  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  const token = process.env.TOKEN;
  if (!token) {
    console.error(chalk.bgRedBright.black("[ERROR] Missing bot token in environment variables."));
    return 0;
  }

  const rest = new REST({ version: "10" }).setToken(token);

  const cid = clientId || process.env.CLIENT_ID;
  const gid = guildId || process.env.MAIN_SERVER;
  if (!cid || !gid) throw new Error("Missing CLIENT_ID or MAIN_SERVER");

  const data: any = await rest.put(
    Routes.applicationGuildCommands(cid, gid),
    { body: commands }
  );

  console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  return data.length;
}

async function main() {
  try {
    await deployCommands();
  } catch (error) {
    console.error(chalk.bgRedBright.black("[ERROR] Failed to deploy commands:"), error);
  }
}

const isMain =
  process.argv[1]?.replace(/\\/g, "/").endsWith("deploy-commands.ts") ||
  process.argv[1]?.replace(/\\/g, "/").endsWith("deploy-commands.js");

if (isMain) main();
