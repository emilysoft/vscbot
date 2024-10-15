import Client from "../../classes/ICustomClient.js"
import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js"
import fs from "fs"
import path from "path"
enum tipo {
    error = "error",
    warn = "warn"
}
const module = async (error:any, client:Client, type:string, dir = "") => {
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
        if (type == tipo.error) {
            errorColor = "#FF0000";
            console.error(error);
        } else if (type == tipo.warn) {
            errorColor = "#FFFF00";
            console.warn(error);
        } else {
            throw new Error("Error en especificar el type de error");
        }
        const logChannelId = "1085335051732009113";
        if(!client.user) return
        const botAvatar = client.user.displayAvatarURL();
        const exampleEmbed = new EmbedBuilder()
            .setColor(errorColor as ColorResolvable)
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
        if(channel instanceof TextChannel != true) return
        await channel.send({ 
            content: `<@&1294149003696410665> Error encontrado en: ${dir}`,
            embeds: [exampleEmbed] 
        });
    } catch (err) {
        console.error(err);
    }
};

export default module
