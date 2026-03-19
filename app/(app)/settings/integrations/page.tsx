"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { signIn, useSession } from "next-auth/react";

import { useToast } from "@/components/ui/toast";
import {
  clearOrgCharterRootFolderAction,
  createOrgCharterRootFolderAction,
  getGoogleDriveIntegrationState,
  type GoogleDriveIntegrationState,
} from "@/lib/actions/google-drive-integration";
import { getGoogleIdentityFromSession } from "@/lib/google-identity";
import { getGoogleDriveConnectScopeParam } from "@/lib/integrations/google-drive-scopes";

const INTEGRATIONS = [
  { id: "slack", name: "Slack", status: "Connected" },
  { id: "llm", name: "LLM", status: "Connected" },
] as const;

function formatConfiguredAt(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function IntegrationsSettingsPage() {
  const toast = useToast();
  const { data: session, status: sessionStatus } = useSession();
  const googleIdentity = getGoogleIdentityFromSession(session, sessionStatus);

  const [integration, setIntegration] =
    useState<GoogleDriveIntegrationState | null>(null);
  const [storageManageOpen, setStorageManageOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refreshIntegration = useCallback(() => {
    startTransition(async () => {
      try {
        const next = await getGoogleDriveIntegrationState();
        setIntegration(next);
      } catch {
        setIntegration(null);
      }
    });
  }, []);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setIntegration(null);
      return;
    }
    refreshIntegration();
  }, [sessionStatus, session?.user?.id, refreshIntegration]);

  function handleTest(name: string) {
    toast(`${name} connection tested`);
  }

  function handleConnectGoogleDrive() {
    void signIn("google", { redirectTo: "/settings/integrations" }, {
      prompt: "consent",
      access_type: "offline",
      scope: getGoogleDriveConnectScopeParam(),
    });
  }

  function handleChooseCharterFolder() {
    startTransition(async () => {
      try {
        await createOrgCharterRootFolderAction();
        toast("Charter folder created in Google Drive");
        await getGoogleDriveIntegrationState().then(setIntegration);
      } catch (e) {
        toast(
          e instanceof Error ? e.message : "Could not create charter folder"
        );
      }
    });
  }

  function handleChangeCharterFolder() {
    startTransition(async () => {
      try {
        await clearOrgCharterRootFolderAction();
        toast("Charter storage location cleared for Helm (folder may still exist in Drive)");
        setStorageManageOpen(false);
        await getGoogleDriveIntegrationState().then(setIntegration);
      } catch (e) {
        toast(
          e instanceof Error ? e.message : "Could not update charter storage"
        );
      }
    });
  }

  const primaryBtnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const drive = integration;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-foreground">Integrations</h2>
      <p className="text-sm text-muted-foreground">
        Connect and configure external tools and services.
      </p>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h3 className="font-medium text-card-foreground">Google</h3>
          {sessionStatus === "loading" ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Checking Google account…
            </p>
          ) : !googleIdentity.isSignedInWithGoogle ? (
            <>
              <p className="mt-1 text-sm text-foreground">
                Google account not connected
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in with Google to enable Drive setup for Outcome Charters.
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-foreground">
                Google account connected
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {googleIdentity.googleAccountEmail}
              </p>

              {!drive ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Loading integration status…
                </p>
              ) : !drive.canManage ? (
                <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                  {!drive.driveConnected ? (
                    <>
                      <p className="text-foreground">
                        Google Drive not connected for Helm
                      </p>
                      <p className="text-muted-foreground">
                        An organization owner must connect Google Drive to
                        enable charter storage.
                      </p>
                    </>
                  ) : !drive.rootFolderConfigured ? (
                    <>
                      <p className="text-foreground">
                        Google Drive connected
                      </p>
                      <p className="text-muted-foreground">
                        Charter storage is not configured yet. An owner can
                        choose the charter folder in Settings.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-foreground">
                        Drive ready for charter generation
                      </p>
                      <p className="font-medium text-card-foreground">
                        {drive.rootFolderName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {drive.rootFolderId && (
                          <span>Folder ID: {drive.rootFolderId}</span>
                        )}
                        {drive.rootFolderId && drive.rootFolderConfiguredAt && (
                          <span className="mx-1.5 text-border">·</span>
                        )}
                        {drive.rootFolderConfiguredAt && (
                          <span>
                            Configured{" "}
                            {formatConfiguredAt(drive.rootFolderConfiguredAt)}
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </div>
              ) : !drive.driveConnected ? (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <p className="text-sm text-foreground">
                    Google Drive not connected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Connect Google Drive for your organization so Helm can store
                    Outcome Charters. You will be asked to approve Drive and Docs
                    access for your Google account.
                  </p>
                  <button
                    type="button"
                    className={primaryBtnClass}
                    disabled={isPending}
                    onClick={handleConnectGoogleDrive}
                  >
                    Connect Google Drive
                  </button>
                </div>
              ) : !drive.rootFolderConfigured ? (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <p className="text-sm text-foreground">
                    Google Drive connected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Charter storage not configured
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Choose where Helm stores Outcome Charters for your
                    organization.
                  </p>
                  <button
                    type="button"
                    className={primaryBtnClass}
                    disabled={isPending}
                    onClick={handleChooseCharterFolder}
                  >
                    Choose charter folder
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Creates a folder named &quot;Helm Outcome Charters&quot; in
                    your Google Drive.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <p className="text-sm text-foreground">
                    Drive ready for charter generation
                  </p>
                  <p className="text-sm font-medium text-card-foreground">
                    {drive.rootFolderName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {drive.rootFolderId && (
                      <span>Folder ID: {drive.rootFolderId}</span>
                    )}
                    {drive.rootFolderId && drive.rootFolderConfiguredAt && (
                      <span className="mx-1.5 text-border">·</span>
                    )}
                    {drive.rootFolderConfiguredAt && (
                      <span>
                        Configured{" "}
                        {formatConfiguredAt(drive.rootFolderConfiguredAt)}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-col items-start gap-2">
                    <button
                      type="button"
                      className={primaryBtnClass}
                      disabled={isPending}
                      onClick={() => setStorageManageOpen((open) => !open)}
                      aria-expanded={storageManageOpen}
                    >
                      Manage charter storage
                    </button>
                    {storageManageOpen ? (
                      <div className="w-full space-y-2 rounded-md border border-border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">
                          Clearing storage removes Helm&apos;s reference to this
                          folder. It does not delete the folder in Google Drive.
                        </p>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={handleChangeCharterFolder}
                          className="text-sm font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50"
                        >
                          Change charter folder
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map(({ id, name, status }) => (
            <div
              key={id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <h3 className="font-medium text-card-foreground">{name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{status}</p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => handleTest(name)}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50"
                >
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
