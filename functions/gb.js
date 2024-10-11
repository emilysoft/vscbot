import errorLogger from "./loggers/errorLogger.js"
const module = (message) => {
    try {
        const regex = /\.\s*t\s+g\s*b/gim;
        if (message.content.match(regex) != null) message.delete();
    } catch (err) {
        errorLogger(err, message.client, "error")
    }
};

export default module