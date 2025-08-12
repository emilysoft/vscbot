import { MessageFlags, SlashCommandBuilder } from "discord.js"
import config from "../../config.json" with {type: "json"}
import ICommand from "../../interfaces/command.js"
import RoleManager from "../../functions/lib/RoleManager.js";

const module: ICommand = {
    name: "role",
    description: "Gestiona roles",
    slashCommand: true,
    messageCommand: false,
    allowEdited: false,
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("gestion de roles")
        .addSubcommand(subcommand =>
            subcommand
                .setName("crear")
                .setDescription("Crea un rol personalizado")
                .addStringOption((option) =>
                    option.setName("nombre").setDescription("ingrese nombre").setRequired(true))
                .addAttachmentOption((option) =>
                    option.setName("icon").setDescription("Colocar icono").setRequired(true))
                .addUserOption((option) =>
                    option.setName("usuario").setDescription("Asignar a un usuario").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("cambiar")
                .setDescription("Cambia tu icon personalizado")
                .addAttachmentOption((option) =>
                    option.setName("icon").setDescription("tu icono")
                )
                .addStringOption(option =>
                    option.setName("nombre").setDescription("cambia el nombre de tu role personalizado")
                )
        ),
    async execute(interaction, client) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const subcommand = interaction.options.getSubcommand();
            const AUTHOR_ID = interaction.user.id;
            const roleManager = new RoleManager(interaction)


            switch (subcommand) {
                case "cambiar": {
                    await roleManager.updateCustomRoleName()
                        .then(() => {
                            interaction.editReply({ content: "role cambiado exitosamente" })
                        });
                    break;

                } case "crear": {

                    if (!config.OWNERS_ID.some((id) => id === AUTHOR_ID)) throw new Error("comando no autorizado");
                    await roleManager.createCustomRole()
                        .then(() => {
                            interaction.editReply({ content: "role creado exitosamente" })
                        }

                        )
                        ; break;
                }
            }

        } catch (err: any) {
            if (err.code == "CommandInteractionOptionNotFound") {
                interaction.editReply({
                    content: "Introduzca los datos requeridos"
                });
                return
            }

            interaction.editReply({
                content: `${err}`
            });
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
};

export default module
