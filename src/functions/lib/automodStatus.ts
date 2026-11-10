import { ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../../config/config.json" with { type: "json" };
import type { AutomodOverrides } from "../../db/automodManager.js";

/** Valor de módulo que representa "todos los automods". */
export const ALL_MODULES = "*";
export const ALL_MODULES_LABEL = "todos";

/** Presupuesto de caracteres por página (el description de un embed admite 4096). */
const PAGE_BUDGET = 3500;

export interface AutomodStatusModule {
  name: string;
  scope: string;
}

export interface AutomodStatusInput {
  globalEnabled: boolean;
  disabled: string[];
  overrides: AutomodOverrides;
  modules: AutomodStatusModule[];
}

interface Section {
  header?: string;
  lines: string[];
}

/**
 * Arma las páginas del embed de estado. Se separa del comando para poder
 * probar los límites de longitud sin necesitar un cliente de Discord.
 */
export function buildStatusPages(input: AutomodStatusInput): EmbedBuilder[] {
  const modules = [...input.modules].sort((a, b) => a.name.localeCompare(b.name));
  const enabledCount = modules.filter(
    (module) => !input.disabled.includes(module.name),
  ).length;

  const sections: Section[] = [
    {
      lines: [
        `**Global:** ${
          input.globalEnabled
            ? "🟢 encendido"
            : "🔴 apagado (ningún automod se ejecuta)"
        }`,
        `**Módulos:** ${enabledCount}/${modules.length} activos individualmente`,
      ],
    },
    {
      header: "**Módulos:**",
      lines: modules.length
        ? modules.map(
            (module) =>
              `${input.disabled.includes(module.name) ? "❌" : "✅"} \`${module.name}\` (${module.scope})`,
          )
        : ["Sin módulos cargados."],
    },
  ];

  const channelLines = formatOverrides(input.overrides.channels);
  const categoryLines = formatOverrides(input.overrides.categories);

  if (channelLines.length) {
    sections.push({ header: "**Excepciones por canal:**", lines: channelLines });
  }
  if (categoryLines.length) {
    sections.push({
      header: "**Excepciones por categoría:**",
      lines: categoryLines,
    });
  }
  if (!channelLines.length && !categoryLines.length) {
    sections.push({
      header: "**Excepciones:**",
      lines: ["Sin excepciones configuradas."],
    });
  }

  const pages = paginate(sections, PAGE_BUDGET);

  return pages.map((description, index) =>
    new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle("🤖 Estado del automod")
      .setDescription(description)
      .setFooter({ text: `Página ${index + 1}/${pages.length}` })
      .setTimestamp(),
  );
}

function formatOverrides(
  rules: Record<string, { off: string[] }>,
): string[] {
  return Object.entries(rules).map(([id, rule]) => {
    const modules = rule.off
      .map((name) =>
        name === ALL_MODULES ? ALL_MODULES_LABEL : `\`${name}\``,
      )
      .join(", ");
    return `<#${id}> — ${modules}`;
  });
}

function paginate(sections: Section[], budget: number): string[] {
  const pages: string[] = [];
  let current: string[] = [];
  let length = 0;

  const flush = () => {
    if (!current.length) return;
    pages.push(current.join("\n"));
    current = [];
    length = 0;
  };

  const pushLine = (line: string) => {
    const added = (current.length ? 1 : 0) + line.length;
    if (current.length && length + added > budget) flush();
    current.push(line);
    length += (current.length > 1 ? 1 : 0) + line.length;
  };

  for (const section of sections) {
    if (!section.lines.length) continue;

    // No dejes un encabezado solo al final de una página.
    if (section.header) {
      const headerAndFirstLine =
        (current.length ? 1 : 0) +
        section.header.length +
        1 +
        section.lines[0].length;
      if (current.length && length + headerAndFirstLine > budget) flush();
      pushLine(section.header);
    }

    for (const line of section.lines) pushLine(line);
  }

  flush();
  return pages.length ? pages : [""];
}
