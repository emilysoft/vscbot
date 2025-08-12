import Client from "../interfaces/ICustomClient.js"
import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"
export default (client: Client) => {
    const eventsPath = path.join(process.cwd(), "dist/events");
    const eventFolders = fs.readdirSync(eventsPath);
    console.warn(chalk.whiteBright("Loading events"));
    for (const folder of eventFolders) {
        const eventFiles = fs
            .readdirSync(path.join(process.cwd(), `dist/events/${folder}`))
            .filter((file) => file.endsWith(".js"));

        for (const file of eventFiles) {
            const filePath = path.join(process.cwd(), `dist/events/${folder}/${file}`);
            import(filePath).then(event => {
                event = event.default
                if ("name" in event && "execute" in event) {
                    console.log(
                        chalk.greenBright(`[EVENT LOADED] ${event.name}.`)
                    );
                    if (event.once) {
                        client.once(event.name, (...args: any) =>
                            event.execute(...args)
                        );
                    } else {
                        client.on(event.name, (...args: any) => event.execute(...args));
                    }
                } else {
                    console.warn(
                        chalk.yellowBright(
                            `[WARNING] The event at ${filePath} is missing a required "event" or "execute" property.`
                        )
                    );
                }
            })
        }
    }
};

