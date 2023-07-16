const errorLogger = require("./loggers/errorLogger");
module.exports = (message) => {
    try {
        const regex = /\.\s*t\s+g\s*b/gim;
        if (message.content.match(regex) != null) message.delete();
    } catch (err) {
        errorLogger(err, message.client, "error")
    }
};
