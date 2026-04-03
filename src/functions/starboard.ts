import { MessageReaction, TextChannel, User } from "discord.js";

const CONFIG = {
    emote: 'kek',
    threshold: 6,
    channelId: '872866069767917598'
};

const postedMessages = new Set<string>();

const module = async (reaction:MessageReaction, user: User ) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            return;
        }
    }

    const { message, emoji, count } = reaction;

    if (emoji.name !== CONFIG.emote && emoji.id !== CONFIG.emote) return;
    if (count < CONFIG.threshold) return;
    if (postedMessages.has(message.id)) return;

    const channel = reaction.client.channels.cache.get(CONFIG.channelId) as TextChannel;
    if (!channel) return;

    const content = message.content ? `\n\n${message.content}` : '';
    const attachment = message.attachments.first()?.url || '';

    const starboardMessage = [
        `${emoji} **${count}** | ${message.url}`,
        content,
        attachment
    ].filter(line => line !== '').join('\n');

    try {
        await channel.send(starboardMessage);
        postedMessages.add(message.id);
    } catch (err) {
        console.error('Error al enviar el meme:', err);
    }

}

export default module
