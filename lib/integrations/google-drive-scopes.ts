/** OAuth scopes required for Drive + Docs (charters). Incremental consent from Settings. */

export const GOOGLE_DRIVE_FILE_SCOPE =
  "https://www.googleapis.com/auth/drive.file";
export const GOOGLE_DOCUMENTS_SCOPE =
  "https://www.googleapis.com/auth/documents";

const BASE_SCOPES = "openid email profile";

/** Full scope string for “Connect Google Drive” re-auth. */
export function getGoogleDriveConnectScopeParam(): string {
  return `${BASE_SCOPES} ${GOOGLE_DRIVE_FILE_SCOPE} ${GOOGLE_DOCUMENTS_SCOPE}`;
}

export function accountHasGoogleDriveScopes(
  scopeField: string | null | undefined
): boolean {
  if (!scopeField) return false;
  return (
    scopeField.includes("drive.file") && scopeField.includes("documents")
  );
}
