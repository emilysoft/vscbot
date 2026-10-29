import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ColorResolvable,
  EmbedBuilder,
  FileUploadBuilder,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  Role,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import config from "../../config/config.json" with { type: "json" };
import Client from "../../interfaces/ICustomClient.js";
import {
  BOOSTER_REQUIRED_MESSAGE,
  CUSTOM_ROLES_NO_SLOTS_MESSAGE,
  ROLE_ICONS_UNAVAILABLE_MESSAGE,
  canUseRoleIcons,
  createCustomRoleForMember,
  getCustomRoleForMember,
  isBooster,
  updateCustomRoleForMember,
} from "./customRoleService.js";

export const CUSTOM_ROLE_PANEL_BUTTON_ID = "custom_role_panel:open";
export const CUSTOM_ROLE_PANEL_MODAL_ID = "custom_role_panel:submit";
const CUSTOM_ROLE_NAME_INPUT_ID = "custom_role_name";
const CUSTOM_ROLE_ICON_INPUT_ID = "custom_role_icon";
const SUBMIT_COOLDOWN_MS = 5_000;
const cooldowns = new Map<string, number>();

function checkCooldown(key: string): number {
  const now = Date.now();
  const expiresAt = cooldowns.get(key) ?? 0;

  if (now < expiresAt) {
    return Math.ceil((expiresAt - now) / 1000);
  }

  cooldowns.set(key, now + SUBMIT_COOLDOWN_MS);

  return 0;
}

export function buildCustomRolePanel(): {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  const embed = new EmbedBuilder()
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .setTitle("🎨 Rol personalizado")
    .setDescription(
      [
        "Aquí puedes crear tu rol personalizado o cambiarle el **nombre** y el **icono**.",
        "",
        "**Requisitos**",
        "• Si todavía no tienes un rol, necesitas ser **booster** para crearlo.",
        "• El servidor necesita **Nivel 2** de boosts para usar iconos de rol.",
        "",
        "Haz clic en el botón para empezar.",
      ].join("\n"),
    )
    .setImage(
      "https://cdn.discordapp.com/attachments/1024260771326197781/1564763195485196438/8t6shpz.jpg?ex=6ae272c9&is=6ae12149&hm=f4b45f8c55203b7095c0b21d0cbb2419c22a765acb7411186864eaf916bf6260",
    )
    .setFooter({
      text: "PNG, JPG, GIF o WEBP • Máximo 8 MB",
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(CUSTOM_ROLE_PANEL_BUTTON_ID)
      .setLabel("Personalizar mi rol")
      .setEmoji("🎨")
      .setStyle(ButtonStyle.Primary),
  );

  return { embeds: [embed], components: [row] };
}

function buildCustomRoleModal(
  currentName: string | undefined,
  requireIcon: boolean,
): ModalBuilder {
  const textInput = new TextInputBuilder()
    .setCustomId(CUSTOM_ROLE_NAME_INPUT_ID)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  if (currentName) {
    textInput.setValue(currentName);
  }

  const nameInput = new LabelBuilder()
    .setLabel("Nombre del rol")
    .setDescription("Entre 1 y 100 caracteres.")
    .setTextInputComponent(textInput);

  const iconUpload = new FileUploadBuilder()
    .setCustomId(CUSTOM_ROLE_ICON_INPUT_ID)
    .setMinValues(requireIcon ? 1 : 0)
    .setMaxValues(1)
    .setRequired(requireIcon);

  const iconInput = new LabelBuilder()
    .setLabel(requireIcon ? "Icono (obligatorio)" : "Nuevo icono (opcional)")
    .setDescription("PNG, JPG, GIF o WEBP. Máximo 8 MB.")
    .setFileUploadComponent(iconUpload);

  return new ModalBuilder()
    .setCustomId(CUSTOM_ROLE_PANEL_MODAL_ID)
    .setTitle(
      requireIcon ? "Crear rol personalizado" : "Editar rol personalizado",
    )
    .addLabelComponents(nameInput, iconInput);
}

async function replyButtonError(
  interaction: ButtonInteraction,
  content: string,
): Promise<void> {
  await interaction.reply({
    content,
    flags: MessageFlags.Ephemeral,
  });
}

export async function handleCustomRolePanelButton(
  interaction: ButtonInteraction,
): Promise<void> {
  if (!interaction.inCachedGuild()) {
    await replyButtonError(
      interaction,
      "Este panel solo funciona dentro de un servidor.",
    );
    return;
  }

  const guild = interaction.guild;
  const member = interaction.member;

  if (!canUseRoleIcons(guild)) {
    await replyButtonError(interaction, ROLE_ICONS_UNAVAILABLE_MESSAGE);
    return;
  }

  let existingRole: Role | undefined;

  try {
    existingRole = await getCustomRoleForMember(member);
  } catch (error) {
    await replyButtonError(
      interaction,
      error instanceof Error
        ? error.message
        : "No se pudo encontrar tu rol personalizado.",
    );
    return;
  }

  if (!existingRole && !isBooster(member)) {
    await replyButtonError(interaction, BOOSTER_REQUIRED_MESSAGE);
    return;
  }

  if (!existingRole) {
    try {
      const maxSlots = Number((config as any).CUSTOM_ROLES_MAX_SLOTS || 0);
      const reserved = Number((config as any).CUSTOM_ROLES_RESERVED_SLOTS || 2);
      if (maxSlots > 0) {
        const trackerId = (config as any).CUSTOM_ROLE_TRACKER_ROLE_ID;
        const trackerRole = guild.roles.cache.get(trackerId);
        const count = trackerRole?.members.size || 0;
        if (count >= maxSlots - reserved) {
          await replyButtonError(interaction, CUSTOM_ROLES_NO_SLOTS_MESSAGE);
          return;
        }
      }
    } catch {
      /* ignore */
    }
  }

  await interaction.showModal(
    buildCustomRoleModal(existingRole?.name, !existingRole),
  );
}

export async function handleCustomRolePanelModal(
  interaction: ModalSubmitInteraction,
): Promise<void> {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Este panel solo funciona dentro de un servidor.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const secondsLeft = checkCooldown(
    `${interaction.guildId}:${interaction.user.id}`,
  );

  if (secondsLeft > 0) {
    await interaction.editReply({
      content: `Esperá ${secondsLeft} segundos antes de volver a modificar tu rol.`,
    });
    return;
  }

  try {
    const guild = interaction.guild;
    const member = interaction.member;

    if (!canUseRoleIcons(guild)) {
      throw new Error(ROLE_ICONS_UNAVAILABLE_MESSAGE);
    }

    const name = interaction.fields
      .getTextInputValue(CUSTOM_ROLE_NAME_INPUT_ID)
      .trim();

    const uploadedIcons = interaction.fields.getUploadedFiles(
      CUSTOM_ROLE_ICON_INPUT_ID,
    );
    const icon = uploadedIcons?.first() ?? undefined;
    const existingRole = await getCustomRoleForMember(member);

    if (existingRole) {
      await updateCustomRoleForMember(member, name, icon, interaction.id);
      await interaction.editReply({
        content: "✅ Tu rol personalizado fue actualizado.",
      });
      return;
    }

    if (!isBooster(member)) {
      throw new Error(BOOSTER_REQUIRED_MESSAGE);
    }

    if (!icon) {
      throw new Error(
        "Necesitás subir un icono para crear tu rol personalizado.",
      );
    }

    await createCustomRoleForMember(member, name, icon, interaction.id);
    await interaction.editReply({
      content: "✅ Tu rol personalizado fue creado.",
    });
  } catch (error) {
    const customClient = interaction.client as Client;

    customClient.errorLogger(
      error,
      customClient,
      "error",
      `${process.cwd()} functions/lib/customRolePanel`,
    );

    await interaction.editReply({
      content:
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Ocurrió un error al actualizar tu rol personalizado.",
    });
  }
}
