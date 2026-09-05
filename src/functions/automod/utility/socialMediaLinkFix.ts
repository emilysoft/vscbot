import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";

const SOCIAL_MEDIA_PATTERNS = [
  {
    name: "twitter",
    domains: ["x.com", "twitter.com"],
    replacement: "fixupx.com",
    regex: /https?:\/\/(?:www\.)?\b(x|twitter)\b\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+/gim,
  },
  {
    name: "instagram",
    domains: ["instagram.com"],
    replacement: "oginstagram.com",
    regex: /https?:\/\/(?:www\.)?instagram\.com\/(?:[a-zA-Z0-9_.]+\/)?(?:p|reel|reels|tv)\/[a-zA-Z0-9_-]+/gim,
  },
  {
    name: "facebook",
    domains: ["facebook.com", "fb.watch"],
    replacement: "facebed.com",
    regex: /https?:\/\/(?:www\.)?(facebook\.com|fb\.watch)\/[a-zA-Z0-9_/]+\/?/gim,
  },
  {
    name: "tiktok",
    domains: ["tiktok.com"],
    replacement: "kktiktok.com",
    regex: /https?:\/\/(?:www\.|vm\.|m\.|vt\.)?tiktok\.com\/[a-zA-Z0-9@_./]+/gim,
  },
];

const REPLACEMENT_DOMAINS = ["fixupx.com", "oginstagram.com", "facebed.com", "kktiktok.com"];

const EMBED_SUPPRESSION_DELAY = 1500;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const messagesNeedingEmbedSuppression = new Set<string>();

function extractUrlsOutsideCodeBlocks(content: string): string[] {
  const urls: string[] = [];
  const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
  const cleanedContent = content.replace(codeBlockRegex, (match) => " ".repeat(match.length));

  for (const pattern of SOCIAL_MEDIA_PATTERNS) {
    const matches = cleanedContent.match(pattern.regex);
    if (matches) {
      urls.push(...matches);
    }
  }
  return urls;
}

function isAlreadyFixed(url: string): boolean {
  return REPLACEMENT_DOMAINS.some((domain) => url.includes(domain));
}

function replaceDomains(url: string): string {
  if (isAlreadyFixed(url)) {
    return url;
  }
  for (const pattern of SOCIAL_MEDIA_PATTERNS) {
    for (const domain of pattern.domains) {
      if (url.includes(domain)) {
        return url.replace(domain, pattern.replacement);
      }
    }
  }
  return url;
}

const TWITTER_URL_REGEX = /https?:\/\/(?:www\.)?\b(x|twitter)\b\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/im;

const SPANISH_STOPWORD_COUNT_THRESHOLD = 2;
const SPANISH_STOPWORD_REGEX = /\b(?:de|la|el|que|y|en|es|por|un|una|con|no|lo|se|los|las|del|para|como)\b/gi;

const TWEET_INFO_CACHE_TTL = 6 * 60 * 60 * 1000;

interface TwitterApiResponse {
  tweet?: {
    lang?: string | null;
    text?: string | null;
    author?: { screen_name?: string | null };
  };
  lang?: string | null;
  text?: string | null;
  user_screen_name?: string | null;
}

interface TweetInfo {
  lang: string | null;
  screenName: string | null;
  text: string | null;
  timestamp: number;
}

const tweetInfoCache = new Map<string, TweetInfo>();

function extractTwitterInfo(url: string): { id: string; handle: string } | null {
  const match = url.match(TWITTER_URL_REGEX);
  if (!match) {
    return null;
  }
  return { id: match[3], handle: match[2] };
}

function looksSpanish(text: string): boolean {
  const count = text.toLowerCase().match(SPANISH_STOPWORD_REGEX);
  return (count ? count.length : 0) >= SPANISH_STOPWORD_COUNT_THRESHOLD;
}

async function fetchTweetInfo(id: string): Promise<TweetInfo | null> {
  const cached = tweetInfoCache.get(id);
  if (cached && Date.now() - cached.timestamp < TWEET_INFO_CACHE_TTL) {
    return cached;
  }

  const endpoints: Array<() => Promise<Omit<TweetInfo, "timestamp"> | null>> = [
    async () => {
      const res = await fetch(`https://api.fxtwitter.com/status/${id}`, {
        headers: { "User-Agent": "vscbot-socialMediaLinkFix/1.0" },
      });
      if (!res.ok) {
        return null;
      }
      const json = (await res.json()) as TwitterApiResponse;
      const tweet = json.tweet;
      if (!tweet) {
        return null;
      }
      return {
        lang: typeof tweet.lang === "string" ? tweet.lang : null,
        screenName: tweet.author?.screen_name ?? null,
        text: typeof tweet.text === "string" ? tweet.text : null,
      };
    },
    async () => {
      const res = await fetch(`https://api.vxtwitter.com/status/${id}`, {
        headers: { "User-Agent": "vscbot-socialMediaLinkFix/1.0" },
      });
      if (!res.ok) {
        return null;
      }
      const json = (await res.json()) as TwitterApiResponse;
      if (!json) {
        return null;
      }
      return {
        lang: typeof json.lang === "string" ? json.lang : null,
        screenName: json.user_screen_name ?? null,
        text: typeof json.text === "string" ? json.text : null,
      };
    },
  ];

  for (const fetchEndpoint of endpoints) {
    try {
      const info = await fetchEndpoint();
      if (info) {
        const fullInfo: TweetInfo = { ...info, timestamp: Date.now() };
        tweetInfoCache.set(id, fullInfo);
        return fullInfo;
      }
    } catch {
      // try next endpoint
    }
  }
  return null;
}

async function fixTwitterUrl(url: string): Promise<string> {
  const info = extractTwitterInfo(url);
  if (!info) {
    return replaceDomains(url);
  }

  const tweetInfo = await fetchTweetInfo(info.id);
  const lang = tweetInfo?.lang;
  let needsTranslation = true;
  if (lang) {
    needsTranslation = !lang.toLowerCase().startsWith("es");
  } else if (tweetInfo?.text) {
    needsTranslation = !looksSpanish(tweetInfo.text);
  }

  const screenName = tweetInfo?.screenName || info.handle;
  const baseUrl = `https://fixupx.com/${screenName}/status/${info.id}`;
  return needsTranslation ? `${baseUrl}/es` : baseUrl;
}

async function suppressEmbedsWithRetry(message: Message, retries = MAX_RETRIES, delay = RETRY_DELAY): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await message.suppressEmbeds(true);
      return true;
    } catch (error: unknown) {
      const err = error as { code?: number; retry_after?: number };
      if (err.code === 50035 || err.code === 50013) {
        return false;
      }
      if (err.code === 429) {
        const retryAfter = err.retry_after || delay;
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        continue;
      }
      if (attempt === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}

async function processMessage(message: Message): Promise<void> {
  if (!message.guild || !message.channel || !(message.channel instanceof TextChannel)) {
    return;
  }
  if (!message.content || message.content.trim() === "") {
    return;
  }
  if (message.author.bot) {
    return;
  }

  const urls = extractUrlsOutsideCodeBlocks(message.content);
  if (urls.length === 0) {
    return;
  }

  const candidates = urls.filter((url) => !isAlreadyFixed(url));
  const fixedUrls = await Promise.all(
    candidates.map((url) => (extractTwitterInfo(url) ? fixTwitterUrl(url) : replaceDomains(url)))
  );
  const processedUrls = [...new Set(fixedUrls)];

  if (processedUrls.length === 0) {
    return;
  }

  const replyContent = processedUrls.map((url) => `[.](${url})`).join("\n");
  await message.reply({
    content: replyContent,
    allowedMentions: { repliedUser: false },
  });

  messagesNeedingEmbedSuppression.add(message.id);
  await suppressEmbedsWithRetry(message);

  setTimeout(async () => {
    try {
      const fetchedMessage = await message.channel.messages.fetch(message.id).catch(() => null);
      if (fetchedMessage && fetchedMessage.embeds.length > 0) {
        await suppressEmbedsWithRetry(fetchedMessage);
      }
    } catch {
      // Ignore fetch errors
    } finally {
      messagesNeedingEmbedSuppression.delete(message.id);
    }
  }, EMBED_SUPPRESSION_DELAY);
}

async function handleMessageUpdate(message: Message): Promise<void> {
  if (!messagesNeedingEmbedSuppression.has(message.id)) {
    return;
  }

  if (message.embeds?.length > 0) {
    await suppressEmbedsWithRetry(message);
    messagesNeedingEmbedSuppression.delete(message.id);
  }
}

export default {
  name: "socialMediaLinkFix",
  scope: "global",
  ignoreBots: true,
  allowEdited: false,
  execute: async function (message: Message, client: Client) {
    try {
      await processMessage(message);
    } catch (err) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  },
  onMessageUpdate: async function (message: Message, client: Client) {
    try {
      await handleMessageUpdate(message);
    } catch (err) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  },
} as Iautomod & { onMessageUpdate?: (message: Message, client: Client) => Promise<void> };