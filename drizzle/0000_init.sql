CREATE TABLE IF NOT EXISTS `channels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel_id` text NOT NULL,
	`server_id` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `channels_channel_id_unique` ON `channels` (`channel_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_channels_server` ON `channels` (`server_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `customRoles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`server_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	`left_since` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_custom_roles_user_server` ON `customRoles` (`user_id`,`server_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_custom_roles_role` ON `customRoles` (`role_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `event_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`name` text NOT NULL,
	`success_count` integer DEFAULT 0 NOT NULL,
	`total_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_event_activities_event` ON `event_activities` (`event_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `event_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` text NOT NULL,
	`left_at` text,
	`duration_sec` integer,
	`source` text DEFAULT 'voice' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_event_participants_event` ON `event_participants` (`event_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_event_participants_user` ON `event_participants` (`event_id`,`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`role_id` text,
	`channel_id` text,
	`custom_message` text,
	`use_discord_event` integer DEFAULT false NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`recurrence` text DEFAULT 'none' NOT NULL,
	`activities` text DEFAULT '[]' NOT NULL,
	`channel_behavior` text DEFAULT 'delete' NOT NULL,
	`retention_hours` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`created_by` text NOT NULL,
	`voice_channel_id` text,
	`text_channel_id` text,
	`message_id` text,
	`discord_event_id` text,
	`reminder_sent` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`text_channel_name` text,
	`channel_topic` text,
	`voice_channel_name` text,
	`require_confirmation` integer,
	`image_url` text,
	`send_events_channel_msg` integer DEFAULT true,
	`events_channel_message_id` text,
	`is_private` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_events_server_status_start` ON `events` (`server_id`,`status`,`start_time`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_events_status_start` ON `events` (`status`,`start_time`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `levels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`server_id` integer NOT NULL,
	`xp` integer NOT NULL,
	`level` integer NOT NULL,
	`last_message` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_levels_user_server` ON `levels` (`user_id`,`server_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_levels_server_xp` ON `levels` (`server_id`,`xp`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` integer NOT NULL,
	`channel_id` integer,
	`user_id` integer NOT NULL,
	`interaction` text NOT NULL,
	`log_type` text NOT NULL,
	`creation_date` text NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_logs_user_server_type_date` ON `logs` (`user_id`,`server_id`,`log_type`,`creation_date`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `mudae_activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`last_message` text NOT NULL,
	`msg_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_mudae_activity_user_channel` ON `mudae_activity` (`user_id`,`channel_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_mudae_activity_channel` ON `mudae_activity` (`channel_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `mudae_reset_config` (
	`server_id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`output_channel_id` text NOT NULL,
	`game_name` text DEFAULT 'requiem' NOT NULL,
	`restore_value` integer DEFAULT 1 NOT NULL,
	`interval_days` integer DEFAULT 15 NOT NULL,
	`active_days` integer DEFAULT 7 NOT NULL,
	`min_messages` integer DEFAULT 80 NOT NULL,
	`auto_send` integer DEFAULT false NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`last_run_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `new_member_restrictions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`server_id` text NOT NULL,
	`role_id` text NOT NULL,
	`assigned_at` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_new_member_restrictions_user` ON `new_member_restrictions` (`user_id`,`server_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_new_member_restrictions_status` ON `new_member_restrictions` (`status`,`assigned_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`message` text NOT NULL,
	`remind_at` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`recurring` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_reminders_server` ON `reminders` (`server_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_reminders_status_remind` ON `reminders` (`status`,`remind_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `reward_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer NOT NULL,
	`level` integer NOT NULL,
	`server_id` integer NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_reward_roles_server` ON `reward_roles` (`server_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_reward_roles_role` ON `reward_roles` (`role_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` text NOT NULL,
	`server_id` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `roles_role_id_unique` ON `roles` (`role_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_roles_server` ON `roles` (`server_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `rss_feeds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`template` text NOT NULL,
	`webhook_url` text NOT NULL,
	`webhook_name` text DEFAULT '' NOT NULL,
	`webhook_avatar` text DEFAULT '' NOT NULL,
	`last_guid` text DEFAULT '' NOT NULL,
	`last_checked` text DEFAULT '' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`blacklist_json` text DEFAULT '' NOT NULL,
	`posted_guids` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_rss_feeds_server` ON `rss_feeds` (`server_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_rss_feeds_status_checked` ON `rss_feeds` (`status`,`last_checked`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `server_event_config` (
	`server_id` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`default_role_id` text DEFAULT '' NOT NULL,
	`events_channel` text DEFAULT '' NOT NULL,
	`logs_channel` text DEFAULT '' NOT NULL,
	`voice_category` text DEFAULT '' NOT NULL,
	`text_category` text DEFAULT '' NOT NULL,
	`archive_category` text DEFAULT '' NOT NULL,
	`use_discord_events` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`require_confirmation` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `server_settings` (
	`server_id` integer PRIMARY KEY NOT NULL,
	`prefix` text DEFAULT '!' NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` text NOT NULL,
	`name` text NOT NULL,
	`owner_id` integer,
	`creation_date` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `servers_server_id_unique` ON `servers` (`server_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_user_id_unique` ON `users` (`user_id`);