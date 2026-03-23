import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  getChatPlatformLabel,
  resolveChatPlatformId,
} from "@/lib/integrations/chat-platforms";

import { SystemSettingsClient } from "./system-settings-client";

export default async function SystemSettingsPage() {
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

  return (
    <SystemSettingsClient
      chatIntegrationLabel={getChatPlatformLabel(platform)}
    />
  );
}
