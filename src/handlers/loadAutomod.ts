import {Collection} from "discord.js"
import Client from "../interfaces/ICustomClient.js"
import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"
export default (client:Client) => {
    client.automod = new Collection()
    console.log(chalk.whiteBright("Loading automod functions"));
    const automodFolders = fs.readdirSync(
        path.join(process.cwd(), "dist/functions/automod")
    );
    for (const folder of automodFolders) {
        const automodFiles = fs
            .readdirSync(path.join(process.cwd(), `dist/functions/automod/${folder}`))
            .filter((file) => file.endsWith("js"));
        for (const file of automodFiles) {
            const filePath = path.join(
                process.cwd(),
                `dist/functions/automod/${folder}/${file}`
            );
            import(filePath).then(automod => {
                automod = automod.default
                //if (!automod.enable) {
                //    console.log(
                //        chalk.grey(
                //            `[AUTOMOD DESACTIVATED] ${automod.name}.`
                //        )
                //    );
                //}
                if ("name" in automod && "execute" in automod) {
                    client.automod.set(automod.name, automod);
                    console.log(
                        chalk.greenBright(
                            `[AUTOMOD LOADED] ${automod.name}.`
                        )
                    );
                } else {
                    console.warn(
                        chalk.yellowBright(
                            `[WARNING] The automod at ${filePath} is missing a required "name" or "execute" property.`
                        )
                    );
                }
            })
        }
    }
};
