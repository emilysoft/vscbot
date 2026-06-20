export interface DB_RssFeed {
  id?: number;
  server_id: string;
  channel_id: string;
  name: string;
  url: string;
  template: string;
  webhook_url: string;
  webhook_name: string;
  webhook_avatar: string;
  last_guid: string;
  last_checked: string;
  created_by: string;
  created_at: string;
  status: string;
  blacklist_json: string;
}
