/**
 * Chat platform IDs aligned with Vercel Chat SDK adapter names
 * (@chat-adapter/slack, @chat-adapter/teams, …).
 */

export const CHAT_PLATFORM_IDS = [
  "slack",
  "teams",
  "gchat",
  "discord",
  "telegram",
  "github",
  "linear",
  "whatsapp",
] as const;

export type ChatPlatformId = (typeof CHAT_PLATFORM_IDS)[number];

export const DEFAULT_CHAT_PLATFORM: ChatPlatformId = "slack";

export const CHAT_PLATFORMS: ReadonlyArray<{
  id: ChatPlatformId;
  label: string;
}> = [
  { id: "slack", label: "Slack" },
  { id: "teams", label: "Microsoft Teams" },
  { id: "gchat", label: "Google Chat" },
  { id: "discord", label: "Discord" },
  { id: "telegram", label: "Telegram" },
  { id: "github", label: "GitHub" },
  { id: "linear", label: "Linear" },
  { id: "whatsapp", label: "WhatsApp" },
];

const LABEL_BY_ID: Record<ChatPlatformId, string> = Object.fromEntries(
  CHAT_PLATFORMS.map((p) => [p.id, p.label])
) as Record<ChatPlatformId, string>;

export function isChatPlatformId(value: string): value is ChatPlatformId {
  return (CHAT_PLATFORM_IDS as readonly string[]).includes(value);
}

export function getChatPlatformLabel(id: ChatPlatformId): string {
  return LABEL_BY_ID[id];
}

/** Use when DB value may be null/unknown (e.g. pre-migration). */
export function resolveChatPlatformId(
  raw: string | null | undefined
): ChatPlatformId {
  if (raw && isChatPlatformId(raw)) return raw;
  return DEFAULT_CHAT_PLATFORM;
}

/** Label for the roster field that stores the member’s ID on the primary chat platform. */
export function getChatMemberIdFieldLabel(platform: ChatPlatformId): string {
  const label = getChatPlatformLabel(platform);
  return `${label} user ID`;
}

/** Short phrase for defaults copy: where threads / notifications will run once connected. */
export function getDefaultConversationLocationPhrase(
  platform: ChatPlatformId
): string {
  switch (platform) {
    case "slack":
      return "your Slack workspace";
    case "teams":
      return "Microsoft Teams";
    case "gchat":
      return "Google Chat";
    case "discord":
      return "Discord";
    case "telegram":
      return "Telegram";
    case "github":
      return "GitHub";
    case "linear":
      return "Linear";
    case "whatsapp":
      return "WhatsApp";
    default:
      return getChatPlatformLabel(platform);
  }
}
