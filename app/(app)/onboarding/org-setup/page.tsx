import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

import OnboardingOrgSetupClient from "./onboarding-client";

export default async function OnboardingOrgSetupPage() {
  const session = await auth();
  if (!session?.user?.id || !(session.user as { orgId?: string }).orgId) {
    redirect("/landing");
  }
  const orgId = (session.user as { orgId: string }).orgId;
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });
  if (!org) redirect("/landing");
  return (
    <OnboardingOrgSetupClient
      orgId={orgId}
      initialOrgName={org.name ?? ""}
    />
  );
}
