const { SlashCommandBuilder } = require("discord.js");
const getIds = require("../../functions/getIds");
const errorLogger = require("../../functions/loggers/errorLogger");
const modId = "813568302294761486";
module.exports = {
    name: "getmention",
    description: "pasa ids a menciones",
    data: new SlashCommandBuilder()
        .setName("getmention")
        .setDescription("Convierte ids a menciones")
        .addStringOption((option) =>
            option.setName("id").setDescription("ingrese una id")
        ),
    slashCommand: true,
    messageCommand: true,
    async execute(interaction) {
        try {
            // it works if the user has the encargadorrol
            if (
                !interaction.member.roles.cache.some(
                    (role) => role.id === modId
                )
            )
                return;
            const input = interaction.options.getString("id", true);
            getMention(interaction, input);
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
    async run(message) {
        try {
            if (!message.member.roles.cache.some((role) => role.id === modId))
                return;
            getMention(message, message.content);
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};

function getMention(interaction, input) {
    const ids = getIds(input);
    const respond = [];
    for (id of ids) {
        respond.push(`<@${id}>`);
    }
    if (ids.length == 0) {
        interaction.reply({
            content: `Por favor especifique una (ID o mención).`,
            allowedMentions: {
                repliedUser: false,
            },
        });
        return;
    }
    interaction.reply({
        content: `${respond.join("\n")}`,
        allowedMentions: { repliedUser: false },
    });
}
