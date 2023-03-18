const fs = require("node:fs");
const path = require("node:path");
const chalk = require("chalk");
module.exports = (client) => {
    const eventsPath = path.join(__dirname, "../events");
    const eventFolders = fs.readdirSync(eventsPath);
    for (folder of eventFolders) {
        let eventFiles = fs
            .readdirSync(path.join(__dirname, `../events/${folder}`))
            .filter((file) => file.endsWith(".js"));

        for (const file of eventFiles) {
            let filePath = path.join(__dirname, `../events/${folder}/${file}`);
            let event = require(filePath);

            if ("name" in event && "execute" in event) {
                console.warn(chalk.bgGreenBright.black(`[EVENT LOADED] ${event.name}.`));
                if (event.once) {
                    client.once(event.name, (...args) =>
                        event.execute(...args)
                    );
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
            } else {
                console.warn(
                    chalk.bgYellowBright.black(
                        `[WARNING] The event at ${filePath} is missing a required "event" or "execute" property.`
                    )
                );
            }
        }
    }
};
