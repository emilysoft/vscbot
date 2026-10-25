import {
  User,
  Guild,
  Attachment,
  ChatInputCommandInteraction,
  Role,
  RoleCreateOptions,
} from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import {
  ROLE_ICONS_UNAVAILABLE_MESSAGE,
  canUseRoleIcons,
  saveRoleIcon,
  updateCustomRoleForMember,
} from "./customRoleService.js";

class RoleManager {
  private interaction: ChatInputCommandInteraction;
  private guild: Guild;
  private user: User;

  private get client(): Client {
    return this.interaction.client as Client;
  }

  constructor(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild()) {
      throw new Error("El comando solo se puede usar en un servidor");
    }

    this.interaction = interaction;
    this.guild = interaction.guild as Guild;
    this.user = interaction.user;
  }
  public async createRole(): Promise<Role | undefined> {
    const roleData = await this.setupRoleData();
    return await this.guild.roles.create(roleData);
  }

  public async assignRole(role: Role, user: User): Promise<Role | undefined> {
    if (!this.interaction.guild)
      throw new Error("error al encontrar el servidor");
    const member = await this.interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member) {
      throw new Error("no se pudo encontrar el usuario");
    }
    await member.roles.add(role);

    return role;
  }

  public async createCustomRole(): Promise<void> {
    if (!canUseRoleIcons(this.guild)) {
      throw new Error(ROLE_ICONS_UNAVAILABLE_MESSAGE);
    }

    const user = this.interaction.options.getUser("usuario", true);
    const existingCustomRole = await this.client.db.roles.custom.get(
      user.id,
      this.guild.id,
    );
    if (existingCustomRole != undefined)
      throw new Error("ya existe el custom role");
    const role = await this.createRole();
    if (!role) throw new Error("error al crear role");
    if (!user) {
      throw new Error("Falta usuario");
    }
    await this.assignRole(role, user);
    await this.saveCustomRole(role, user, this.guild);
  }

  private async saveCustomRole(role: Role, user: User, guild: Guild) {
    await this.client.db.roles.custom.create(role, user, guild);
  }

  public async updateCustomRoleName() {
    const name =
      this.interaction.options.getString("nombre", false) ?? undefined;
    const icon =
      this.interaction.options.getAttachment("icon", false) ?? undefined;

    if (!name && !icon) {
      throw new Error("ingresá un nombre o un icono");
    }

    const member = await this.guild.members.fetch(this.user.id);
    await updateCustomRoleForMember(member, name, icon, this.interaction.id);
  }

  private async processAndSaveIcon(): Promise<string> {
    const image = this.interaction.options.getAttachment("icon", true);
    if (!(image instanceof Attachment)) {
      throw new Error("ingrese un icon");
    }

    return await saveRoleIcon(image, this.interaction.id);
  }

  private async setupRoleData(): Promise<RoleCreateOptions> {
    const name = this.interaction.options.getString("nombre", true);
    const icon = this.interaction.options.getAttachment("icon", false);
    const roleData: RoleCreateOptions = {
      name,
      position: 10,
    };
    if (icon) {
      const attachIcon = await this.processAndSaveIcon();
      roleData.icon = attachIcon;
    }
    return roleData;
  }
}

export default RoleManager;
