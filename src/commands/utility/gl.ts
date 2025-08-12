const GENERAL_1 = "1345943357058187284"
const GENERAL_2 = "1345951301720342528"
const GENERAL_CHANNEL_1 = "813538324320092164"
const GENERAL_CHANNEL_2 = "1345943077470076979"
import {
    SlashCommandBuilder,
    Message,
    TextChannel
} from "discord.js";
import ICommand from "../../interfaces/command.js";
import Client from "../../interfaces/ICustomClient.js";
const module: ICommand = {
    name: "gl",
    description: "cambia de general",
    data: new SlashCommandBuilder()
        .setName("gl")
        .setDescription("cambiar de general"),
    cooldown: 1,
    slashCommand: false,
    allowEdited: false,
    messageCommand: true,
    async run(message: Message, client: Client) {
        try {
            message.delete()
            let channel;
            const member = message.member;
            if (!member) return;
            if (member.roles.cache.has(GENERAL_1)) {
                await member.roles.remove(GENERAL_1)
                await member.roles.add(GENERAL_2)
                channel = message.client.channels.cache.get(GENERAL_CHANNEL_2)
            } else if (member.roles.cache.has(GENERAL_2)) {
                await member.roles.remove(GENERAL_2)
                await member.roles.add(GENERAL_1)
                channel = message.client.channels.cache.get(GENERAL_CHANNEL_1)
            } else {
                await member.roles.add(GENERAL_2)
            }
            if (channel instanceof TextChannel != true) return
            await channel.send(`<@${message.author.id}>`)
                .then(msg => msg.delete())
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};

export default module;
