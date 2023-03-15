const {
    joinVoiceChannel,
    NoSubscriberBehavior,
    createAudioPlayer,
    createAudioResource,
} = require("@discordjs/voice");

module.exports = async (client) => {
    const guild = await client.guilds.cache.get("813538324320092161");
    const channel = guild.channels.cache.get("844030463530369054");
    if (!channel) return console.error("The channel does not exist!");
    const connection = await joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    // Subscribe the connection to the audio player (will play audio on the voice connection)
    //   reproducir();
    //    setInterval(() => {
    //        reproducir();
    //    }, 40000);

    function reproducir() {
        let resource = createAudioResource(
            //"C:\\Discord Bots\\vsc-bot\\youtube.mp3"
            "C:\\Discord Bots\\vsc-bot\\Bebé llorando con autotune-5-PQhF7JzIM.mp3"
        );
        let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        player.play(resource);
        console.log("reproduciendo");
        connection.subscribe(player);
        if (subscription) {
            // Unsubscribe after 5 seconds (stop playing audio on the voice connection)
            setTimeout(() => subscription.unsubscribe(), 5_000);
        }
    }
};
