import raw from "./config.json" with { type: "json" };

export default raw;
export const config = raw;

export type ChannelKey = keyof typeof raw.channels;
export type CategoryKey = keyof typeof raw.categories;
export type RoleKey = keyof typeof raw.roles;
export type UserKey = keyof typeof raw.users;
export type BotKey = keyof typeof raw.bots;

export const channelId = (key: ChannelKey): string => raw.channels[key];
export const categoryId = (key: CategoryKey): string => raw.categories[key];
export const roleId = (key: RoleKey): string => raw.roles[key];
export const userId = (key: UserKey): string => raw.users[key];
export const botId = (key: BotKey): string => raw.bots[key];

export const channelIds = (keys: readonly ChannelKey[]): string[] =>
  keys.map(channelId);
export const categoryIds = (keys: readonly CategoryKey[]): string[] =>
  keys.map(categoryId);
export const roleIds = (keys: readonly RoleKey[]): string[] => keys.map(roleId);
export const userIds = (keys: readonly UserKey[]): string[] => keys.map(userId);

export const ownerIds = raw.owners.map((key) => raw.users[key as UserKey]);
export const isOwner = (id: string): boolean => ownerIds.includes(id);

export const ignoredChannelIds = channelIds(raw.ignoredChannels as ChannelKey[]);
export const ignoredCategoryIds = categoryIds(
  raw.ignoredCategories as CategoryKey[],
);
export const allowedChannelIds = channelIds(
  raw.allowedChannels as ChannelKey[],
);
