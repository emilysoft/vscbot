const errorLogger = require("./loggers/errorLogger.js");
module.exports = (message) => {
    const { content, client } = message;
    try {
        if (content.match(/^\.\s*dl\s+https/i)) 
            message.delete() 
        
    } catch (err) {
        errorLogger(err, client, "error");
    }
};
