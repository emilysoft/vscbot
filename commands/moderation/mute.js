const errorLogger = require("../../functions/loggers/errorLogger");
const getIds = require("../../functions/getIds");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "mute",
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Replies with Pong!"),
    desactivated: true,
    description: "Mutea uno o más usuarios.",
    async execute(message) {
        try {
            const muted = message.guild.roles.cache.find(
                (role) => role.name === "Muted"
            );
            if (!muted) {
                await message.channel.send("No existe un rol llamado Muted.");
                return;
            }

            const ids = getIds(message.content);
            if (ids.length == 0) {
                await message.channel.send(
                    "Especifique uno más miembros a mutear."
                );
                return;
            }
            let mutedUsers = [];
            for (id of ids) {
                message.guild.members.cache
                    .get(id)
                    .roles.add(muted, "")
                    .then(() => {
                        console.log("muteado exitosamente");
                        mutedUsers.push(`\n<@${id}> ha sido muteado.`);
                    })
                    .catch((e) => {
                        mutedUsers.push(
                            `\n<@${id}> error al intentar mutearlo.`
                        );
                    });
            }
            await message.channel.send(...mutedUsers);
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};
