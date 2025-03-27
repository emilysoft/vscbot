import errorLogger from "../../functions/loggers/errorLogger.js"
import { Message, SlashCommandBuilder, TextChannel } from "discord.js"
import Client from "../../classes/ICustomClient.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "emote",
    description: "Add emotes",
    //aliases: ["e"],
    //usage: "",
    //userPerms: ["Administrator"],
    //botPerms: [""],
    slashCommand: false,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("emote")
        .setDescription("Add emotes"),
    async run(message: Message, client:Client,args: string) {
        try {
            if (message.author.id != "302249242469335060") return;
            addEmote(message);
            deleteEmoji(message);
            changeName(message);
        } catch (err) {
            errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};
async function addEmote(message: Message) {
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
            // Obtener el nombre y el ID del emote
            const matchResult: RegExpMatchArray | null = emote.match(/<a?:(\w+):(\d+)>/);
            if(!matchResult || matchResult.length === 3) return
            const [matched, name, id] : RegExpMatchArray = matchResult;
            const emoteURL = `https://cdn.discordapp.com/emojis/${id}.${format}`; // Construir la URL del emote
            console.log(`Insertando: ${name}`);
            if(!message.guild) return
            await message.guild.emojis
                .create({ attachment: emoteURL, name: name })
                .then(emoji => {
                    emojisAdded.push(`**${emoji.name}** :white_check_mark:`);
                })
                .catch((e) => emojisAdded.push(`**${name}** :x:`));
        });
        //await message.reply(`${emojisAdded.join("\n")}`);
        await message.reply(`agregando`);
    }
}
async function deleteEmoji(message: Message) {
    const regex = /:[a-zA-Z0-9_~]+:/;
    let emojisDeleted: string[] = [];

    if (message.content.match(/delete/gim) == null) return;
    const args = message.content.split(/\s+/g).slice(1).join("");
    const argsFormatted = args.split(/[>\s\n]+/g);
    console.log(argsFormatted);
    if(!message.guild) return
    const emojis = await message.guild.emojis.fetch();

    argsFormatted.forEach(async (name) => {
        const match = name.match(regex);
        if (!match) return;
        const palabra = match[0].slice(1, -1);
        console.log(palabra);
        let emoji = emojis.find((e) => e.name === palabra);
        if (emoji) {
            emojisDeleted.push(`**${emoji.name}** :white_check_mark:`);

                //await message.reply(`${emojisAdded.join("\n")}`);
            if(!message.guild) return
           await message.guild.emojis
                .delete(emoji)
            .catch((e) => {
                console.error(e);
            });
        } else {
            emojisDeleted.push(`**${name}** :x:`);
        }
    });
    await message.reply(`${emojisDeleted.join("\n")}`);
}

async function changeName(message:Message) {
    if (message.content.match(/change/gim) == null) return;
    const args = message.content.split(" ").slice(2);
    const oldName = args[0];
    const newName = args[1];
    const guild = message.guild;
    if(!guild) return
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
                    if(message.channel instanceof TextChannel) 
                    message.channel.send("hubo un error");
            });
    } else {
        if(message.channel instanceof TextChannel)  {
            await message.channel.sendTyping()
            await message.channel.send("Emote no conseguido.");
        }

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

export default module