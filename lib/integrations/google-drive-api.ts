import "server-only";

import { prisma } from "@/lib/db";
import { accountHasGoogleDriveScopes } from "@/lib/integrations/google-drive-scopes";

/** Node/undici uses this when TLS/DNS/firewall blocks the request before any HTTP status. */
function isLikelyNetworkFetchFailure(e: unknown): boolean {
  if (!(e instanceof TypeError)) return false;
  const msg = String(e.message).toLowerCase();
  if (msg.includes("fetch")) return true;
  const c = e.cause;
  if (c instanceof Error) {
    const cm = String(c.message).toLowerCase();
    if (cm.includes("connect") || cm.includes("network") || cm.includes("econnrefused"))
      return true;
  }
  return false;
}

function rethrowGoogleNetworkError(e: unknown, context: string): never {
  if (isLikelyNetworkFetchFailure(e)) {
    throw new Error(
      `${context}: Node could not reach Google (oauth2.googleapis.com). Try \`npm run dev:ipv4\`, turn off VPN, or check firewall — see README.`
    );
  }
  throw e;
}

type GoogleAccountTokens = {
  refreshToken: string;
  accessToken: string | null;
  expiresAt: number | null;
};

export async function getGoogleAccountRecord(userId: string) {
  return prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: {
      refresh_token: true,
      access_token: true,
      expires_at: true,
      scope: true,
    },
  });
}

export function assertDriveScopes(scope: string | null | undefined): void {
  if (!accountHasGoogleDriveScopes(scope)) {
    throw new Error("Google Drive not connected for this account");
  }
}

async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAtMs: number;
}> {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET not configured");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  let res: Response;
  try {
    res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch (e) {
    rethrowGoogleNetworkError(e, "Google token refresh");
  }

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error || `Token refresh failed (${res.status})`
    );
  }

  const expiresIn = data.expires_in ?? 3600;
  return {
    accessToken: data.access_token,
    expiresAtMs: Date.now() + expiresIn * 1000,
  };
}

async function persistAccessToken(
  userId: string,
  accessToken: string,
  expiresAtSec: number
): Promise<void> {
  await prisma.account.updateMany({
    where: { userId, provider: "google" },
    data: {
      access_token: accessToken,
      expires_at: expiresAtSec,
    },
  });
}

/** Returns a valid access token, refreshing and persisting when needed. */
export async function getValidGoogleAccessToken(
  userId: string,
  tokens: GoogleAccountTokens
): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  if (
    tokens.accessToken &&
    tokens.expiresAt &&
    tokens.expiresAt > nowSec + 60
  ) {
    return tokens.accessToken;
  }

  const { accessToken, expiresAtMs } = await refreshAccessToken(
    tokens.refreshToken
  );
  const expiresAtSec = Math.floor(expiresAtMs / 1000);
  await persistAccessToken(userId, accessToken, expiresAtSec);
  return accessToken;
}

const CHARTER_ROOT_FOLDER_NAME = "Helm Outcome Charters";

/** Confirms the ID is a folder the token can access (used before creating a child folder). */
export async function fetchDriveFolderMetadata(
  accessToken: string,
  folderId: string
): Promise<{ id: string; name: string }> {
  const params = new URLSearchParams({
    fields: "id,name,mimeType",
    supportsAllDrives: "true",
  });
  let res: Response;
  try {
    res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (e) {
    rethrowGoogleNetworkError(e, "Google Drive");
  }
  const data = (await res.json()) as {
    id?: string;
    name?: string;
    mimeType?: string;
    error?: { message?: string };
  };
  if (!res.ok || !data.id) {
    throw new Error(
      data.error?.message || `Could not read folder (${res.status})`
    );
  }
  if (data.mimeType !== "application/vnd.google-apps.folder") {
    throw new Error("Selection must be a folder.");
  }
  return { id: data.id, name: data.name ?? "" };
}

/** Creates the Helm charter folder inside the user-selected parent folder. */
export async function createHelmCharterRootFolder(
  accessToken: string,
  options: { parentFolderId: string }
): Promise<{ id: string; name: string }> {
  const params = new URLSearchParams({ supportsAllDrives: "true" });
  let res: Response;
  try {
    res = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: CHARTER_ROOT_FOLDER_NAME,
          mimeType: "application/vnd.google-apps.folder",
          parents: [options.parentFolderId],
        }),
      }
    );
  } catch (e) {
    rethrowGoogleNetworkError(e, "Google Drive");
  }

  const data = (await res.json()) as {
    id?: string;
    name?: string;
    error?: { message?: string };
  };

  if (!res.ok || !data.id) {
    const msg =
      data.error?.message || `Drive folder create failed (${res.status})`;
    throw new Error(msg);
  }

  return { id: data.id, name: data.name ?? CHARTER_ROOT_FOLDER_NAME };
}
