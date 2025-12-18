import { Message, TextChannel } from "discord.js";
import Client from "../../interfaces/ICustomClient.js"
import { DB_User, DB_Channel, DB_Server } from "../../db/Idatabase.js";
const module = async (message: Message, type: string, client: Client) => {
    try {
        const categories = [
            "813538324320092162",
            "836011738662961162",
            "813564125380214785",
            "1122175563688317058",
        ];
        if (message.content.match(/^\$wa/) != null) return
        const {  author, channel, guild } = message;
        if (!guild || !author || !channel ) return
        if (channel instanceof TextChannel != true) return
        if (channel.id == "821067797157118013") return //mudae
        if (channel.parentId == "1169624626188521563") return //registro principales
        if (channel.parentId == "1120080747668197436") return //registro secundarios
        if (channel.id == "1024260771326197781") return; // panel
        if (channel.id == "813562363243921459") return; // memes
        let typeLog;
        if (type == "create") typeLog = ":green_circle:";
        else if (type == "delete") typeLog = ":red_circle:";
        else if (type == "edit") typeLog = ":orange_circle:";
        else {
            throw new Error(
                "Error al especificar el tipo de evento de mensaje para el messageLogger"
            );
        }

        const now = new Date();
        const date = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        const authorID = message.author.id;
        if (message.channel instanceof TextChannel != true) return
        const channelName = message.channel.name;
        const userName = message.author.username;
        let messageContent = "";

        if (message.content == "") {
            if (message.attachments.size > 0) {
                messageContent = message.attachments.reduce((acc, curr) => acc + "\n" + curr.url, "");
            } else if (message.embeds.length > 0) {
                messageContent = "Embed";
            } else if (message.stickers.size > 0) {
                message.stickers.forEach((sticker) => {
                    messageContent = `sticker: ${sticker.name}`;
                });
            }
        } else {
            messageContent = message.content;
        }
        const log1 = `[${typeLog}][${date}/${month}/${year}][${hours}:${minutes}][${authorID}][${channelName}] ${userName}: ${messageContent}`;
        console.log(log1);

        if (!message.guild) return
        if (message.guild.id != "813538324320092161") return
        if (categories.includes(message.channel.parentId as string)) {
            const log = `${typeLog} __[#${channelName.replace(/[^a-zA-Z0-9-]+/, "")}](<https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}>)__ **${userName}**: ${messageContent} ||userID:[${authorID}]||`;
            const { guild } = message;
            if (!guild) return
            //onlyvsc
            const channel = guild.channels.cache.get("1160325903461666927")
            if (!channel) return
            if (channel instanceof TextChannel)
                channel.send(
                    log
                        .replace(/<@/gim, "<!@")
                        .replace(/@everyone/gim, "@!everyone")
                        .replace(/@here/gim, "@!here")
                );
        }

        if (type != "create") return

        const owner = await guild.fetchOwner()
        const user_db = await client.db.users.get(author) as DB_User
        const server_db = await client.db.guild.get(guild, owner.user) as DB_Server
        if(!server_db?.id) throw new Error("error al buscar id de server_db")
        const channel_db = await client.db.channels.get(channel, server_db.id) as DB_Channel

        if (!user_db|| !server_db|| !user_db.id) {
            console.error("Usuario o Servidor DB no encontrado/creado.");
            return false;
        }

        await client.db.logs.create({
            server_id: server_db.id,
            channel_id: channel_db.id,
            user_id: user_db.id,
            interaction: message.content,
            logType: "MESSAGE CREATED",
            creation_date: `${date}/${month}/${year}_${hours}:${minutes}`
        })

    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
};

export default module
