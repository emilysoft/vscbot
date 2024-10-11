import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"
const module = (client) => {
    const eventsPath = path.join(process.cwd(), "/events");
    const eventFolders = fs.readdirSync(eventsPath);
    console.warn(chalk.whiteBright("Loading events"));
    for (const folder of eventFolders) {
        let eventFiles = fs
            .readdirSync(path.join(process.cwd(), `/events/${folder}`))
            .filter((file) => file.endsWith(".js"));

        for (const file of eventFiles) {
            let filePath = path.join(process.cwd(), `/events/${folder}/${file}`);
            import(filePath).then(event => {
                event = event.default
                if ("name" in event && "execute" in event) {
                    console.warn(
                        chalk.greenBright(`[EVENT LOADED] ${event.name}.`)
                    );
                    if (event.once) {
                        client.once(event.name, (...args) =>
                            event.execute(...args)
                        );
                    } else {
                        client.on(event.name, (...args) => event.execute(...args));
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

export default module
