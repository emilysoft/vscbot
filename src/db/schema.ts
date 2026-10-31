import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Nota sobre fechas: las columnas de fecha siguen siendo TEXT (ISO 8601 o
// datetime('now')) porque la base ya desplegada guarda ese formato y el bot
// compara rangos directamente (`remind_at <= ?`, `start_time <= ?`).
// Los flags 0/1 usan integer({ mode: "boolean" }) para exponer booleanos.

export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  user_id: text().notNull().unique(),
  username: text().notNull(),
});

export const servers = sqliteTable("servers", {
  id: integer().primaryKey({ autoIncrement: true }),
  server_id: text().notNull().unique(),
  name: text().notNull(),
  owner_id: integer().references(() => users.id, { onDelete: "set null" }),
  creation_date: text().notNull(),
});

export const channels = sqliteTable(
  "channels",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    channel_id: text().notNull().unique(),
    server_id: integer()
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    name: text().notNull(),
  },
  (table) => [index("idx_channels_server").on(table.server_id)],
);

export const roles = sqliteTable(
  "roles",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    role_id: text().notNull().unique(),
    server_id: integer()
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    name: text().notNull(),
  },
  (table) => [index("idx_roles_server").on(table.server_id)],
);

export const customRoles = sqliteTable(
  "customRoles",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    user_id: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    server_id: integer()
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    role_id: integer()
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    left_since: text(),
  },
  (table) => [
    index("idx_custom_roles_user_server").on(table.user_id, table.server_id),
    index("idx_custom_roles_role").on(table.role_id),
  ],
);

export const logs = sqliteTable(
  "logs",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    server_id: integer()
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    channel_id: integer().references(() => channels.id, {
      onDelete: "cascade",
    }),
    user_id: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    interaction: text().notNull(),
    log_type: text().notNull(),
    creation_date: text().notNull(),
  },
  (table) => [
    // logs es la tabla mas grande y solo se escribe en cada mensaje: se indexa
    // exclusivamente lo que usan las consultas (logs.getLastMessageDate y el
    // filtro por usuario/servidor).
    index("idx_logs_user_server_type_date").on(
      table.user_id,
      table.server_id,
      table.log_type,
      table.creation_date,
    ),
  ],
);

export const levels = sqliteTable(
  "levels",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    user_id: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    server_id: integer()
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    xp: integer().notNull(),
    level: integer().notNull(),
    last_message: text().notNull(),
  },
  (table) => [
    uniqueIndex("idx_levels_user_server").on(table.user_id, table.server_id),
    index("idx_levels_server_xp").on(table.server_id, table.xp),
  ],
);

export const rewardRoles = sqliteTable(
  "reward_roles",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    role_id: integer()
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    level: integer().notNull(),
    server_id: integer()
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("idx_reward_roles_server").on(table.server_id),
    index("idx_reward_roles_role").on(table.role_id),
  ],
);

export const serverSettings = sqliteTable("server_settings", {
  server_id: integer()
    .primaryKey()
    .references(() => servers.id, { onDelete: "cascade" }),
  prefix: text().notNull().default("!"),
});

export const serverEventConfig = sqliteTable("server_event_config", {
  server_id: text().primaryKey(),
  enabled: integer({ mode: "boolean" }).notNull().default(false),
  default_role_id: text().notNull().default(""),
  events_channel: text().notNull().default(""),
  logs_channel: text().notNull().default(""),
  voice_category: text().notNull().default(""),
  text_category: text().notNull().default(""),
  archive_category: text().notNull().default(""),
  use_discord_events: integer({ mode: "boolean" }).notNull().default(false),
  created_at: text()
    .notNull()
    .default(sql`(datetime('now'))`),
  require_confirmation: integer({ mode: "boolean" }).notNull().default(true),
});

export const events = sqliteTable(
  "events",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    server_id: text().notNull(),
    name: text().notNull(),
    description: text().notNull().default(""),
    role_id: text(),
    channel_id: text(),
    custom_message: text(),
    use_discord_event: integer({ mode: "boolean" }).notNull().default(false),
    start_time: text().notNull(),
    end_time: text(),
    recurrence: text().notNull().default("none"),
    activities: text().notNull().default("[]"),
    channel_behavior: text().notNull().default("delete"),
    retention_hours: integer().notNull().default(0),
    status: text().notNull().default("scheduled"),
    created_by: text().notNull(),
    voice_channel_id: text(),
    text_channel_id: text(),
    message_id: text(),
    discord_event_id: text(),
    reminder_sent: integer({ mode: "boolean" }).notNull().default(false),
    created_at: text()
      .notNull()
      .default(sql`(datetime('now'))`),
    text_channel_name: text(),
    channel_topic: text(),
    voice_channel_name: text(),
    require_confirmation: integer({ mode: "boolean" }),
    image_url: text(),
    send_events_channel_msg: integer({ mode: "boolean" }).default(true),
    events_channel_message_id: text(),
    is_private: integer({ mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    index("idx_events_server_status_start").on(
      table.server_id,
      table.status,
      table.start_time,
    ),
    index("idx_events_status_start").on(table.status, table.start_time),
  ],
);

export const eventParticipants = sqliteTable(
  "event_participants",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    event_id: integer().notNull(),
    user_id: text().notNull(),
    joined_at: text().notNull(),
    left_at: text(),
    duration_sec: integer(),
    source: text().notNull().default("voice"),
  },
  (table) => [
    index("idx_event_participants_event").on(table.event_id),
    index("idx_event_participants_user").on(table.event_id, table.user_id),
  ],
);

export const eventActivities = sqliteTable(
  "event_activities",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    event_id: integer().notNull(),
    name: text().notNull(),
    success_count: integer().notNull().default(0),
    total_count: integer().notNull().default(0),
  },
  (table) => [index("idx_event_activities_event").on(table.event_id)],
);

export const reminders = sqliteTable(
  "reminders",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    server_id: text().notNull(),
    channel_id: text().notNull(),
    message: text().notNull(),
    remind_at: text().notNull(),
    created_by: text().notNull(),
    created_at: text()
      .notNull()
      .default(sql`(datetime('now'))`),
    status: text().notNull().default("pending"),
    recurring: integer({ mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    index("idx_reminders_server").on(table.server_id),
    index("idx_reminders_status_remind").on(table.status, table.remind_at),
  ],
);

export const newMemberRestrictions = sqliteTable(
  "new_member_restrictions",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    user_id: text().notNull(),
    server_id: text().notNull(),
    role_id: text().notNull(),
    assigned_at: text().notNull(),
    status: text().notNull().default("pending"),
  },
  (table) => [
    index("idx_new_member_restrictions_user").on(
      table.user_id,
      table.server_id,
    ),
    index("idx_new_member_restrictions_status").on(
      table.status,
      table.assigned_at,
    ),
  ],
);

export const rssFeeds = sqliteTable(
  "rss_feeds",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    server_id: text().notNull(),
    channel_id: text().notNull(),
    name: text().notNull(),
    url: text().notNull(),
    template: text().notNull(),
    webhook_url: text().notNull(),
    webhook_name: text().notNull().default(""),
    webhook_avatar: text().notNull().default(""),
    last_guid: text().notNull().default(""),
    last_checked: text().notNull().default(""),
    created_by: text().notNull(),
    created_at: text()
      .notNull()
      .default(sql`(datetime('now'))`),
    status: text().notNull().default("active"),
    blacklist_json: text().notNull().default(""),
    posted_guids: text().notNull().default("[]"),
  },
  (table) => [
    index("idx_rss_feeds_server").on(table.server_id),
    index("idx_rss_feeds_status_checked").on(table.status, table.last_checked),
  ],
);

export const mudaeResetConfig = sqliteTable("mudae_reset_config", {
  server_id: text().primaryKey(),
  channel_id: text().notNull(),
  output_channel_id: text().notNull(),
  game_name: text().notNull().default("requiem"),
  restore_value: integer().notNull().default(1),
  interval_days: integer().notNull().default(15),
  active_days: integer().notNull().default(7),
  min_messages: integer().notNull().default(80),
  auto_send: integer({ mode: "boolean" }).notNull().default(false),
  enabled: integer({ mode: "boolean" }).notNull().default(true),
  last_run_at: text(),
  created_at: text()
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const mudaeActivity = sqliteTable(
  "mudae_activity",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    user_id: text().notNull(),
    channel_id: text().notNull(),
    last_message: text().notNull(),
    msg_count: integer().notNull().default(0),
  },
  (table) => [
    uniqueIndex("idx_mudae_activity_user_channel").on(
      table.user_id,
      table.channel_id,
    ),
    index("idx_mudae_activity_channel").on(table.channel_id),
  ],
);

export const schema = {
  users,
  servers,
  channels,
  roles,
  customRoles,
  logs,
  levels,
  rewardRoles,
  serverSettings,
  serverEventConfig,
  events,
  eventParticipants,
  eventActivities,
  reminders,
  newMemberRestrictions,
  rssFeeds,
  mudaeResetConfig,
  mudaeActivity,
};
