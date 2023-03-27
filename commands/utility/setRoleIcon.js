const { SlashCommandBuilder, InteractionResponse } = require("discord.js");
const getIds = require("../../functions/getIds");
const errorLogger = require("../../functions/loggers/errorLogger");
const Jimp = require("jimp");
const path = require("node:path");
const { OWNERS_ID } = require("../../config.json");
const formatsAllowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
module.exports = {
    name: "seticon",
    description: "Coloca un icon a un rol",
    data: new SlashCommandBuilder()
        .setName("seticon")
        .setDescription("Coloca un icon a unrol.")
        .addRoleOption((option) =>
            option.setName("role").setDescription("Menciona unrol")
        )
        .addAttachmentOption((option) =>
            option.setName("imagen").setDescription("adjunte una imagen")
        ),
    slashCommand: true,
    messageCommand: true,
    //slash command
    async execute(interaction) {
        try {
            const AUTHOR_ID = interaction.user.id;
            if (!OWNERS_ID.some((id) => id === AUTHOR_ID)) return;
            const image = interaction.options.getAttachment("imagen", true);
            const role = interaction.options.getRole("role", true);
            setRoleIcon(interaction, image, role);
        } catch (err) {
            if (err.code == "CommandInteractionOptionNotFound") {
                interaction.reply({
                    content: "Introduzca los datos requeridos",
                    ephemeral: true,
                });
            } else {
                errorLogger(err, interaction.client, "error");
            }
        }
    },
    //message command
    async run(message) {
        try {
            const AUTHOR_ID = message.author.id;
            if (!OWNERS_ID.some((id) => id === AUTHOR_ID)) return;
            if (!message.attachments.size >= 1) {
                message.reply({
                    content: `Por favor adjunte una imagen.`,
                    allowedMentions: { repliedUser: false },
                });
                return;
            }
            const id = getIds(message.content);
            if (id.length == 0) {
                return message.reply({
                    content: "Por favor especifique una (ID o mención) de usuario.",
                    allowedMentions: { repliedUser: false },
                });
            }
            const targetRole = id[0];
            const role = message.guild.roles.cache.get(targetRole);
            if (!role)
                return message.reply({
                    content: `Especifique una (ID o mención) de rol válida.`,
                    allowedMentions: { repliedUser: false },
                });

            const image = message.attachments.first();
            setRoleIcon(message, image, role);
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};

async function setRoleIcon(interaction, image, role) {
    try {
        //validaciones
        const imageType = image.contentType;
        if (!formatsAllowed.some( format => format === imageType)) {
            return interaction.reply({
                content: "Por favor inserte una imagen jpg/png/webp/gif.",
                allowedMentions: { repliedUser: false },
            });
        }

        await Jimp.read(image)
            .then((input) => {
                return input
                    .resize(150, 150) // resize
                    .writeAsync(
                        path.join(__dirname, `./icons/${interaction.id}.png`)
                    );
            })
            .then(async () => {
                await role
                    .setIcon(
                        path.join(__dirname, `./icons/${interaction.id}.png`),
                        "Nuevo icon para rol"
                    )
                    .then(async () => {
                        await interaction.reply({
                            content: `Icon colocado exitosamente.`,
                            allowedMentions: { repliedUser: false },
                        });
                    });
            });
    } catch (err) {
        errorLogger(err, interaction.client, "error");
    }
}
