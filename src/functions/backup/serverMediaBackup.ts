import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { StickerFormatType } from "discord.js";
import config from "../../config/config.json" with { type: "json" };
import type Client from "../../interfaces/ICustomClient.js";

const MANIFEST_NAME = "manifest.json";
const DOWNLOAD_CONCURRENCY = 5;
const DOWNLOAD_RETRIES = 1;
const RETRY_DELAY_MS = 500;

interface BackupAssetEntry {
  id: string;
  name: string;
  file: string;
  url: string;
}

export interface BackupEmojiEntry extends BackupAssetEntry {
  animated: boolean;
}

export interface BackupStickerEntry extends BackupAssetEntry {
  description: string | null;
  tags: string | null;
  format: string;
}

export interface BackupFailure {
  kind: "emoji" | "sticker";
  id: string;
  name: string;
  url: string;
  error: string;
}

export interface BackupManifest {
  version: number;
  guild: {
    id: string;
    name: string;
  };
  createdAt: string;
  counts: {
    emojis: number;
    stickers: number;
    failed: number;
  };
  emojis: BackupEmojiEntry[];
  stickers: BackupStickerEntry[];
  failures: BackupFailure[];
}

export interface BackupSummary {
  directory: string;
  createdAt: string;
  emojis: number;
  stickers: number;
  failures: BackupFailure[];
}

/** Directorio donde se guarda el backup más reciente. */
export function backupDirectory(): string {
  const dataDir = process.env.DATABASE_DIR || "/var/lib/vscbot";
  return join(dataDir, "backups", "emojis-stickers", "latest");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeName(name: string, fallbackId: string): string {
  const clean = name.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80);
  return clean.length ? clean : fallbackId;
}

function stickerFormatInfo(format: StickerFormatType): {
  extension: string;
  label: string;
} {
  switch (format) {
    case StickerFormatType.APNG:
      // APNG es un PNG animado: el CDN lo sirve con extensión .png.
      return { extension: "png", label: "APNG" };
    case StickerFormatType.Lottie:
      return { extension: "json", label: "LOTTIE" };
    case StickerFormatType.GIF:
      return { extension: "gif", label: "GIF" };
    default:
      return { extension: "png", label: "PNG" };
  }
}

async function downloadFile(url: string, destination: string): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= DOWNLOAD_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(destination, buffer);
      return;
    } catch (err) {
      lastError = err;
      if (attempt < DOWNLOAD_RETRIES) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (index < items.length) {
        const item = items[index++];
        await worker(item);
      }
    },
  );

  await Promise.all(runners);
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Borra restos de backups interrumpidos (`.tmp-*`). */
async function cleanStaleTempDirs(parentDir: string): Promise<void> {
  try {
    const entries = await readdir(parentDir, { withFileTypes: true });
    await Promise.all(
      entries
        .filter(
          (entry) => entry.isDirectory() && entry.name.startsWith(".tmp-"),
        )
        .map((entry) =>
          rm(join(parentDir, entry.name), {
            recursive: true,
            force: true,
          }).catch(() => null),
        ),
    );
  } catch {
    /* el directorio todavía no existe */
  }
}

/**
 * Descarga los emojis y stickers del servidor principal en
 * `${DATABASE_DIR}/backups/emojis-stickers/latest`.
 *
 * Escribe primero en un directorio temporal y solo reemplaza el backup
 * anterior cuando termina, así un fallo a mitad no deja el `latest` roto.
 */
export async function backupServerMedia(
  client: Client,
): Promise<BackupSummary> {
  const guild =
    client.guilds.cache.get(config.guilds.main) ??
    (await client.guilds.fetch(config.guilds.main).catch(() => null));

  if (!guild) {
    throw new Error(
      `No se encontró el servidor principal (${config.guilds.main})`,
    );
  }

  const targetDir = backupDirectory();
  const parentDir = dirname(targetDir);
  const tempDir = join(parentDir, `.tmp-${Date.now()}`);
  const emojisDir = join(tempDir, "emojis");
  const stickersDir = join(tempDir, "stickers");

  await cleanStaleTempDirs(parentDir);
  await mkdir(emojisDir, { recursive: true });
  await mkdir(stickersDir, { recursive: true });

  try {
    const [emojis, stickers] = await Promise.all([
      guild.emojis.fetch(),
      guild.stickers.fetch(),
    ]);

    const emojiEntries: BackupEmojiEntry[] = [];
    const stickerEntries: BackupStickerEntry[] = [];
    const failures: BackupFailure[] = [];

    await runWithConcurrency(
      [...emojis.values()],
      DOWNLOAD_CONCURRENCY,
      async (emoji) => {
        const name = emoji.name ?? emoji.id;
        const extension = emoji.animated ? "gif" : "png";
        const fileName = `${sanitizeName(name, emoji.id)}_${emoji.id}.${extension}`;
        const url = emoji.imageURL({ extension, size: 4096 });

        try {
          await downloadFile(url, join(emojisDir, fileName));
          emojiEntries.push({
            id: emoji.id,
            name,
            animated: emoji.animated,
            file: `emojis/${fileName}`,
            url,
          });
        } catch (err) {
          failures.push({
            kind: "emoji",
            id: emoji.id,
            name,
            url,
            error: errorMessage(err),
          });
        }
      },
    );

    await runWithConcurrency(
      [...stickers.values()],
      DOWNLOAD_CONCURRENCY,
      async (sticker) => {
        const name = sticker.name;
        const { extension, label } = stickerFormatInfo(sticker.format);
        const fileName = `${sanitizeName(name, sticker.id)}_${sticker.id}.${extension}`;
        const url = sticker.url;

        try {
          await downloadFile(url, join(stickersDir, fileName));
          stickerEntries.push({
            id: sticker.id,
            name,
            description: sticker.description,
            tags: sticker.tags,
            format: label,
            file: `stickers/${fileName}`,
            url,
          });
        } catch (err) {
          failures.push({
            kind: "sticker",
            id: sticker.id,
            name,
            url,
            error: errorMessage(err),
          });
        }
      },
    );

    emojiEntries.sort(
      (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
    );
    stickerEntries.sort(
      (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
    );

    const createdAt = new Date().toISOString();
    const manifest: BackupManifest = {
      version: 1,
      guild: { id: guild.id, name: guild.name },
      createdAt,
      counts: {
        emojis: emojiEntries.length,
        stickers: stickerEntries.length,
        failed: failures.length,
      },
      emojis: emojiEntries,
      stickers: stickerEntries,
      failures,
    };

    await writeFile(
      join(tempDir, MANIFEST_NAME),
      JSON.stringify(manifest, null, 2),
      "utf8",
    );

    await rm(targetDir, { recursive: true, force: true });
    await rename(tempDir, targetDir);

    return {
      directory: targetDir,
      createdAt,
      emojis: emojiEntries.length,
      stickers: stickerEntries.length,
      failures,
    };
  } catch (err) {
    await rm(tempDir, { recursive: true, force: true }).catch(() => null);
    throw err;
  }
}
