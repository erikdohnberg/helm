"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveChatPlatformId } from "@/lib/integrations/chat-platforms";
import { resolveChatUserProfile } from "@/lib/mock/slack-user-display-name";

export type OrgTeamListRow = {
  id: string;
  name: string;
  chatUserId: string;
  chatDisplayName: string | null;
  chatImageUrl: string | null;
};

async function requireOrgMembership(orgId: string, userId: string) {
  const m = await prisma.orgMember.findFirst({
    where: { userId, orgId },
  });
  if (!m) throw new Error("Forbidden");
  return m;
}

export async function listOrgTeams(orgId: string): Promise<OrgTeamListRow[]> {
  const session = await auth();
  if (!session?.user?.id || session.user.orgId !== orgId) {
    throw new Error("Unauthorized");
  }
  await requireOrgMembership(orgId, session.user.id);

  const rows = await prisma.orgTeam.findMany({
    where: { orgId },
    orderBy: { name: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    chatUserId: r.chatUserId,
    chatDisplayName: r.chatDisplayName,
    chatImageUrl: r.chatImageUrl,
  }));
}

export async function createOrgTeam(
  orgId: string,
  input: { name: string; chatUserId: string }
): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || session.user?.orgId !== orgId) {
    throw new Error("Unauthorized");
  }

  const actor = await requireOrgMembership(orgId, sessionUserId);
  if (actor.role !== "owner") {
    throw new Error("Only admins can add teams.");
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { primaryChatPlatform: true },
  });
  const platform = resolveChatPlatformId(org?.primaryChatPlatform);

  const nameTrim = input.name.trim();
  const idTrim = input.chatUserId.trim();
  if (!nameTrim) throw new Error("Team name is required.");
  if (!idTrim) throw new Error("Chat user ID is required.");

  const profile = resolveChatUserProfile(platform, idTrim);
  if (platform === "slack" && !profile) {
    throw new Error(
      "No user found for that ID. In demo for Slack, try U01ABC, U02DEF, or U03GHI."
    );
  }

  const chatDisplayName = profile?.displayName ?? null;
  const chatImageUrl = profile?.imageUrl ?? null;

  await prisma.orgTeam.create({
    data: {
      orgId,
      name: nameTrim,
      chatUserId: idTrim,
      chatDisplayName,
      chatImageUrl,
    },
  });
  revalidatePath("/settings/team");
}

export async function updateOrgTeam(
  orgId: string,
  teamId: string,
  input: { name: string; chatUserId: string }
): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || session.user?.orgId !== orgId) {
    throw new Error("Unauthorized");
  }

  const actor = await requireOrgMembership(orgId, sessionUserId);
  if (actor.role !== "owner") {
    throw new Error("Only admins can edit teams.");
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { primaryChatPlatform: true },
  });
  const platform = resolveChatPlatformId(org?.primaryChatPlatform);

  const nameTrim = input.name.trim();
  const idTrim = input.chatUserId.trim();
  if (!nameTrim) throw new Error("Team name is required.");
  if (!idTrim) throw new Error("Chat user ID is required.");

  const profile = resolveChatUserProfile(platform, idTrim);
  if (platform === "slack" && !profile) {
    throw new Error(
      "No user found for that ID. In demo for Slack, try U01ABC, U02DEF, or U03GHI."
    );
  }

  const existing = await prisma.orgTeam.findFirst({
    where: { id: teamId, orgId },
  });
  if (!existing) throw new Error("Team not found.");

  await prisma.orgTeam.update({
    where: { id: teamId },
    data: {
      name: nameTrim,
      chatUserId: idTrim,
      chatDisplayName: profile?.displayName ?? null,
      chatImageUrl: profile?.imageUrl ?? null,
    },
  });
  revalidatePath("/settings/team");
}

export async function deleteOrgTeams(
  orgId: string,
  teamIds: string[]
): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || session.user?.orgId !== orgId) {
    throw new Error("Unauthorized");
  }

  const actor = await requireOrgMembership(orgId, sessionUserId);
  if (actor.role !== "owner") {
    throw new Error("Only admins can remove teams.");
  }

  const unique = [...new Set(teamIds)].filter(Boolean);
  if (unique.length === 0) return;

  await prisma.orgTeam.deleteMany({
    where: { orgId, id: { in: unique } },
  });
  revalidatePath("/settings/team");
}
