const module = async (client) => {
    const guild = await client.guilds.cache.get("813538324320092161")
    const channel = await guild.channels.fetch("1024260771326197781")
    channel.send("bot iniciado");
};


export default module
