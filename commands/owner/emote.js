import errorLogger from "../../functions/loggers/errorLogger.js"
import { SlashCommandBuilder } from "discord.js"

export default {
    name: "emote",
    aliases: ["e"],
    description: "Add emotes",
    usage: "",
    userPerms: ["Administrator"],
    botPerms: [""],
    slashCommand: false,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("emote")
        .setDescription("Add emotes"),
    async run(message, args) {
        try {
            if (message.author.id != "302249242469335060") return;
            addEmote(message);
            deleteEmoji(message);
            changeName(message);
        } catch (err) {
            errorLogger(err, message.client, "error", import.meta.url);
        }
    },
};
async function addEmote(message) {
    let emojisAdded = [];
    let format = "";
    if (message.content.match(/add/gim) == null) return;

    const regex = /<a?:[a-zA-Z_~0-9]+:\d+>/g; // Expresión regular para buscar emotes
    // Obtener los emotes del mensaje
    const emotes = message.content.split(" ").slice(1).join("").match(regex);
    //        const message = "213213"; /* mensaje de Discord.js */
    //        if(startsWith("<a"))
    if (emotes) {
        emotes.forEach(async (emote) => {
            const [matched, name, id] = emote.match(/<a?:(\w+):(\d+)>/); // Obtener el nombre y el ID del emote
            matched.startsWith("<a") ? format = "gif" : format = "png";
            const emoteURL = `https://cdn.discordapp.com/emojis/${id}.${format}`; // Construir la URL del emote
            console.log(`Insertando: ${name}`);
            await message.guild.emojis
                .create({ attachment: emoteURL, name: name })
                .then(() => {
                    emojisAdded.push(`**${emoji.name}** :white_check_mark:`);
                })
                .catch((e) => emojisAdded.push(`**${name}** :x:`));
        });
        //await message.reply(`${emojisAdded.join("\n")}`);
        await message.reply(`agregando`);
    }
}
async function deleteEmoji(message) {
    const regex = /:[a-zA-Z0-9_~]+:/;
    let emojisDeleted = [];

    if (message.content.match(/delete/gim) == null) return;
    const args = message.content.split(/\s+/g).slice(1).join("");
    const argsFormatted = args.split(/[>\s\n]+/g);
    console.log(argsFormatted);
    const emojis = await message.guild.emojis.fetch();

    argsFormatted.forEach(async (name) => {
        const match = name.match(regex);
        if (!match) return;
        const palabra = match[0].slice(1, -1);
        console.log(palabra);
        let emoji = emojis.find((e) => e.name === palabra);
        if (emoji) {
            emojisDeleted.push(`**${emoji.name}** :white_check_mark:`);
            await emoji.delete(emoji).catch((e) => {
                console.error(e);
            });
        } else {
            emojisDeleted.push(`**${name}** :x:`);
        }
    });
    await message.reply(`${emojisDeleted.join("\n")}`);
}

async function changeName(message) {
    if (message.content.match(/change/gim) == null) return;
    const args = message.content.split(" ").slice(2);
    const oldName = args[0];
    const newName = args[1];
    const guild = message.guild;
    const emojis = await guild.emojis.fetch();
    const emoji = emojis.find((emoji) => emoji.name === oldName);
    if (emoji) {
        emoji
            .edit({ name: newName })
            .then(() =>
                message.reply(
                    `Nombre de emote cambiado ${oldName} ➜ ${newName}`
                )
            )
            .catch((e) => {
                console.error(e);
                message.channel.send("hubo un error");
            });
    } else {
        message.channel.send("Emote no conseguido.");
    }
}

//            if (message.content.startsWith(">change")) {
//                const guild = message.guild;
//                const emojis = await guild.emojis.fetch();
//                emojis.forEach((emoji) => {
//                    if(emoji.name.match(/([_~]|^[A-Z])/)) {
//                        console.log(emoji.name);
//                    }
//                })
//            }
