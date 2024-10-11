const module = async (interaction) => {
    const now = new Date();
    const date = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const commandName = interaction.commandName;
    const authorID = interaction.user.id;
    const channelName = interaction.channel.name;
    const userName = interaction.user.username;
    console.log(
        `[COMMAND SLASH][${date}/${month}/${year}][${hours}:${minutes}][${authorID}][${channelName}] ${userName}: \/${commandName}`
    );
};

export default module
