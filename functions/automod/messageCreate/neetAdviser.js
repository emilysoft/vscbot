const notifier = require("node-notifier");
const regex = require("regexs");
const neet = regex.neet;
const path = require("path");
module.exports = (message) => {
    if (message.content.search(neet) != null) {
        notifier.notify({
            title: message.author.username,
            message: message.content,
            icon: path.join(__dirname, "discord.png"),
            wait: true,
        });
    }
};
