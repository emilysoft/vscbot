module.exports = async (message, type) => {
    let typeLog;
    if (type == "create") typeLog = "[MESSAGE CREATED]";
    else if (type == "delete") typeLog = "[MESSAGE DELETED]";
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
    const channelName = message.channel.name;
    const userName = message.author.username;
    let messageContent;
    if (message.content == "") {
        if (message.attachments.size > 0) {
            messageContent = "imagen(es)";
        } else if(message.embeds.length > 0) {
            messageContent = "Embed"
        } else if(message.stickers.size > 0) {
            message.stickers.forEach( sticker => {
                messageContent = `sticker: ${sticker.name}`
            });
        }
    } else {
        messageContent = message.content;
    }
    console.log(
        `${typeLog}[${date}/${month}/${year}][${hours}:${minutes}][${authorID}][${channelName}] ${userName}: ${messageContent}`
    );
};
