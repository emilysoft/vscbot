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
    console.log(
        `[${today.getDate()}/${
            today.getMonth() + 1
        }/${today.getFullYear()}][${today.getHours()}:${today.getMinutes()}][${
            user.id
        }][${messageReaction.message.channel.name}][${
            messageReaction.emoji
        }] ${typeMessage} por ${user.username}`
    );
};
