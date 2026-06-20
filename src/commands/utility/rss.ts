import {
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  ColorResolvable,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} from "discord.js";
import Parser from "rss-parser";
import { WebhookClient } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import ICommand from "../../interfaces/command.js";
import config from "../../config/config.json" with { type: "json" };
import { previewFeed, getLatestItemPreview, detectFeedFields } from "../../functions/timers/rssScheduler.js";

const parser = new Parser();

const DEFAULT_TEMPLATE = `📰 **{title}**

{description}

🔗 {link}`;

const VARIABLES_INFO =
  "`{title}` — Título del artículo\n" +
  "`{link}` — URL del artículo\n" +
  "`{description}` — Resumen/descripción\n" +
  "`{author}` — Autor\n" +
  "`{pubDate}` — Fecha de publicación\n" +
  "`{feedTitle}` — Título del feed\n" +
  "`{feedLink}` — URL del feed";

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function buildFieldEmbed(detection: NonNullable<Awaited<ReturnType<typeof detectFeedFields>>>): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📊 Feed: ${detection.feedTitle}`)
    .setDescription(detection.itemAvailable ? "Campos del último item:" : "El feed no tiene items aún")
    .setColor(config.EMBED_COLOR as ColorResolvable);

  for (const f of detection.fields) {
    embed.addFields({
      name: `${f.available ? "✅" : "❌"} ${f.variable}`,
      value: f.available ? truncate(f.value, 100) : "No disponible",
      inline: true,
    });
  }

  return embed;
}

const module: ICommand = {
  name: "rss",
  description: "Gestiona feeds RSS",
  slashCommand: true,
  cooldown: 5,
  allowEdited: false,
  messageCommand: false,
  data: new SlashCommandBuilder()
    .setName("rss")
    .setDescription("Gestiona feeds RSS")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
    .addSubcommand(sub => sub
      .setName("create")
      .setDescription("Crear un feed RSS")
      .addStringOption(opt => opt
        .setName("url")
        .setDescription("URL del feed RSS")
        .setRequired(true))
      .addChannelOption(opt => opt
        .setName("channel")
        .setDescription("Canal donde publicar")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
      .addStringOption(opt => opt
        .setName("name")
        .setDescription("Nombre identificador del feed")
        .setRequired(true)
        .setMaxLength(50))
      .addStringOption(opt => opt
        .setName("webhook_name")
        .setDescription("Nombre a mostrar en los mensajes (default: name)")
        .setMaxLength(50))
      .addStringOption(opt => opt
        .setName("webhook_avatar")
        .setDescription("URL de imagen para el avatar del webhook")))
    .addSubcommand(sub => sub
      .setName("edit")
      .setDescription("Editar un feed RSS")
      .addNumberOption(opt => opt
        .setName("id")
        .setDescription("ID del feed")
        .setRequired(true))
      .addStringOption(opt => opt
        .setName("url")
        .setDescription("Nueva URL del feed"))
      .addChannelOption(opt => opt
        .setName("channel")
        .setDescription("Nuevo canal")
        .addChannelTypes(ChannelType.GuildText))
      .addStringOption(opt => opt
        .setName("name")
        .setDescription("Nuevo nombre identificador")
        .setMaxLength(50))
      .addStringOption(opt => opt
        .setName("webhook_name")
        .setDescription("Nuevo nombre a mostrar")
        .setMaxLength(50))
      .addStringOption(opt => opt
        .setName("webhook_avatar")
        .setDescription("Nueva URL de avatar")))
    .addSubcommand(sub => sub
      .setName("remove")
      .setDescription("Eliminar un feed RSS")
      .addNumberOption(opt => opt
        .setName("id")
        .setDescription("ID del feed")
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName("list")
      .setDescription("Listar feeds RSS configurados"))
    .addSubcommand(sub => sub
      .setName("preview")
      .setDescription("Previsualizar el último item del feed")
      .addNumberOption(opt => opt
        .setName("id")
        .setDescription("ID del feed")
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName("blacklist")
      .setDescription("Configurar blacklist de filtrado para un feed")
      .addNumberOption(opt => opt
        .setName("id")
        .setDescription("ID del feed")
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName("template")
      .setDescription("Editar la plantilla del mensaje de un feed")
      .addNumberOption(opt => opt
        .setName("id")
        .setDescription("ID del feed")
        .setRequired(true))),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guild = interaction.guild;
      if (!guild) {
        await interaction.reply({ content: "Este comando solo funciona en un servidor.", ephemeral: true });
        return;
      }

      switch (subcommand) {
        case "create": await handleCreate(interaction, client); break;
        case "edit": await handleEdit(interaction, client); break;
        case "remove": await handleRemove(interaction, client); break;
        case "list": await handleList(interaction, client); break;
        case "preview": await handlePreview(interaction, client); break;
        case "blacklist": await handleBlacklist(interaction, client); break;
        case "template": await handleTemplate(interaction, client); break;
      }
    } catch (err) {
      console.error("[rss] execute error:", err);
      client.errorLogger(err, client, "error", `${process.cwd()} commands/utility/rss`);
      try {
        if (!interaction.replied) await interaction.reply({ content: "Ocurrió un error al ejecutar el comando.", ephemeral: true });
        else await interaction.editReply({ content: "Ocurrió un error al ejecutar el comando." }).catch(() => {});
      } catch { }
    }
  },
};

async function showTemplateModal(
  interaction: ChatInputCommandInteraction,
  customId: string,
  currentTemplate: string,
  detectionEmbed?: EmbedBuilder,
): Promise<{ template: string; submitted: ModalSubmitInteraction } | null> {
  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle("Plantilla del mensaje RSS")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("template")
          .setLabel("Plantilla (usa las variables disponibles)")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setValue(currentTemplate)
          .setPlaceholder("Ej: 📰 {title}\n\n{description}\n\n🔗 {link}"),
      ),
    );

  await interaction.showModal(modal);

  if (detectionEmbed) {
    try { await interaction.followUp({ embeds: [detectionEmbed], ephemeral: true }); } catch { }
  }

  const submitted = await interaction.awaitModalSubmit({
    time: 5 * 60 * 1000,
    filter: (i) => i.user.id === interaction.user.id && i.customId === customId,
  }).catch(() => null);

  if (!submitted) return null;

  const template = submitted.fields.getTextInputValue("template");

  return { template, submitted };
}

async function handleCreate(interaction: ChatInputCommandInteraction, client: Client) {
  const url = interaction.options.getString("url", true);
  const channel = interaction.options.getChannel("channel", true);
  const name = interaction.options.getString("name", true);
  const webhookName = interaction.options.getString("webhook_name") || name;
  const webhookAvatar = interaction.options.getString("webhook_avatar") || "";

  const detection = await detectFeedFields(url);
  if (!detection) {
    await interaction.reply({ content: "❌ La URL no es un feed RSS/Atom válido o no se pudo acceder.", ephemeral: true });
    return;
  }

  const fieldEmbed = buildFieldEmbed(detection);

  const result = await showTemplateModal(interaction, "rss_template_create", DEFAULT_TEMPLATE, fieldEmbed);
  if (!result) return;
  const { template, submitted } = result;

  const textChannel = channel as import("discord.js").TextChannel;

  let webhookUrl: string;
  try {
    const webhook = await textChannel.createWebhook({ name: webhookName });
    webhookUrl = webhook.url;
  } catch {
    try { await submitted.reply({ content: "❌ No tengo permisos para crear webhooks en ese canal.", ephemeral: true }); } catch { }
    return;
  }

  let lastGuid = "";
  try {
    const parsed = await parser.parseURL(url);
    if (parsed.items?.[0]) {
      lastGuid = parsed.items[0].guid || parsed.items[0].link || parsed.items[0].title || "";
    }
  } catch { }

  const feed = await client.db.rss.create({
    server_id: interaction.guildId!,
    channel_id: channel.id,
    name,
    url,
    template,
    webhook_url: webhookUrl,
    webhook_name: webhookName,
    webhook_avatar: webhookAvatar,
    last_guid: lastGuid,
    last_checked: new Date().toISOString(),
    created_by: interaction.user.id,
    status: "active",
    blacklist_json: "",
    posted_guids: "[]",
  });

  const embed = new EmbedBuilder()
    .setTitle("✅ Feed RSS creado")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "ID", value: `#${feed.id}`, inline: true },
      { name: "Nombre", value: feed.name, inline: true },
      { name: "Canal", value: `<#${channel.id}>`, inline: true },
      { name: "URL", value: url.length > 80 ? url.slice(0, 80) + "…" : url },
    );

  try {
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  } catch { }
}

async function handleEdit(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const feed = await client.db.rss.get(id);

  if (!feed || feed.server_id !== interaction.guildId) {
    await interaction.reply({ content: `Feed #${id} no encontrado.`, ephemeral: true });
    return;
  }

  if (feed.status === "removed") {
    await interaction.reply({ content: `El feed #${id} ya fue eliminado.`, ephemeral: true });
    return;
  }

  const newUrl = interaction.options.getString("url");
  const newChannel = interaction.options.getChannel("channel");
  const newName = interaction.options.getString("name");
  const newWebhookName = interaction.options.getString("webhook_name");
  const newWebhookAvatar = interaction.options.getString("webhook_avatar");

  const updates: Record<string, any> = {};

  if (newUrl) {
    try {
      await parser.parseURL(newUrl);
      updates.url = newUrl;
    } catch {
      await interaction.reply({ content: "❌ La URL no es un feed RSS/Atom válido.", ephemeral: true });
      return;
    }
  }

  if (newChannel) {
    const textChannel = newChannel as import("discord.js").TextChannel;
    try {
      const oldWebhook = new WebhookClient({ url: feed.webhook_url });
      await oldWebhook.delete().catch(() => {});
    } catch { }
    try {
      const webhook = await textChannel.createWebhook({ name: newWebhookName || feed.webhook_name || feed.name });
      updates.channel_id = newChannel.id;
      updates.webhook_url = webhook.url;
    } catch {
      await interaction.reply({ content: "❌ No tengo permisos para crear webhooks en ese canal.", ephemeral: true });
      return;
    }
  }

  if (newName) updates.name = newName;
  if (newWebhookName !== null) updates.webhook_name = newWebhookName;
  if (newWebhookAvatar !== null) updates.webhook_avatar = newWebhookAvatar;

  if (Object.keys(updates).length > 0) {
    await client.db.rss.update(id, updates);
  }

  const feedUrl = newUrl || feed.url;
  const detection = await detectFeedFields(feedUrl);
  const fieldEmbed = detection ? buildFieldEmbed(detection) : undefined;

  const result = await showTemplateModal(interaction, `rss_template_edit_${id}`, feed.template, fieldEmbed);
  if (!result) return;
  const { template, submitted } = result;
  if (template !== feed.template) {
    await client.db.rss.update(id, { template });
  }

  const embed = new EmbedBuilder()
    .setTitle("✅ Feed RSS actualizado")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "ID", value: `#${feed.id}`, inline: true },
      { name: "Nombre", value: updates.name || feed.name, inline: true },
      { name: "Estado", value: feed.status, inline: true },
    );

  try {
    await submitted.reply({ embeds: [embed], ephemeral: true });
  } catch { }
}

async function handleRemove(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const feed = await client.db.rss.get(id);

  if (!feed || feed.server_id !== interaction.guildId) {
    await interaction.reply({ content: `Feed #${id} no encontrado.`, ephemeral: true });
    return;
  }

  if (feed.status === "removed") {
    await interaction.reply({ content: `El feed #${id} ya fue eliminado.`, ephemeral: true });
    return;
  }

  try {
    const webhook = new WebhookClient({ url: feed.webhook_url });
    await webhook.delete();
  } catch { }

  await client.db.rss.delete(id);

  await interaction.reply({ content: `❌ Feed RSS #${id} ("${feed.name}") eliminado.`, ephemeral: true });
}

async function handleList(interaction: ChatInputCommandInteraction, client: Client) {
  const feeds = await client.db.rss.getByGuild(interaction.guildId!);
  const active = feeds.filter(f => f.status === "active");
  const paused = feeds.filter(f => f.status !== "active" && f.status !== "removed");

  if (active.length === 0 && paused.length === 0) {
    await interaction.reply({ content: "No hay feeds RSS configurados. Usa `/rss create` para agregar uno.", ephemeral: true });
    return;
  }

  const lines: string[] = [];
  if (active.length > 0) {
    lines.push("**Activos:**");
    active.forEach(f => {
      const shield = f.blacklist_json ? " 🛡️" : "";
    lines.push(`#${f.id} — **${f.name}**${shield} — <#${f.channel_id}> — ${truncate(f.url, 60)}`);
    });
  }
  if (paused.length > 0) {
    lines.push("**En pausa:**");
    paused.forEach(f => {
      lines.push(`#${f.id} — **${f.name}** — ${f.status}`);
    });
  }

  const embed = new EmbedBuilder()
    .setTitle(`Feeds RSS (${active.length} activos)`)
    .setDescription(lines.join("\n"))
    .setColor(config.EMBED_COLOR as ColorResolvable);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handlePreview(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const feed = await client.db.rss.get(id);

  if (!feed || feed.server_id !== interaction.guildId) {
    await interaction.reply({ content: `Feed #${id} no encontrado.`, ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const { rendered, item, feedTitle } = await previewFeed(feed.url, feed.template);

    if (!item) {
      await interaction.editReply({ content: "El feed no tiene items para previsualizar." });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Previsualización — ${feedTitle}`)
      .setColor(config.EMBED_COLOR as ColorResolvable)
      .addFields(
        { name: "Feed", value: feed.name, inline: true },
        { name: "Último item", value: item.title || "Sin título", inline: true },
        { name: "Resultado del template", value: rendered.length > 1024 ? rendered.slice(0, 1021) + "…" : rendered },
      );

    if (item.link) {
      embed.setURL(item.link);
    }

    if (feed.webhook_name || feed.webhook_avatar) {
      const info: string[] = [];
      if (feed.webhook_name) info.push(`Nombre: **${feed.webhook_name}**`);
      if (feed.webhook_avatar) info.push(`Avatar: [link](${feed.webhook_avatar})`);
      embed.addFields({ name: "Webhook", value: info.join("\n") });
    }

    const variablesEmbed = new EmbedBuilder()
      .setTitle("Variables disponibles")
      .setDescription(VARIABLES_INFO)
      .setColor(config.EMBED_COLOR as ColorResolvable);

    await interaction.editReply({ embeds: [embed, variablesEmbed] });
  } catch (err) {
    await interaction.editReply({ content: "❌ No se pudo obtener el feed. Verifica que la URL sea válida." });
  }
}

async function handleBlacklist(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const feed = await client.db.rss.get(id);

  if (!feed || feed.server_id !== interaction.guildId) {
    await interaction.reply({ content: `Feed #${id} no encontrado.`, ephemeral: true });
    return;
  }

  if (feed.status === "removed") {
    await interaction.reply({ content: `El feed #${id} ya fue eliminado.`, ephemeral: true });
    return;
  }

  let detectionEmbed: EmbedBuilder | undefined;
  const detection = await detectFeedFields(feed.url);
  if (detection) {
    detectionEmbed = buildFieldEmbed(detection);
  }

  const existingJson = feed.blacklist_json || "";
  const parsedExisting = (() => {
    try { return JSON.stringify(JSON.parse(existingJson), null, 2); } catch { return existingJson; }
  })();

  const modal = new ModalBuilder()
    .setCustomId(`rss_blacklist_${id}`)
    .setTitle("Blacklist JSON")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("blacklist_json")
          .setLabel("Configuración de blacklist (JSON)")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setValue(parsedExisting)
          .setPlaceholder('{\n  "conditions": [\n    { "field": "title", "operator": "regex_match", "negative": false, "value": "(\\\\boms\\\\b|guerra)" }\n  ]\n}'),
      ),
    );

  await interaction.showModal(modal);

  if (detectionEmbed) {
    try { await interaction.followUp({ embeds: [detectionEmbed], ephemeral: true }); } catch { }
  }

  const submitted = await interaction.awaitModalSubmit({
    time: 5 * 60 * 1000,
    filter: (i) => i.user.id === interaction.user.id && i.customId === `rss_blacklist_${id}`,
  }).catch(() => null);

  if (!submitted) return;

  const rawJson = submitted.fields.getTextInputValue("blacklist_json") || "";

  if (rawJson.trim()) {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed.conditions || !Array.isArray(parsed.conditions)) {
        await submitted.reply({ content: "❌ El JSON debe contener un array `conditions`.", ephemeral: true });
        return;
      }
      for (const c of parsed.conditions) {
        if (!c.field || !c.operator || c.negative === undefined || c.value === undefined) {
          await submitted.reply({ content: "❌ Cada condición requiere `field`, `operator`, `negative` y `value`.", ephemeral: true });
          return;
        }
        if (!["equal", "regex_match", "content"].includes(c.operator)) {
          await submitted.reply({ content: "❌ `operator` debe ser `equal`, `regex_match` o `content`.", ephemeral: true });
          return;
        }
      }
      await client.db.rss.update(id, { blacklist_json: JSON.stringify(parsed) });
      await submitted.reply({ content: `✅ Blacklist guardada para feed #${id} (${parsed.conditions.length} condición(es)).`, ephemeral: true });
    } catch {
      await submitted.reply({ content: "❌ JSON inválido. Revisa el formato e intenta de nuevo.", ephemeral: true });
    }
  } else {
    await client.db.rss.update(id, { blacklist_json: "" });
    await submitted.reply({ content: `✅ Blacklist eliminada para feed #${id}.`, ephemeral: true });
  }
}

async function handleTemplate(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const feed = await client.db.rss.get(id);

  if (!feed || feed.server_id !== interaction.guildId) {
    await interaction.reply({ content: `Feed #${id} no encontrado.`, ephemeral: true });
    return;
  }

  if (feed.status === "removed") {
    await interaction.reply({ content: `El feed #${id} ya fue eliminado.`, ephemeral: true });
    return;
  }

  const detection = await detectFeedFields(feed.url);
  const fieldEmbed = detection ? buildFieldEmbed(detection) : undefined;

  const result = await showTemplateModal(interaction, `rss_template_edit_${id}`, feed.template, fieldEmbed);
  if (!result) return;
  const { template, submitted } = result;

  if (template === feed.template) {
    await submitted.reply({ content: "La plantilla no cambió.", ephemeral: true });
    return;
  }

  await client.db.rss.update(id, { template });

  const embed = new EmbedBuilder()
    .setTitle("✅ Plantilla actualizada")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "Feed", value: feed.name, inline: true },
      { name: "ID", value: `#${feed.id}`, inline: true },
    );

  try { await submitted.reply({ embeds: [embed], ephemeral: true }); } catch { }
}

export default module;
