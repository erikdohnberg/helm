import type { ChatPlatformId } from "@/lib/integrations/chat-platforms";

/** Mock Slack user ID → display name. Replace with Slack users.info when integrated. */
const MOCK_SLACK_DISPLAY_NAMES: Record<string, string> = {
  U01ABC: "Jordan Lee",
  U02DEF: "Sam Chen",
  U03GHI: "Alex Rivera",
};

function normalizeSlackUserId(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("@")) s = s.slice(1);
  return s;
}

function resolveSlackDisplayNameOnly(userId: string): string | null {
  const key = normalizeSlackUserId(userId);
  if (!key) return null;
  return MOCK_SLACK_DISPLAY_NAMES[key] ?? null;
}

/** Avatar URL for demo (generated from display name). Not from Slack CDN until API is wired. */
function demoAvatarUrlForDisplayName(displayName: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128&background=eaf0f6&color=1e293b`;
}

/**
 * Resolve a chat user ID to display name + profile image URL (mock / demo).
 * Non-Slack platforms return null until real APIs are wired.
 */
export function resolveChatUserProfile(
  platform: ChatPlatformId,
  userId: string
): { displayName: string; imageUrl: string } | null {
  if (platform !== "slack") return null;
  const displayName = resolveSlackDisplayNameOnly(userId);
  if (!displayName) return null;
  return {
    displayName,
    imageUrl: demoAvatarUrlForDisplayName(displayName),
  };
}

/**
 * Resolve a chat user ID to a display name for the given platform (mock / demo).
 * Non-Slack platforms return null until real APIs are wired.
 */
export function resolveChatUserDisplayName(
  platform: ChatPlatformId,
  userId: string
): string | null {
  return resolveChatUserProfile(platform, userId)?.displayName ?? null;
}

/** @deprecated Prefer resolveChatUserDisplayName("slack", userId) */
export function resolveSlackUserDisplayName(userId: string): string | null {
  return resolveChatUserDisplayName("slack", userId);
}
