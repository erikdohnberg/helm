import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

import OnboardingOrgSetupClient from "./onboarding-client";

export default async function OnboardingOrgSetupPage() {
  const session = await auth();
  if (!session?.user?.id || !(session.user as { orgId?: string }).orgId) {
    redirect("/landing");
  }
  const userId = session.user.id;
  const orgId = (session.user as { orgId: string }).orgId;
  const [org, member] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        name: true,
        upcomingQuarterStartDate: true,
        primaryChatPlatform: true,
      },
    }),
    prisma.orgMember.findFirst({
      where: { userId, orgId },
      select: { role: true, leadTeamName: true },
    }),
  ]);
  if (!org) redirect("/landing");
  const quarterConfigured = org.upcomingQuarterStartDate != null;
  const viewerIsOwner = member?.role === "owner";
  const initialLeadTeamName = member?.leadTeamName?.trim() ?? "";
  const platformSet =
    org.primaryChatPlatform != null &&
    org.primaryChatPlatform.trim() !== "";
  const needsName = !(org.name ?? "").trim();
  const needsPlatform = viewerIsOwner && !platformSet;
  const needsLead = !initialLeadTeamName.trim();
  const needsQuarter = !quarterConfigured;

  if (!needsName && !needsPlatform && !needsLead && !needsQuarter) {
    redirect("/quarter");
  }

  return (
    <OnboardingOrgSetupClient
      orgId={orgId}
      initialOrgName={org.name ?? ""}
      initialLeadTeamName={initialLeadTeamName}
      initialPrimaryChatPlatform={org.primaryChatPlatform}
      quarterConfigured={quarterConfigured}
      viewerIsOwner={viewerIsOwner}
    />
  );
}
