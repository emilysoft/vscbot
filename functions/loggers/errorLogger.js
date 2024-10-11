import { EmbedBuilder } from "discord.js"
import path from "path"
import fs from "fs"
const module = async (error, client, type) => {
    try {
        let now = new Date();
        let day = now.getDate()
        let year = now.getFullYear()
        let month = now.getMonth()
        fs.writeFile(
            path.join(process.cwd(), `logs/errors/${year}-${month}-${day}.log`),
            `${error}\n${now}\n`,
            { flag: "a+" },
            (err) => {
                if (err) console.error(err);
            }
        );

        let errorColor;
        if (type == "error") {
            errorColor = "#FF0000";
            console.error(error);
        } else if (type == "warn") {
            errorColor = "#FFFF00";
            console.warn(error);
        } else {
            throw new Error("Error en especificar el type de error");
        }
        const logChannelId = "1085335051732009113";
        const botAvatar = client.user.displayAvatarURL();
        const exampleEmbed = new EmbedBuilder()
            .setColor(errorColor)
            .setTitle(`${error.code}`)
            .setAuthor({ name: "vscbot", iconURL: botAvatar })
            .setDescription(`\`\`\`\n${error}\`\`\``)
            .setTimestamp()
            .setFooter({
                text: type,
                iconURL: botAvatar,
            });
        const channel = client.channels.cache.find(
            (channel) => channel.id === logChannelId
        );
        await channel.send({ embeds: [exampleEmbed] });
    } catch (err) {
        console.error(err);
    }
};

export default module
