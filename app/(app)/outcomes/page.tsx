import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  getChatPlatformLabel,
  resolveChatPlatformId,
} from "@/lib/integrations/chat-platforms";
import { quarterFromOrgRow } from "@/lib/org/fiscal-quarter";

import OutcomesPageClient from "./outcomes-page-client";

export default async function OutcomesPage() {
  const session = await auth();
  const orgId = (session?.user as { orgId?: string })?.orgId;

  let workspaceQuarter = null;
  let chatPlatform = resolveChatPlatformId(null);
  if (orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        upcomingQuarterStartDate: true,
        upcomingQuarterEndDate: true,
        upcomingFiscalYearLabel: true,
        upcomingFiscalQuarter: true,
        primaryChatPlatform: true,
      },
    });
    if (org) {
      workspaceQuarter = quarterFromOrgRow(org);
      chatPlatform = resolveChatPlatformId(org.primaryChatPlatform);
    }
  }

  const chatThreadLinkLabel = `Chat thread (${getChatPlatformLabel(chatPlatform)})`;

  return (
    <OutcomesPageClient
      workspaceQuarter={workspaceQuarter}
      chatThreadLinkLabel={chatThreadLinkLabel}
    />
  );
}
