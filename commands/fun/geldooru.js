const { SlashCommandBuilder } = require("discord.js");
const errorLogger = require("../../functions/loggers/errorLogger");
module.exports = {
    name: "cats",
    data: new SlashCommandBuilder()
        .setName("gel")
        .setDescription("Busca algo en geldooru"),
    description: "Busca algo en geldooru",
    messageCommand: true,
    slashCommand: false,
    async execute(interaction) {
        geldooru(interaction);
    },
    async run(message) {
        geldooru(message);
    },
};

async function geldooru(message) {
    try {
        const channelId = message.channel.id;
        if (!channelId == "1024260771326197781") return;
        if (!channelId == "813564359874838558") return;

        if (message.channel.nsfw) {
            const query = message.content
                .split(" ")
                .slice(1)
                .join(" ")
                .replace(/\s+/g, " ")
                .replace(/\s/g, "%20");
            console.log(query);
            if (!query) {
                message.channel.send("especifique algo chuchamadre");
                return;
            }

            const limit = 200,
                tags = query,
                token =
                    "&api_key=cffa0a9a093571bb17a5eeaa68114a5d64730c62d9e565227591d95f65710b98&user_id=1232751",
                json = 1;

            console.log(query);
            const request = `https://gelbooru.com/index.php?page=dapi\&s=post&q=index&limit=${limit}&tags=${tags}&json=${json}&token=${token}`;
            await fetch(request)
                .then(async (response) => {
                    const data = await response.json();
                    if (data.post) {
                        const image =
                            data.post[
                                Math.floor(Math.random() * data.post.length)
                            ].file_url;
                        await message.channel.send(image);
                    } else {
                        await message.channel.send(
                            "No se encontró lo especificado, intenta algo como genshin_impact futanari"
                        );
                    }
                })
                .catch(() => {
                    message.channel.send("hubo un error, intenta de nuevo");
                });
        } else {
            message.channel.send("<#813564359874838558>");
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
}
