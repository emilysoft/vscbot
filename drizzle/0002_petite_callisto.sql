CREATE TABLE `automod_settings` (
	`guild_id` text PRIMARY KEY NOT NULL,
	`global_enabled` integer DEFAULT true NOT NULL,
	`disabled` text DEFAULT '[]' NOT NULL,
	`overrides` text DEFAULT '{}' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
