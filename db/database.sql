-- #####################################################################
-- # 1. TABLAS PRINCIPALES (ENTIDADES FUNDAMENTALES)
-- #####################################################################

-- Tabla de usuarios (participantes de todos los servidores)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    username VARCHAR NOT NULL,
);

-- Tabla de servidores (gremios o comunidades)
CREATE TABLE servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    owner_id INTEGER,
    creation_date TEXT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de roles dentro de un servidor
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL UNIQUE,
    server_id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

CREATE TABLE customRoles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    server_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
-- Tabla de canales dentro de un servidor
CREATE TABLE channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL UNIQUE,
    server_id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- Tabla de categorías de canales dentro de un servidor
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL UNIQUE,
    server_id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

---

-- #####################################################################
-- # 2. TABLAS DE CONFIGURACIÓN Y FUNCIONALIDADES
-- #####################################################################

-- Tabla para configuraciones generales del bot por servidor
CREATE TABLE server_settings (
    server_id INTEGER PRIMARY KEY,
    prefix VARCHAR DEFAULT '!',
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- Tabla para configurar los canales de logs
CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL,
    channel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    interaction TEXT NOT NULL,
    log_type TEXT NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para canales donde se permite la funcionalidad de 'likes'
-- CREATE TABLE likeable_channels (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     server_id INTEGER NOT NULL,
--     channel_id INTEGER NOT NULL,
--     emoji TEXT NOT NULL,
--     FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
--     FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
--     UNIQUE(server_id, channel_id)
-- );

-- Tabla para baneos específicos de la plataforma
CREATE TABLE server_bans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reason TEXT DEFAULT NULL,
    ban_date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(server_id, user_id)
);

---

-- #####################################################################
-- # 3. SISTEMA DE AUTOMOD Y LISTAS NEGRAS
-- #####################################################################

-- Tabla UNIFICADA de listas negras.
CREATE TABLE blacklists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL,
    entity_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL,
    scope TEXT NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    UNIQUE(server_id, entity_id, entity_type, scope)
);

-- Tabla principal de configuraciones del automod.
CREATE TABLE automod_settings (
    server_id INTEGER PRIMARY KEY,
    crypto_enabled BOOLEAN DEFAULT 0,
    invite_enabled BOOLEAN DEFAULT 0,
    links_enabled BOOLEAN DEFAULT 0,
    scam_enabled BOOLEAN DEFAULT 0,
    textwall_enabled BOOLEAN DEFAULT 0,
    images_perms_reminder_enabled BOOLEAN DEFAULT 0,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- Tabla de enlace UNIFICADA para todas las excepciones del automod.
CREATE TABLE automod_ignored_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL,
    module TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    UNIQUE(server_id, module, entity_id, entity_type)
);

-- Tabla para las expresiones regulares (regex)
CREATE TABLE regexes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    pattern TEXT NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

---

-- #####################################################################
-- # 4. TABLAS DE ESTADÍSTICAS Y AUDITORÍA
-- #####################################################################

-- Tabla de estadísticas de uso de comandos
CREATE TABLE command_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL,
    command_name VARCHAR NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 1,
    last_used TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    UNIQUE(server_id, command_name)
);
