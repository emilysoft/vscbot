import { REST, Routes } from "discord.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function collectCommands(): Promise<any[]> {
  const commands: any[] = [];
  const commandsDir = path.join(__dirname, "../commands");
  const commandFolders = await fs.readdir(commandsDir);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsDir, folder);
    const commandFiles = (await fs.readdir(folderPath)).filter((file) => file.endsWith("js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);

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

export async function deployGlobalCommands(
  commandNames: string[],
  clientId?: string,
): Promise<number> {
  const commands = (await collectCommands()).filter((command) =>
    commandNames.includes(command.name),
  );

  if (!commands.length) return 0;

  console.log(
    `Started refreshing ${commands.length} global application (/) commands.`,
  );

  const token = process.env.TOKEN;
  if (!token) {
    console.error(chalk.bgRedBright.black("[ERROR] Missing bot token in environment variables."));
    return 0;
  }

  const rest = new REST({ version: "10" }).setToken(token);
  const cid = clientId || process.env.CLIENT_ID;
  if (!cid) throw new Error("Missing CLIENT_ID");

  const existing = (await rest.get(
    Routes.applicationCommands(cid),
  )) as Array<{ id: string; name: string }>;

  for (const command of commands) {
    const current = existing.find((entry) => entry.name === command.name);

    if (current) {
      await rest.patch(Routes.applicationCommand(cid, current.id), {
        body: command,
      });
    } else {
      await rest.post(Routes.applicationCommands(cid), { body: command });
    }

    console.log(
      chalk.bgGreenBright.black(
        `[GLOBAL COMMAND UPDATED] ${command.name}.`,
      ),
    );
  }

  return commands.length;
}

async function main() {
  try {
    await deployCommands();
    await deployGlobalCommands(["role"]);
  } catch (error) {
    console.error(chalk.bgRedBright.black("[ERROR] Failed to deploy commands:"), error);
  }
}

const isMain =
  process.argv[1]?.replace(/\\/g, "/").endsWith("deploy-commands.ts") ||
  process.argv[1]?.replace(/\\/g, "/").endsWith("deploy-commands.js");

if (isMain) main();
