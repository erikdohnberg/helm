import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  getDefaultConversationLocationPhrase,
  resolveChatPlatformId,
} from "@/lib/integrations/chat-platforms";

import { DefaultsSettingsClient } from "./defaults-settings-client";

export default async function DefaultsSettingsPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? null;
  let platform = resolveChatPlatformId(null);
  if (orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { primaryChatPlatform: true },
    });
    platform = resolveChatPlatformId(org?.primaryChatPlatform);
  }
  const conversationLocationPhrase =
    getDefaultConversationLocationPhrase(platform);

  return (
    <DefaultsSettingsClient
      conversationLocationPhrase={conversationLocationPhrase}
    />
  );
}
