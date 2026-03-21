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
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.orgMember.findFirst({
      where: { userId, orgId },
      select: { role: true },
    }),
  ]);
  if (!org) redirect("/landing");
  const quarterConfigured = org.upcomingQuarterStartDate != null;
  const viewerIsOwner = member?.role === "owner";

  return (
    <OnboardingOrgSetupClient
      orgId={orgId}
      initialOrgName={org.name ?? ""}
      quarterConfigured={quarterConfigured}
      viewerIsOwner={viewerIsOwner}
    />
  );
}
