"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  assertDriveScopes,
  createHelmCharterRootFolder,
  getGoogleAccountRecord,
  getValidGoogleAccessToken,
} from "@/lib/integrations/google-drive-api";

export type GoogleDriveIntegrationState = {
  driveConnected: boolean;
  rootFolderConfigured: boolean;
  rootFolderName: string | null;
  rootFolderId: string | null;
  rootFolderConfiguredAt: string | null;
  /** Only owners can connect Drive or change charter storage. */
  canManage: boolean;
};

function requireOrgOwnerSession() {
  return (async () => {
    const session = await auth();
    const userId = session?.user?.id;
    const orgId = session?.user?.orgId;
    if (!userId || !orgId) throw new Error("Unauthorized");
    const member = await prisma.orgMember.findFirst({
      where: { userId, orgId },
    });
    if (!member || member.role !== "owner") {
      throw new Error("Only organization owners can manage Google Drive for Helm.");
    }
    return { userId, orgId };
  })();
}

export async function getGoogleDriveIntegrationState(): Promise<GoogleDriveIntegrationState> {
  const session = await auth();
  const userId = session?.user?.id;
  const orgId = session?.user?.orgId;

  if (!userId || !orgId) {
    return {
      driveConnected: false,
      rootFolderConfigured: false,
      rootFolderName: null,
      rootFolderId: null,
      rootFolderConfiguredAt: null,
      canManage: false,
    };
  }

  const member = await prisma.orgMember.findFirst({
    where: { userId, orgId },
    select: { role: true },
  });
  const canManage = member?.role === "owner";

  const account = await getGoogleAccountRecord(userId);
  const viewerHasDriveScopes =
    !!account?.refresh_token && assertDriveScopesSafe(account.scope);

  let org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      googleDriveLinkedAt: true,
      charterRootFolderId: true,
      charterRootFolderName: true,
      charterRootConfiguredAt: true,
    },
  });

  if (canManage && viewerHasDriveScopes && !org?.googleDriveLinkedAt) {
    await prisma.organization.update({
      where: { id: orgId },
      data: { googleDriveLinkedAt: new Date() },
    });
    org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        googleDriveLinkedAt: true,
        charterRootFolderId: true,
        charterRootFolderName: true,
        charterRootConfiguredAt: true,
      },
    });
  }

  const rootFolderConfigured = !!org?.charterRootFolderId;
  const driveConnected =
    !!org?.googleDriveLinkedAt ||
    rootFolderConfigured ||
    (canManage && viewerHasDriveScopes);

  return {
    driveConnected,
    rootFolderConfigured,
    rootFolderName: org?.charterRootFolderName ?? null,
    rootFolderId: org?.charterRootFolderId ?? null,
    rootFolderConfiguredAt: org?.charterRootConfiguredAt?.toISOString() ?? null,
    canManage,
  };
}

function assertDriveScopesSafe(scope: string | null | undefined): boolean {
  try {
    assertDriveScopes(scope);
    return true;
  } catch {
    return false;
  }
}

export async function createOrgCharterRootFolderAction(): Promise<void> {
  const { userId, orgId } = await requireOrgOwnerSession();

  const existing = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { charterRootFolderId: true, googleDriveLinkedAt: true },
  });
  if (!existing) {
    throw new Error("Organization not found.");
  }
  if (existing.charterRootFolderId) {
    throw new Error("Charter storage is already configured.");
  }

  const account = await getGoogleAccountRecord(userId);
  if (!account?.refresh_token) {
    throw new Error("Connect Google Drive first.");
  }
  assertDriveScopes(account.scope);

  const accessToken = await getValidGoogleAccessToken(userId, {
    refreshToken: account.refresh_token,
    accessToken: account.access_token,
    expiresAt: account.expires_at,
  });

  const { id, name } = await createHelmCharterRootFolder(accessToken);

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      charterRootFolderId: id,
      charterRootFolderName: name,
      charterRootConfiguredAt: new Date(),
      ...(!existing.googleDriveLinkedAt
        ? { googleDriveLinkedAt: new Date() }
        : {}),
    },
  });

  revalidatePath("/settings/integrations");
}

export async function clearOrgCharterRootFolderAction(): Promise<void> {
  const { orgId } = await requireOrgOwnerSession();

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      charterRootFolderId: null,
      charterRootFolderName: null,
      charterRootConfiguredAt: null,
    },
  });

  revalidatePath("/settings/integrations");
}
