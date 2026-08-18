export interface DB_MudaeResetConfig {
  server_id: string;
  channel_id: string;
  output_channel_id: string;
  game_name: string;
  restore_value: number;
  interval_days: number;
  active_days: number;
  auto_send: number;
  enabled: number;
  last_run_at: string | null;
  created_at: string;
}

export interface DB_MudaeActivity {
  id?: number;
  user_id: string;
  channel_id: string;
  last_message: string;
}