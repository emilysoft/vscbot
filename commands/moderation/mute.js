import errorLogger from "../../functions/loggers/errorLogger.js"
import getIds from "../../functions/getIds.js"
import { SlashCommandBuilder } from "discord.js"
import config from "../../config.json" with {type:"json"}
const module = {
    name: "mute",
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mutea uno o más usuarios.")
        .addUserOption((option) =>
            option.setName("id").setDescription("ingrese una id")
        ),
    slashCommand: false,
    messageCommand: true,
    description: "Mutea uno o más usuarios.",
    async execute(interaction) {
        try {
            mute(interaction);
        } catch (err) {
            if (err.code == "CommandInteractionOptionNotFound") {
                interaction.reply({
                    content: "Introduzca los datos requeridos",
                    ephemeral: true,
                });
            } else {
                errorLogger(err, interaction.client, "error")
            }
        }
    },
    async run(message) {
        mute(message);
    },
};

async function mute(interaction) {
    try {
        if (!config.OWNERS_ID.some((id) => id === message.author.id)) return;
        const muted = message.guild.roles.cache.find(
            (role) => role.name === "Muted"
        );
        if (!muted) {
            await interaction.reply({
                content: "No existe un rol llamado Muted.",
                allowedMentions: { repliedUser: false },
            });
            return;
        }

        const ids = getIds(message.content);
        if (ids.length == 0) {
            await interaction.reply({
                content:
                    "Especifique uno más miembros a mutear. (ID o mención)",
                allowedMentions: { repliedUser: false },
            });
            return;
        }
        let mutedUsers = [];
        await interaction.guild.members.fetch({ user: ids }).then((members) => {
            for (id of ids) {
                members.forEach((member) => {
                    if (member.id === id) {
                        member.roles
                            .add(muted, "")
                            .then(() => {
                                console.log(
                                    `${member.user.username} muteado exitosamente`
                                );
                                mutedUsers.push(`\n<@${id}> ha sido muteado.`);
                            })
                            .catch(() => {
                                mutedUsers.push(
                                    `\n<@${id}> error al intentar mutearlo.`
                                );
                            });
                    }
                });
            }
            console.log(mutedUsers);
        });
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
}
export default module
