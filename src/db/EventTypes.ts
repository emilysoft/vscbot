export interface DB_EventConfig {
  server_id: string;
  enabled: number;
  default_role_id: string;
  events_channel: string;
  logs_channel: string;
  voice_category: string;
  text_category: string;
  archive_category: string;
  use_discord_events: number;
  require_confirmation: number;
  created_at: string;
}

export interface DB_ScheduledEvent {
  id?: number;
  server_id: string;
  name: string;
  description: string;
  role_id: string | null;
  channel_id: string | null;
  custom_message: string | null;
  use_discord_event: number;
  start_time: string;
  end_time: string | null;
  recurrence: string;
  activities: string;
  channel_behavior: string;
  retention_hours: number;
  status: string;
  created_by: string;
  text_channel_name: string | null;
  channel_topic: string | null;
  voice_channel_name: string | null;
  image_url: string | null;
  require_confirmation: number | null;
  send_events_channel_msg: number | null;
  events_channel_message_id: string | null;
  voice_channel_id: string | null;
  text_channel_id: string | null;
  message_id: string | null;
  discord_event_id: string | null;
  reminder_sent: number;
  created_at: string;
}

export interface DB_EventParticipant {
  id?: number;
  event_id: number;
  user_id: string;
  joined_at: string;
  left_at: string | null;
  duration_sec: number | null;
  source: string;
}

export interface DB_EventActivity {
  id?: number;
  event_id: number;
  name: string;
  success_count: number;
  total_count: number;
}
