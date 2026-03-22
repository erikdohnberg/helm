import { auth } from "@/auth";
import { listOrgMembers } from "@/lib/actions/org-members";
import { listOrgTeams } from "@/lib/actions/org-teams";
import { prisma } from "@/lib/db";
import { resolveChatPlatformId } from "@/lib/integrations/chat-platforms";

import { TeamSettingsClient } from "./team-settings-client";

export default async function TeamSettingsPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? null;
  const userId = session?.user?.id;

  let viewerIsOwner = false;
  let initialMembers: Awaited<ReturnType<typeof listOrgMembers>> = [];
  let initialStandaloneTeams: Awaited<ReturnType<typeof listOrgTeams>> = [];
  let primaryChatPlatform = resolveChatPlatformId(null);

  if (orgId && userId) {
    const [viewer, org] = await Promise.all([
      prisma.orgMember.findFirst({
        where: { userId, orgId },
        select: { role: true },
      }),
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { primaryChatPlatform: true },
      }),
    ]);
    viewerIsOwner = viewer?.role === "owner";
    primaryChatPlatform = resolveChatPlatformId(org?.primaryChatPlatform);

    try {
      initialMembers = await listOrgMembers(orgId);
    } catch {
      initialMembers = [];
    }
    try {
      initialStandaloneTeams = await listOrgTeams(orgId);
    } catch {
      initialStandaloneTeams = [];
    }
  }

  return (
    <TeamSettingsClient
      orgId={orgId}
      currentUserId={userId}
      viewerIsOwner={viewerIsOwner}
      initialMembers={initialMembers}
      initialStandaloneTeams={initialStandaloneTeams}
      primaryChatPlatform={primaryChatPlatform}
    />
  );
}
