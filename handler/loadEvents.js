const fs = require("node:fs");
const path = require("node:path");
module.exports = (client) => {
    const eventsPath = path.join(__dirname, "../events");
    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if ("name" in event && "execute" in event) {
            console.log(`cargado ${event.name}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        } else {
            console.warn(
                `[WARNING] The event at ${filePath} is missing a required "event" or "execute" property.`
            );
        }
    }
};
