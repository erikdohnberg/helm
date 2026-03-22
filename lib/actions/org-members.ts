"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type OrgMemberListRow = {
  id: string;
  userId: string;
  email: string | null;
  name: string | null;
  role: string;
  leadTeamName: string | null;
  slackUserId: string | null;
};

/** Any org member may list people in their org (for Settings → Team). */
export async function listOrgMembers(orgId: string): Promise<OrgMemberListRow[]> {
  const session = await auth();
  if (!session?.user?.id || session.user.orgId !== orgId) {
    throw new Error("Unauthorized");
  }
  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, orgId },
  });
  if (!membership) {
    throw new Error("Forbidden");
  }

  const rows = await prisma.orgMember.findMany({
    where: { orgId },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { user: { email: "asc" } },
  });

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    email: r.user.email,
    name: r.user.name,
    role: r.role,
    leadTeamName: r.leadTeamName,
    slackUserId: r.slackUserId,
  }));
}

export async function updateOrgMemberTeamLead(
  orgId: string,
  targetUserId: string,
  input: { leadTeamName: string; slackUserId: string }
): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || session.user?.orgId !== orgId) {
    throw new Error("Unauthorized");
  }

  const actor = await prisma.orgMember.findFirst({
    where: { userId: sessionUserId, orgId },
  });
  if (!actor) throw new Error("Forbidden");

  const isAdmin = actor.role === "owner";
  const isSelf = sessionUserId === targetUserId;
  if (!isAdmin && !isSelf) {
    throw new Error("You can only update your own team details.");
  }

  const teamTrim = input.leadTeamName.trim();
  const slackTrim = input.slackUserId.trim();
  if (!teamTrim) throw new Error("Team name is required.");
  if (!slackTrim) throw new Error("Chat user ID is required.");

  const target = await prisma.orgMember.findFirst({
    where: { orgId, userId: targetUserId },
  });
  if (!target) throw new Error("User is not in this organization.");

  await prisma.orgMember.update({
    where: { id: target.id },
    data: { leadTeamName: teamTrim, slackUserId: slackTrim },
  });
  revalidatePath("/settings/team");
}

export async function clearOrgMemberTeamLead(
  orgId: string,
  targetUserId: string
): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || session.user?.orgId !== orgId) {
    throw new Error("Unauthorized");
  }

  const actor = await prisma.orgMember.findFirst({
    where: { userId: sessionUserId, orgId },
  });
  if (!actor || actor.role !== "owner") {
    throw new Error("Only admins can remove team assignments.");
  }

  const target = await prisma.orgMember.findFirst({
    where: { orgId, userId: targetUserId },
  });
  if (!target) throw new Error("User is not in this organization.");

  await prisma.orgMember.update({
    where: { id: target.id },
    data: { leadTeamName: null, slackUserId: null },
  });
  revalidatePath("/settings/team");
}

async function requireOwner(orgId: string, sessionUserId: string) {
  const member = await prisma.orgMember.findFirst({
    where: { userId: sessionUserId, orgId },
  });
  if (!member || member.role !== "owner") {
    throw new Error("Only admins can change member roles.");
  }
}

export async function promoteToAdmin(
  orgId: string,
  targetUserId: string
): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || session.user?.orgId !== orgId) {
    throw new Error("Unauthorized");
  }
  await requireOwner(orgId, sessionUserId);

  const target = await prisma.orgMember.findFirst({
    where: { orgId, userId: targetUserId },
  });
  if (!target) {
    throw new Error("User is not in this organization.");
  }
  if (target.role !== "member") {
    throw new Error("User is already an admin.");
  }

  await prisma.orgMember.update({
    where: { id: target.id },
    data: { role: "owner" },
  });
  revalidatePath("/settings/team");
}

export async function demoteFromAdmin(
  orgId: string,
  targetUserId: string
): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || session.user?.orgId !== orgId) {
    throw new Error("Unauthorized");
  }
  await requireOwner(orgId, sessionUserId);

  const ownerCount = await prisma.orgMember.count({
    where: { orgId, role: "owner" },
  });

  const target = await prisma.orgMember.findFirst({
    where: { orgId, userId: targetUserId },
  });
  if (!target || target.role !== "owner") {
    throw new Error("User is not an admin.");
  }
  if (ownerCount <= 1) {
    throw new Error("Keep at least one admin.");
  }

  await prisma.orgMember.update({
    where: { id: target.id },
    data: { role: "member" },
  });
  revalidatePath("/settings/team");
}
