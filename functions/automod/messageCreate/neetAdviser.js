import notifier from "node-notifier"
import regex from "regexs.js"
const neet = regex.neet;
import path from "path"
const module = (message) => {
    if (message.content.search(neet) != null) {
        notifier.notify({
            title: message.author.username,
            message: message.content,
            icon: path.join(__dirname, "discord.png"),
            wait: true,
        });
    }
};

export default module
