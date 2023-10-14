-- Tabla de usuarios
CREATE TABLE users (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT(20) NOT NULL,
    `username` VARCHAR(32) NOT NULL,
    `display_name` VARCHAR(32) DEFAULT 0
);

-- Tabla de servidores
CREATE TABLE servers (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `owner_id` INT,
    FOREIGN KEY (`owner_id`) REFERENCES users(id),
    `creation_date` DATETIME NOT NULL
);

-- Tabla de roles
CREATE TABLE roles (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    `name` VARCHAR(100) NOT NULL,
    `color` VARCHAR(7) DEFAULT '#000000'
);

-- Tabla de canales
CREATE TABLE channels (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    `name` VARCHAR(100),
    `type` INT(2),
    `nsfw` BOOLEAN DEFAULT false
);

CREATE TABLE categories (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    `name` VARCHAR(100)
);

-- tabla de regex para autoresponds y automod
CREATE TABLE regexs (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `regex` TEXT NOT NULL
);

-- Tabla de configuraciones del bot
CREATE TABLE settings_bot (
    id INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    `prefix` VARCHAR(3),
    `message_log` BOOLEAN DEFAULT false,
    `join_id_log` BOOLEAN DEFAULT false,
    `timezone` VARCHAR(50)
);

-- tablas de log channels
CREATE TABLE log_channels (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `channel_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`channel_id`) REFERENCES channels(id)
);

-- tablas de join channels
CREATE TABLE log_join_channels (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `channel_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`channel_id`) REFERENCES channels(id)
);

-- Tabla de estadísticas de uso de comandos
CREATE TABLE command_stats (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `command_name` VARCHAR(30),
    `server_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    `usage_count` INT NOT NULL,
    `last_usage` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- tabla de canales ignoradas por el automod
CREATE TABLE blacklist_automod_channels (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `channel_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`channel_id`) REFERENCES channels(id)
);

-- tabla de categorias ignoradas por el automod
CREATE TABLE blacklist_automod_categories (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `category_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`category_id`) REFERENCES categories(id)
);

-- tabla de categorias ignoradas por el automod
CREATE TABLE blacklist_automod_roles (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `role_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`role_id`) REFERENCES roles(id)
);

-- Usuarios baneados
CREATE TABLE banned_users (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT,
    `server_id` INT,
    FOREIGN KEY (`user_id`) REFERENCES users(id),
    FOREIGN KEY (`server_id`) REFERENCES servers(id)
);

-- tabla de canales ignorados por comandos 
CREATE TABLE blacklist_cmds_channels (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `channel_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`channel_id`) REFERENCES channels(id)
);

-- tabla de categorias ignoradas por comandos 
CREATE TABLE blacklist_cmds_categories (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `category_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`category_id`) REFERENCES categories(id)
);

-- tabla de categorias ignoradas por comandos 
CREATE TABLE blacklist_cmds_roles (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `role_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`role_id`) REFERENCES roles(id)
);

-- tabla de canales donde los mensajes tienen para dar likes 
CREATE TABLE likes_channels (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `channel_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`channel_id`) REFERENCES channels(id)
);

--- CONFIGURACIONES DEL AUTOMOD ----
-- tabla de configuraciones automod
CREATE TABLE settings_automod (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    `crypto` BOOLEAN DEFAULT false,
    `invite` BOOLEAN DEFAULT false,
    `ban_username` BOOLEAN DEFAULT false,
    `no_links` BOOLEAN DEFAULT false,
    `scamming` BOOLEAN DEFAULT false,
    `images_perms_reminder` BOOLEAN DEFAULT false,
    `new_channel` BOOLEAN DEFAULT false,
    `textwall` BOOLEAN DEFAULT false
);

-- tabla de configuraciones del anti crypto automod 
CREATE TABLE settings_crypto (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `roles_ignored` TEXT NOT NULL,
    `users_ignored` TEXT NOT NULL,
    `channels_ignored` TEXT NOT NULL,
    `categories_ignored` TEXT NOT NULL,
    FOREIGN KEY (`server_id`) REFERENCES servers(id)
);

-- tabla de configuraciones del anti invite automod 
CREATE TABLE settings_invite (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `roles_ignored` TEXT NOT NULL,
    `users_ignored` TEXT NOT NULL,
    `channels_ignored` TEXT NOT NULL,
    `categories_ignored` TEXT NOT NULL,
    FOREIGN KEY (`server_id`) REFERENCES servers(id)
);

-- tabla de configuraciones del anti link automod 
CREATE TABLE settings_links (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `roles_ignored` TEXT NOT NULL,
    `users_ignored` TEXT NOT NULL,
    `channels_ignored` TEXT NOT NULL,
    `categories_ignored` TEXT NOT NULL,
    FOREIGN KEY (`server_id`) REFERENCES servers(id)
);

-- tabla de configuraciones del anti scam automod 
CREATE TABLE settings_scamming (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `roles_ignored` TEXT NOT NULL,
    `users_ignored` TEXT NOT NULL,
    `channels_ignored` TEXT NOT NULL,
    `categories_ignored` TEXT NOT NULL,
    FOREIGN KEY (`server_id`) REFERENCES servers(id)
);

-- tabla de configuraciones del automod avisa a un usuario cuando no puede enviar imagenes 
CREATE TABLE settings_images_perms (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `user_id` INT,
    FOREIGN KEY (`server_id`) REFERENCES servers(id),
    FOREIGN KEY (`user_id`) REFERENCES users(id)
);

CREATE TABLE settings_new_channel (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `roles_ignored` TEXT NOT NULL,
    `users_ignored` TEXT NOT NULL,
    `channels_ignored` TEXT NOT NULL,
    `categories_ignored` TEXT NOT NULL,
    FOREIGN KEY (`server_id`) REFERENCES servers(id)
);

CREATE TABLE settings_textwall(
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `server_id` INT,
    `roles_ignored` TEXT NOT NULL,
    `users_ignored` TEXT NOT NULL,
    `channels_ignored` TEXT NOT NULL,
    `categories_ignored` TEXT NOT NULL,
    FOREIGN KEY (`server_id`) REFERENCES servers(id)
);