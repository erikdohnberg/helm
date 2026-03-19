import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { listOrgMembers } from "@/lib/actions/org-members";

import { TeamSettingsClient } from "./team-settings-client";

export default async function TeamSettingsPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? null;
  const userId = session?.user?.id;

  let viewerIsOwner = false;
  let initialMembers: Awaited<ReturnType<typeof listOrgMembers>> = [];

  if (orgId && userId) {
    const viewer = await prisma.orgMember.findFirst({
      where: { userId, orgId },
      select: { role: true },
    });
    viewerIsOwner = viewer?.role === "owner";

    try {
      initialMembers = await listOrgMembers(orgId);
    } catch {
      initialMembers = [];
    }
  }

  return (
    <TeamSettingsClient
      orgId={orgId}
      currentUserId={userId}
      viewerIsOwner={viewerIsOwner}
      initialMembers={initialMembers}
    />
  );
}
