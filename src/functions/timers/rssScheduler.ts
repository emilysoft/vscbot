import Parser from "rss-parser";
import { WebhookClient } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import { DB_RssFeed } from "../../db/RssTypes.js";

const parser = new Parser();

interface BlacklistCondition {
  field: string;
  operator: "equal" | "regex_match" | "content";
  negative: boolean;
  value: string;
}

interface BlacklistConfig {
  conditions: BlacklistCondition[];
}

function getFieldValue(item: Parser.Item, field: string): string {
  if (field === "title") return item.title || "";
  if (field === "link") return item.link || "";
  if (field === "description") return (item as any).contentSnippet || (item as any).content || (item as any).description || "";
  if (field === "author") return (item as any).creator || (item as any).author || "";
  if (field === "pubDate") return (item as any).pubDate || (item as any).isoDate || "";
  return (item as any)[field] || "";
}

function evaluateCondition(item: Parser.Item, condition: BlacklistCondition): boolean {
  const fieldValue = getFieldValue(item, condition.field);
  let match: boolean;

  switch (condition.operator) {
    case "equal":
      match = fieldValue === condition.value;
      break;
    case "regex_match":
      try {
        match = new RegExp(condition.value, "i").test(fieldValue);
      } catch {
        match = false;
      }
      break;
    case "content":
      match = fieldValue.toLowerCase().includes(condition.value.toLowerCase());
      break;
    default:
      match = false;
  }

  return condition.negative ? !match : match;
}

export function isBlacklisted(item: Parser.Item, blacklistJson: string): boolean {
  if (!blacklistJson) return false;
  try {
    const config: BlacklistConfig = JSON.parse(blacklistJson);
    if (!config.conditions?.length) return false;
    return config.conditions.every(c => evaluateCondition(item, c));
  } catch {
    return false;
  }
}

function applyTemplate(template: string, item: Parser.Item, feed: Parser.Output<Parser.Item>): string {
  return template
    .replace(/\{title\}/g, item.title || '')
    .replace(/\{link\}/g, item.link || '')
    .replace(/\{description\}/g, (item as any).contentSnippet || (item as any).content || (item as any).description || '')
    .replace(/\{author\}/g, (item as any).creator || (item as any).author || '')
    .replace(/\{pubDate\}/g, (item as any).pubDate || (item as any).isoDate || '')
    .replace(/\{feedTitle\}/g, feed.title || '')
    .replace(/\{feedLink\}/g, feed.link || '');
}

function getItemGuid(item: Parser.Item): string {
  return item.guid || item.link || item.title || '';
}

export async function previewFeed(feedUrl: string, template: string): Promise<{ rendered: string; item: Parser.Item | null; feedTitle: string }> {
  const parsed = await parser.parseURL(feedUrl);
  const item = parsed.items?.[0] || null;
  const rendered = item ? applyTemplate(template, item, parsed) : '*No hay items en el feed*';
  return { rendered, item, feedTitle: parsed.title || 'Sin título' };
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s;
}

export async function detectFeedFields(feedUrl: string): Promise<{
  feedTitle: string;
  itemAvailable: boolean;
  fields: { variable: string; available: boolean; value: string }[];
} | null> {
  try {
    const parsed = await parser.parseURL(feedUrl);
    const item = parsed.items?.[0];
    const i = (item || {}) as any;

    return {
      feedTitle: parsed.title || 'Sin título',
      itemAvailable: !!item,
      fields: [
        { variable: '{title}', available: !!i.title, value: i.title || '' },
        { variable: '{link}', available: !!i.link, value: i.link || '' },
        { variable: '{description}', available: !!(i.contentSnippet || i.content || i.description), value: truncate(i.contentSnippet || i.content || i.description || '', 200) },
        { variable: '{author}', available: !!(i.creator || i.author), value: i.creator || i.author || '' },
        { variable: '{pubDate}', available: !!(i.pubDate || i.isoDate), value: i.pubDate || i.isoDate || '' },
        { variable: '{feedTitle}', available: !!parsed.title, value: parsed.title || '' },
        { variable: '{feedLink}', available: !!parsed.link, value: parsed.link || '' },
      ],
    };
  } catch {
    return null;
  }
}

export async function getLatestItemPreview(feedUrl: string): Promise<{ title: string; link: string; description: string; pubDate: string; author: string } | null> {
  try {
    const parsed = await parser.parseURL(feedUrl);
    const item = parsed.items?.[0];
    if (!item) return null;
    const i = item as any;
    return {
      title: truncate(i.title || 'Sin título', 200),
      link: i.link || '',
      description: truncate(i.contentSnippet || i.content || i.description || '', 500),
      pubDate: i.pubDate || i.isoDate || '',
      author: i.creator || i.author || '',
    };
  } catch {
    return null;
  }
}

async function checkFeed(client: Client, feed: DB_RssFeed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    if (!parsed.items || parsed.items.length === 0) return;

    const newItems: Parser.Item[] = [];
    for (const item of parsed.items) {
      const guid = getItemGuid(item);
      if (!guid) continue;
      if (feed.last_guid && guid === feed.last_guid) break;
      newItems.push(item);
    }
    newItems.reverse();

    if (newItems.length === 0) return;

    const filtered = feed.blacklist_json
      ? newItems.filter(item => !isBlacklisted(item, feed.blacklist_json))
      : newItems;

    for (const item of filtered) {
      const content = applyTemplate(feed.template, item, parsed);
      const webhookClient = new WebhookClient({ url: feed.webhook_url });
      await webhookClient.send({
        content,
        username: feed.webhook_name || feed.name,
        avatarURL: feed.webhook_avatar || undefined,
      });
    }

    const latestItem = parsed.items[0];
    const latestGuid = getItemGuid(latestItem);
    await client.db.rss.update(feed.id!, {
      last_guid: latestGuid,
      last_checked: new Date().toISOString(),
    });
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} timers/rssScheduler`);
  }
}

export async function initRssScheduler(client: Client) {
  const feeds = await client.db.rss.getActive();

  for (const feed of feeds) {
    if (feed.id) await checkFeed(client, feed);
  }

  console.log(`[rssScheduler] Checked ${feeds.length} RSS feeds`);

  setInterval(async () => {
    const active = await client.db.rss.getActive();
    for (const feed of active) {
      if (feed.id) await checkFeed(client, feed);
    }
  }, 5 * 60 * 1000);
}
