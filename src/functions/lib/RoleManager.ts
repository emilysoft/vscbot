import { User, Guild, Attachment, ChatInputCommandInteraction, Role, RoleCreateOptions } from "discord.js"
const formatsAllowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
import { Jimp } from "jimp"
import client from "../../index-vsc.js"
import { DB_Role, DB_CustomRole } from "../../db/Idatabase.js"
import dotenv from "dotenv";
import path from "path"
dotenv.config();
const icon_dir = process.env.CUSTOM_ICONS_DIR || "/var/vscbot/custom_roles/"
class RoleManager {

    private interaction: ChatInputCommandInteraction
    private guild: Guild
    private user: User

    constructor(interaction: ChatInputCommandInteraction) {
        if (!interaction.inGuild()) {
            throw new Error("El comando solo se puede usar en un servidor")
        }

        this.interaction = interaction;
        this.guild = interaction.guild as Guild;
        this.user = interaction.user;
    }
    public async createRole(): Promise<Role | undefined> {
        const roleData = await this.setupRoleData()
        return await this.guild.roles.create(roleData)
    }

    public async assignRole(role: Role, user: User): Promise<Role | undefined> {
        if (!this.interaction.guild) throw new Error("error al encontrar el servidor")
        const member = await this.interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            throw new Error("no se pudo encontrar el usuario")
        }
        await member.roles.add(role);

        return role
    }

    public async createCustomRole(): Promise<void> {
        const user = this.interaction.options.getUser("usuario", true);
        const existingCustomRole = await client.db.roles.custom.get(user.id, this.guild.id)
        if (existingCustomRole != undefined) throw new Error("ya existe el custom role")
        const role = await this.createRole()
        if (!role) throw new Error("error al crear role")
        if (!user) {
            throw new Error("Falta usuario")
        }
        await this.assignRole(role, user)
        await this.saveCustomRole(role, user, this.guild)
    }

    private async saveCustomRole(role: Role, user: User, guild: Guild) {
        await client.db.roles.custom.create(role, user, guild)
    }




    public async updateCustomRoleName() {
        let customRole_db: DB_Role | undefined;

        customRole_db = await client.db.roles.custom.get(this.user.id, this.guild.id)
        if (customRole_db == undefined) throw new Error("no tienes un rol personalizado")

        const role = await this.guild.roles.fetch(customRole_db.role_id)
        if (!role) throw new Error("error al buscar el role en el servidor")

        const roleName = this.interaction.options.getString("nombre", false)
        if (roleName == undefined) throw new Error("nombre a colocar al rol no encontrado")

        await role.setName(roleName)
        await this.setIconToRole()
    }


    public async setIconToRole() {

        const custom_role_db = await client.db.roles.custom.get(this.user.id, this.guild.id)
        if (custom_role_db?.role_id == undefined) throw new Error("error no se consiguio role")

        const role = await this.guild.roles.fetch(custom_role_db.role_id)
        const iconPath = await this.processAndSaveIcon();

        if (!iconPath) throw new Error("error al actualizar icon")
        if (!role) throw new Error("error al colocar icon")

        await role.setIcon(iconPath, "Update icon role")
    }

    private async processAndSaveIcon(): Promise<string> {

        const image = this.interaction.options.getAttachment("icon", true);
        if (!(image instanceof Attachment)) {
            throw new Error("ingrese un icon")
        }

        const imageType = image.contentType;
        if (!formatsAllowed.some((format) => format === imageType)) {
            throw new Error("formato de imagen no aceptado")
        }

        const imageResize = await Jimp.read(image.url)
        imageResize.resize({ w: 150, h: 150 })
        const iconPath = `${icon_dir}${this.interaction.id}.png` as `${string}.${string}`
        await imageResize.write(iconPath)
        return iconPath

    }

    private async setupRoleData(): Promise<RoleCreateOptions> {
        const name = this.interaction.options.getString("nombre", true);
        const icon = this.interaction.options.getAttachment("icon", false)
        const roleData: RoleCreateOptions = {
            name,
            position: 10,
        }
        if (icon) {
            const attachIcon = await this.processAndSaveIcon()
            roleData.icon = attachIcon;
        }
        return roleData;
    }
}

export default RoleManager 
