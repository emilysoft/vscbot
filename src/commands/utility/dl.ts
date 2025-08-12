import { SlashCommandBuilder, Message, TextChannel } from "discord.js"
import ICommand from "../../interfaces/command.js"
import VideoDownloader from "../../functions/lib/downloadMedia.js"
const FACEBOOK_REGEX = /(https:\/\/www\.)?facebook.com/;
const INSTAGRAM_REGEX = /(https:\/\/www\.)?instagram.com/;
const YOUTUBE_REGEX = /(https:\/\/www\.)?(youtube|youtu)(\.be|\.com)/;
const module: ICommand = {
    name: "dl",
    //category: "utility",
    description: "download a facebook video",
    slashCommand: false,
    allowEdited: false,
    cooldown: 2,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("dl")
        .setDescription("download a facebook video"),
    async execute(interaction, client) {
        try {
            //
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
    async run(message, client, args) {
        try {
            main(message, args)
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};

async function main(message: Message, args: string | undefined) {
    if (message.channel instanceof TextChannel != true) return
    message.channel.sendTyping()
    if (message.channel instanceof TextChannel != true) return


    let link = "";
    const replyMessageId = message.reference?.messageId
    if (replyMessageId) {
        const replyMessage = await message.channel.messages.fetch(replyMessageId)
        if (replyMessage.embeds) {
            const URL = replyMessage.embeds[0].data.url;
            if (!URL) return
            link = URL
            console.log(link)
        } else if (replyMessage.content) {
            link = replyMessage.content.split(/ +/)[0]
            console.log(link)
        }

    }
    else if (args) {
        link = args.split(/ +/)[0]
    } else {
        return message.channel.send("inserte un link")
            .then((msg) => {
                setTimeout(() => {
                    msg.delete()
                }, 3000);
            })
    }
    if (FACEBOOK_REGEX.test(link)) {

        new VideoDownloader(message, true).downloadFacebookVideo(link)
    }
    else if (INSTAGRAM_REGEX.test(link)) {
        new VideoDownloader(message).downloadInstagramVideo(link)
    }

    else if (YOUTUBE_REGEX.test(link)) {
        new VideoDownloader(message).downloadYouTubeVideo(link)
    }
}
export default module
