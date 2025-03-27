async function remove(channel) {
    try 
    {
        const messages = await channel.messages.fetch(50);
        const messagesToDelete = [];
        for (const [id, message] of messages) 
        {
            if (message.attachments.size == 0) 
            {
            messagesToDelete.push(message.id);
            }
        }
        console.log("borrando mensajes")
        await channel.bulkDelete(messagesToDelete)
            
    } catch(e) {
        console.log(e)
    }
}
