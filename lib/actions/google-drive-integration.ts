"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  assertDriveScopes,
  createHelmCharterRootFolder,
  fetchDriveFolderMetadata,
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

/** `{projectNumber}-….apps.googleusercontent.com` → project number for Picker `setAppId`. */
function googlePickerAppIdFromClientId(clientId: string | undefined): string | null {
  if (!clientId) return null;
  const prefix = clientId.split("-")[0]?.trim();
  if (!prefix || !/^\d+$/.test(prefix)) return null;
  return prefix;
}

export type GooglePickerTokenResult =
  | { ok: true; accessToken: string; appId: string }
  | { ok: false; error: string };

/** Short-lived access token + Picker app id for client-side folder selection. */
export async function getGooglePickerAccessTokenAction(): Promise<GooglePickerTokenResult> {
  try {
    const appId = googlePickerAppIdFromClientId(process.env.AUTH_GOOGLE_ID);
    if (!appId) {
      return {
        ok: false,
        error:
          "AUTH_GOOGLE_ID must be set to a Web client id (format: digits-suffix.apps.googleusercontent.com).",
      };
    }

    const { userId } = await requireOrgOwnerSession();
    const account = await getGoogleAccountRecord(userId);
    if (!account?.refresh_token) {
      return { ok: false, error: "Connect Google Drive first." };
    }
    assertDriveScopes(account.scope);
    const accessToken = await getValidGoogleAccessToken(userId, {
      refreshToken: account.refresh_token,
      accessToken: account.access_token,
      expiresAt: account.expires_at,
    });
    return { ok: true, accessToken, appId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not authorize Drive";
    return { ok: false, error: msg };
  }
}

/**
 * @param parentFolderId Folder chosen in Google Picker; Helm creates "Helm Outcome Charters" inside it.
 */
export async function createOrgCharterRootFolderAction(
  parentFolderId: string
): Promise<void> {
  const { userId, orgId } = await requireOrgOwnerSession();

  const trimmed = parentFolderId?.trim();
  if (!trimmed) {
    throw new Error("Choose a folder in Google Drive.");
  }

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

  await fetchDriveFolderMetadata(accessToken, trimmed);
  const { id, name } = await createHelmCharterRootFolder(accessToken, {
    parentFolderId: trimmed,
  });

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
