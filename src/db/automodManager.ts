import { eq, sql } from "drizzle-orm";
import type { AppDatabase } from "./client.js";
import { automodSettings } from "./schema.js";

/** Regla de excepción para un canal o categoría. */
export interface AutomodOverrideRule {
  /** Nombres de automods apagados en ese canal/categoría. `"*"` = todos. */
  off: string[];
}

export interface AutomodOverrides {
  channels: Record<string, AutomodOverrideRule>;
  categories: Record<string, AutomodOverrideRule>;
}

export type AutomodOverrideScope = "channels" | "categories";

export interface AutomodSnapshot {
  globalEnabled: boolean;
  disabled: string[];
  overrides: AutomodOverrides;
}

function emptyOverrides(): AutomodOverrides {
  return { channels: {}, categories: {} };
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeOverrides(value: AutomodOverrides): AutomodOverrides {
  return {
    channels: value.channels ?? {},
    categories: value.categories ?? {},
  };
}

/**
 * Estado del automod por servidor, cacheado en memoria.
 *
 * Se lee una sola fila de `automod_settings` al arrancar y se mantiene en
 * memoria para que el hot path (cada mensaje) no consulte la DB. Las
 * escrituras actualizan la DB y el cache a la vez.
 */
export default class AutomodManager {
  private db: AppDatabase;
  private guildId = "";
  private globalEnabled = true;
  private disabled = new Set<string>();
  private overrides: AutomodOverrides = emptyOverrides();

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /** Carga el estado del servidor; si no existe la fila, la crea. */
  public load(guildId: string): void {
    this.guildId = guildId;

    const row = this.db
      .select()
      .from(automodSettings)
      .where(eq(automodSettings.guild_id, guildId))
      .get();

    if (!row) {
      this.globalEnabled = true;
      this.disabled = new Set();
      this.overrides = emptyOverrides();
      this.persist();
      return;
    }

    this.globalEnabled = row.global_enabled;
    this.disabled = new Set(parseJson<string[]>(row.disabled, []));
    this.overrides = normalizeOverrides(
      parseJson<AutomodOverrides>(row.overrides, emptyOverrides()),
    );
  }

  /**
   * ¿Debe ejecutarse este automod en este mensaje?
   * Las excepciones por canal/categoría mandan sobre el estado global.
   */
  public isEnabled(
    name: string,
    channelId?: string | null,
    categoryId?: string | null,
  ): boolean {
    if (
      channelId &&
      this.matchesOverride(this.overrides.channels[channelId], name)
    ) {
      return false;
    }
    if (
      categoryId &&
      this.matchesOverride(this.overrides.categories[categoryId], name)
    ) {
      return false;
    }
    return this.globalEnabled && !this.disabled.has(name);
  }

  public setGlobal(enabled: boolean): void {
    this.globalEnabled = enabled;
    this.persist();
  }

  /** Enciende o apaga un automod para todo el servidor. */
  public setAutomod(name: string, enabled: boolean): void {
    if (enabled) {
      this.disabled.delete(name);
    } else {
      this.disabled.add(name);
    }
    this.persist();
  }

  /**
   * Define (o borra, con `off = null`) la excepción de un canal o categoría.
   */
  public setOverride(
    scope: AutomodOverrideScope,
    id: string,
    off: string[] | null,
  ): void {
    const rules = this.overrides[scope];
    if (!off || off.length === 0) {
      delete rules[id];
    } else {
      rules[id] = { off: [...new Set(off)] };
    }
    this.persist();
  }

  public getOverride(
    scope: AutomodOverrideScope,
    id: string,
  ): AutomodOverrideRule | undefined {
    return this.overrides[scope][id];
  }

  public snapshot(): AutomodSnapshot {
    return {
      globalEnabled: this.globalEnabled,
      disabled: [...this.disabled],
      overrides: {
        channels: structuredClone(this.overrides.channels),
        categories: structuredClone(this.overrides.categories),
      },
    };
  }

  private matchesOverride(
    rule: AutomodOverrideRule | undefined,
    name: string,
  ): boolean {
    if (!rule?.off) return false;
    return rule.off.includes("*") || rule.off.includes(name);
  }

  private persist(): void {
    if (!this.guildId) return;

    this.db
      .insert(automodSettings)
      .values({
        guild_id: this.guildId,
        global_enabled: this.globalEnabled,
        disabled: JSON.stringify([...this.disabled]),
        overrides: JSON.stringify(this.overrides),
      })
      .onConflictDoUpdate({
        target: automodSettings.guild_id,
        set: {
          global_enabled: this.globalEnabled,
          disabled: JSON.stringify([...this.disabled]),
          overrides: JSON.stringify(this.overrides),
          updated_at: sql`(datetime('now'))`,
        },
      })
      .run();
  }
}
