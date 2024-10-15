import { MessageReaction, TextChannel, User } from "discord.js";

const module = (messageReaction:MessageReaction, user:User, type:string) => {
    let typeMessage = "";
    if (type == "add") {
        typeMessage = "fue agregado";
    } else if (type == "remove") {
        typeMessage = "fue removido";
    } else {
        throw new Error("Error al especificar el tipo de evento");
    }
    const today = new Date();
    const now = new Date();
    const date = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const authorID = user.id;
    if(messageReaction.message.channel instanceof TextChannel != true) return
    const channelName = messageReaction.message.channel.name;
    const userName = user.username;
    const emoji = messageReaction.emoji;

    console.log(
        `[REACTION][${date}/${month}/${year}][${hours}:${minutes}][${authorID}][${channelName}][${emoji}] ${typeMessage} por ${userName}`
    );
};
export default module
