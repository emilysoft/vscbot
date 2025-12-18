// Definición de tipos para las tablas de la base de datos
export interface DB_User {
    id?: number;
    user_id: string; // BIGINT se maneja como string para evitar problemas de precisión
    username: string;
}

export interface DB_Server {
    id?: number;
    server_id: string;
    name: string;
    owner_id: number;
    creation_date: string;
}

export interface DB_Channel {
    id?: number;
    channel_id: string;
    name: string;
    server_id: number;
}

export interface DB_Role {
    id?: number;
    role_id: string;
    name: string;
    server_id: number;
}
export interface DB_Logs {
    id?: number;
    server_id: number;
    channel_id?: number;
    user_id: number;
    interaction: string;
    logType: string;
    creation_date: string;
}

export interface DB_ServerSettings {
    server_id: number;
    prefix: string;
}

export interface DB_CustomRole {
    id?: number,
    user_id: number;
    server_id: number;
    role_id: number;
}

export interface DB_Logs_Fetched {
    channel_name: string;
    username: string;
    creation_date: string;
}

export interface DB_UserLevel {
    id?: number;
    user_id: number;
    server_id: number;
    total_xp: number;
    level: number;
    last_message: string;
}

export interface RankData {
    username: string;
    level: number;
    totalXp: number;
    xpToNextLevel: number;
    xpProgress: number; // XP actual en el nivel
    rank?: number; // Posición global o en el servidor
}
