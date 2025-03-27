import { ChatInputCommandInteraction, Message, Role, SlashCommandBuilder } from "discord.js"
import getIds from "../../functions/getIds.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
const modId = "813568302294761486";
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
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
    async execute(interaction, client) {
        try {
            // it works if the user has the encargadorrol
            if(!interaction.guild) return
            const guild = client.guilds.cache.get(interaction.guild.id)
            const member = guild?.members.cache.get(interaction.user.id)
            if(!member) return
            if(member.roles.cache.some((role:Role) => role.id === modId)) return

            const input = interaction.options.getString("id", true);
            getMention(interaction, input);
        } catch (err:any) {
            if (err.code == "CommandInteractionOptionNotFound") {
                interaction.reply({
                    content: "Introduzca los datos requeridos",
                    ephemeral: true,
                });
            } else {
                errorLogger(err, client, "error", process.cwd() + " ");
            }
        }
    },
    async run(message, client) {
        try {
            if (!message.member?.roles.cache.some((role) => role.id === modId))
                return;
            getMention(message, message.content);
        } catch (err) {
            errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};

function getMention(interaction:ChatInputCommandInteraction | Message, input:string) {
    const ids = getIds(input);
    const respond = [];
    for (const id of ids) {
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

export default module