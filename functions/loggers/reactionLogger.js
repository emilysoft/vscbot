module.exports = (messageReaction, user, type) => {
    let typeMessage = "";
    if (type == "add") {
        typeMessage = "fue agregado";
    } else if (type == "remove") {
        typeMessage = "fue removido";
    } else {
        throw new Error("Error al especificar el tipo de evento");
    }
    today = new Date();
    const now = new Date();
    const date = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const authorID = user.id;
    const channelName = messageReaction.message.channel.name;
    const userName = user.username;
    const emoji = messageReaction.emoji;

    console.log(
        `[REACTION][${date}/${month}/${year}][${hours}:${minutes}][${authorID}][${channelName}][${emoji}] ${typeMessage} por ${userName}`
    );
};
