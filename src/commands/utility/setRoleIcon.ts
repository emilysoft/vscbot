import {
    Attachment,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    Role,
    Message,
} from "discord.js";
import getIds from "../../functions/lib/getIds.js";
import Jimp from "jimp";
import path from "node:path";
import config from "../../config.json" with {type:"json"}
import ICommand from "../../interfaces/command.js";
import Client from "../../interfaces/ICustomClient.js";
const formatsAllowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const module: ICommand = {
    name: "seticon",
    description: "Coloca un icon a un rol",
    // Type 'SlashCommandOptionsOnlyBuilder' is missing the following properties from type 'SlashCommandBuilder': addSubcommandGroup, addSubcommand
    data: new SlashCommandBuilder()
        .setName("seticon")
        .setDescription("Coloca un icon a unrol."),
    //.addRoleOption((option) =>
    //    option.setName("role").setDescription("Menciona unrol")
    //)
    //.addAttachmentOption((option) =>
    //    option.setName("imagen").setDescription("adjunte una imagen")
    //)
    slashCommand: true,
    messageCommand: true,
    //slash command
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        try {
            interaction.deferReply({ ephemeral: true });
            const AUTHOR_ID = interaction.user.id;
            if (!config.OWNERS_ID.some((id) => id === AUTHOR_ID)) return;
            const image = interaction.options.getAttachment("imagen", true);
            const role = interaction.options.getRole("role", true);
            if (role instanceof Role != true) return;
            setRoleIcon(interaction, image, role, client);
        } catch (err: any) {
            if (err.code == "CommandInteractionOptionNotFound") {
                interaction.followUp({
                    content: "Introduzca los datos requeridos",
                    ephemeral: true,
                });
            } else {
                client.errorLogger(err, client, "error", process.cwd() + " ");
            }
        }
    },
    //message command
    async run(message: Message, client: Client) {
        try {
            const AUTHOR_ID = message.author.id;
            if (!config.OWNERS_ID.some((id) => id === AUTHOR_ID)) return;
            if (!message.attachments.size && message.attachments.size >= 1) {
                message.reply({
                    content: `Por favor adjunte una imagen.`,
                    allowedMentions: { repliedUser: false },
                });
                return;
            }
            const id = getIds(message.content);
            if (id.length == 0) {
                message.reply({
                    content:
                        "Por favor especifique una (ID o mención) de usuario.",
                    allowedMentions: { repliedUser: false },
                });
                return;
            }
            const targetRole = id[0];
            if (!message.guild) return;
            const role = message.guild.roles.cache.get(targetRole);
            if (!role) {
                message.reply({
                    content: `Especifique una (ID o mención) de rol válida.`,
                    allowedMentions: { repliedUser: false },
                });
                return;
            }

            const image = message.attachments.first();
            if (!image) return;
            setRoleIcon(message, image, role, client);
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};

async function setRoleIcon(
    interaction: ChatInputCommandInteraction | Message,
    image: Attachment,
    role: Role,
    client:Client
) {
    try {
        if (interaction instanceof ChatInputCommandInteraction) {
            //validaciones
            const imageType = image.contentType;
            if (!formatsAllowed.some((format) => format === imageType)) {
                return interaction.followUp({
                    content: "Por favor inserte una imagen jpg/png/webp/gif.",
                    allowedMentions: { repliedUser: false },
                });
            }

            await Jimp.read(image.url)
                .then((input) => {
                    return input
                        .resize(150, 150) // resize
                        .writeAsync(
                            path.join(
                                process.cwd(),
                                `/icons/${interaction.id}.png`
                            )
                        );
                })
                .then(async () => {
                    await role
                        .setIcon(
                            path.join(
                                process.cwd(),
                                `/icons/${interaction.id}.png`
                            ),
                            "Nuevo icon para rol"
                        )
                        .then(async () => {
                            await interaction.followUp({
                                content: `Icon colocado exitosamente.`,
                                allowedMentions: { repliedUser: false },
                            });
                        });
                });
        }
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
}

export default module;
