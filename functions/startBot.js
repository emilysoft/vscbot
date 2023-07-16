module.exports = client => {
    const guild = client.guilds.cache.get("813538324320092161")
    const channel = guild.channels.cache.get("1024260771326197781")
    channel.send("bot iniciado")
}