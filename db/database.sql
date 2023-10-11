CREATE TABLE IF NOT EXISTS channels_blacklist (
	channel_id VARCHAR(20) NOT NULL
);
CREATE TABLE IF NOT EXISTS categories_blacklist (
	category_id VARCHAR(20) NOT NULL,
	admin VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_blacklist (
	role_id VARCHAR(20) NOT NULL
);
CREATE TABLE IF NOT EXISTS users_blacklist (
	user_id VARCHAR(20) NOT NULL
);
CREATE TABLE IF NOT EXISTS servers (
    id PRIMARY KEY AUTO INCRIMENT
	server_id VARCHAR(20) NOT NULL
);
CREATE TABLE IF NOT EXISTS banned_users (
    user_id VARCHAR(20) NOT NULL,
    username VARCHAR(32) NOT NULL,
    display_name VARCHAR(32) NOT NULL DEFAULT "Unknown displayname",
);
CREATE TABLE prefix (
    server VARCHAR(20) NOT NULL,
    prefix VARCHAR(5) NOT NULL
);
CREATE TABLE auto_respond (
    regex TEXT NOT NULL;
    server  
);