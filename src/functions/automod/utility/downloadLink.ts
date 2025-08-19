import { Message, TextChannel } from "discord.js"
import VideoDownloader from "../../../functions/lib/downloadMedia.js"
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"

const regex =
    /https?:\/\/(?:www\.)?facebook\.com\/(?:(?:watch\/?\?v=)|(?:share\/(v|r)\/)|(?:[a-zA-Z0-9.]+\/videos\/)|(?:reel\/))[a-zA-Z0-9]+\/?/gim
export default {
    name: "downloadLink",
    exclusive: false,
    ignoreBots: true,
    allowEdited: false,
    execute: async function (message: Message, client: Client) {
        try {
            if (!message.member) return
            if (!message.guild) return
            if (message.channel instanceof TextChannel != true) return
            if (message.content === "" || !message.content) return
            if (/^(>|\.)\s*dl/.test(message.content)) return
            const match = message.content.match(regex)
            if (!match) return
            message.channel.sendTyping();
            message.suppressEmbeds(true)
            message.suppressEmbeds(true)
            const link = match[0]
            new VideoDownloader(message, false).downloadFacebookVideo(link)
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod
