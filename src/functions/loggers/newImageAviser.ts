import { Message, TextChannel } from "discord.js";

const module = (message:Message) => {
    const size = message.attachments.size;
    const categories = [
        "813538324320092162",
        "836011738662961162",
        "813564125380214785",
        "1122175563688317058",
    ];
    if (categories.includes(message.channel.id) && size > 0) {
        if(!message.member) return
        if (message.member.roles.cache.has("1160312456233619517")) {
            if(!message.guild) return
            const channel = message.guild.channels.cache.get("1160325903461666927")
            if(channel instanceof TextChannel != true) return
                channel.send(`<@${message.author.id}> Enviaron una archivo en <#${message.channel.id}> <@&1160312456233619517>`)
        }
    }
};

export default module
