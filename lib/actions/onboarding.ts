"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function updateOrgName(orgId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const member = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, orgId },
  });
  if (!member || member.role !== "owner") throw new Error("Forbidden");
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Organization name is required");
  await prisma.organization.update({
    where: { id: orgId },
    data: { name: trimmed },
  });
  revalidatePath("/onboarding/org-setup");
  revalidatePath("/quarter");
}

export async function addInvites(orgId: string, emails: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const member = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, orgId },
  });
  if (!member) throw new Error("Forbidden");
  const normalized = emails
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"));
  const seen = new Set<string>();
  for (const email of normalized) {
    if (seen.has(email)) continue;
    seen.add(email);
    await prisma.invite.upsert({
      where: { email_orgId: { email, orgId } },
      create: {
        email,
        orgId,
        invitedById: session.user.id,
        token: randomToken(),
      },
      update: {},
    });
  }
  revalidatePath("/onboarding/org-setup");
}
