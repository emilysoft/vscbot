const errorLogger = require("./loggers/errorLogger.js");
module.exports = (message) => {
    const { content, client } = message;
    try {
        if (content.match(/(quien\s+(me\s+)?(lo\s+)?(regala|compra)|regalamelo|compramelo)/)) 
            message.reply("Y si mejor te pones a chambear y lo compras?") 
        
    } catch (err) {
        errorLogger(err, client, "error", import.meta.url);
    }
};
