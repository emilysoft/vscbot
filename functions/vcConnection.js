import {
    joinVoiceChannel,
    NoSubscriberBehavior,
    createAudioPlayer,
    createAudioResource,
} from "@discordjs/voice"
import errorLogger from "./loggers/errorLogger.js"

const module = async (client) => {
    try {
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
                "C:\\Discord Bots\\vsc-bot\\gaitas.mp3"
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
    } catch(err) {
        errorLogger(err, client, "error", import.meta.url)
    }
};
export default module
