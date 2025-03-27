import { ChatInputCommandInteraction, TextChannel } from "discord.js";
const module = async (interaction: ChatInputCommandInteraction) => {
    const now = new Date();
    const date = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const commandName = interaction.commandName;
    const authorID = interaction.user.id;
    if(!interaction.channel) return
    const channel = interaction.channel;

    if(channel instanceof TextChannel != true) return
    const channelName = channel.name;
    const userName = interaction.user.username;
    console.log(
        `[COMMAND SLASH][${date}/${month}/${year}][${hours}:${minutes}][${authorID}][${channelName}] ${userName}: \/${commandName}`
    );
};

export default module
