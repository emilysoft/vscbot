export interface DB_Reminder {
  id?: number;
  server_id: string;
  channel_id: string;
  message: string;
  remind_at: string;
  created_by: string;
  created_at: string;
  status: string;
  recurring: number;
}
