const { EmbedBuilder } = require("discord.js");
module.exports = async (error, client, type) => {
    try {
        let errorColor
        if(type == 'error') {
            errorColor = '#FF0000'
            console.error(error);
        } else if(type == 'warn') {
            errorColor = '#FFFF00'
            console.warn(error)
        } else {
            throw new Error('Error en especificar el type de error')
        }
        const logChannelId = "1085335051732009113";
        const botAvatar = client.user.displayAvatarURL(); 
        const exampleEmbed = new EmbedBuilder()
            .setColor(errorColor)
            .setTitle(`${error.code}`)
            .setAuthor({ name: "vscbot", iconURL: botAvatar })
            .setDescription(`\`\`\`\n${error}\`\`\``)
            .setTimestamp()
            .setFooter({
                text: type,
                iconURL: botAvatar,
            });
        const channel = client.channels.cache.find(
            (channel) => channel.id === logChannelId
        );
        await channel.send({ embeds: [exampleEmbed] });
    } catch (err) {
        console.error(err);
    }
};
