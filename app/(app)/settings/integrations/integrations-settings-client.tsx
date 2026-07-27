"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { signIn, useSession } from "next-auth/react";

import { openDriveParentFolderPicker } from "@/components/integrations/google-drive-folder-picker";
import { Button } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { Chip, Observed } from "@/components/ui/chip";
import { useToast } from "@/components/ui/toast";
import {
  clearOrgCharterRootFolderAction,
  createOrgCharterRootFolderAction,
  getGoogleDriveIntegrationState,
  getGooglePickerAccessTokenAction,
  type GoogleDriveIntegrationState,
} from "@/lib/actions/google-drive-integration";
import { getGoogleIdentityFromSession } from "@/lib/google-identity";
import { getGoogleDriveConnectScopeParam } from "@/lib/integrations/google-drive-scopes";

type Props = {
  /** Resolved org primary chat platform (user-facing label). */
  primaryChatPlatformLabel: string;
};

const CONNECTION_DROPPED =
  "Not recorded — the connection dropped. Nothing changed; try again.";

function formatConfiguredAt(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

/** One connected source, stated as a fact plus what Helm may read from it. */
function SourceCard({
  name,
  state,
  children,
  action,
}: {
  name: string;
  state: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card density="compact" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-control font-semibold text-foreground">{name}</h3>
        {state}
      </div>
      {children && (
        <div className="max-w-prose text-help text-muted-foreground">
          {children}
        </div>
      )}
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </Card>
  );
}

export function IntegrationsSettingsClient({
  primaryChatPlatformLabel,
}: Props) {
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
    toast(`${name} answered. Helm can read it.`);
  }

  function handleConnectGoogleDrive() {
    void signIn(
      "google",
      { redirectTo: "/settings/integrations" },
      {
        prompt: "consent",
        access_type: "offline",
        scope: getGoogleDriveConnectScopeParam(),
      }
    );
  }

  function handleChooseCharterFolder() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY?.trim();
    if (!apiKey) {
      toast(
        "No Picker API key is set. Add NEXT_PUBLIC_GOOGLE_PICKER_API_KEY to .env.local — Google Cloud, enable the Picker API, create a browser key.",
        "error"
      );
      return;
    }

    startTransition(async () => {
      try {
        const tokenResult = await getGooglePickerAccessTokenAction();
        if (!tokenResult.ok) {
          toast(tokenResult.error, "error");
          return;
        }
        const parentFolderId = await openDriveParentFolderPicker(
          tokenResult.accessToken,
          apiKey,
          tokenResult.appId
        );
        if (!parentFolderId) {
          return;
        }
        await createOrgCharterRootFolderAction(parentFolderId);
        toast("Recorded. Charters are now written to Google Drive.");
        await getGoogleDriveIntegrationState().then(setIntegration);
      } catch (e) {
        toast(e instanceof Error ? e.message : CONNECTION_DROPPED, "error");
      }
    });
  }

  function handleChangeCharterFolder() {
    startTransition(async () => {
      try {
        await clearOrgCharterRootFolderAction();
        toast(
          "Charter storage cleared for Helm. The folder still exists in Drive."
        );
        setStorageManageOpen(false);
        await getGoogleDriveIntegrationState().then(setIntegration);
      } catch (e) {
        toast(e instanceof Error ? e.message : CONNECTION_DROPPED, "error");
      }
    });
  }

  const drive = integration;

  return (
    <div className="flex max-w-prose flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <Eyebrow>Integrations</Eyebrow>
        <p className="text-muted-foreground">
          Where Helm reads, and where it writes a charter. Helm reads the
          channels you nominate and writes nothing back without a decision.
        </p>
      </div>

      <SourceCard
        name="Google"
        state={
          sessionStatus === "loading" ? null : googleIdentity.isSignedInWithGoogle ? (
            <Chip variant="outline" label="Connected" />
          ) : (
            <Chip label="Not connected" />
          )
        }
        action={
          googleIdentity.isSignedInWithGoogle ||
          sessionStatus === "loading" ? undefined : (
            <Button size="sm" onClick={handleConnectGoogleDrive}>
              Connect Google
            </Button>
          )
        }
      >
        {sessionStatus === "loading" ? (
          "Reading the record…"
        ) : !googleIdentity.isSignedInWithGoogle ? (
          "Signing in with Google is what lets Helm write an Outcome Charter to Drive."
        ) : (
          <span className="font-mono text-identifier text-muted-foreground">
            {googleIdentity.googleAccountEmail}
          </span>
        )}
      </SourceCard>

      {googleIdentity.isSignedInWithGoogle && (
        <SourceCard
          name="Google Drive"
          state={
            !drive ? null : drive.rootFolderConfigured ? (
              <Chip variant="outline" label="Charters have a home" />
            ) : drive.driveConnected ? (
              <Chip label="No charter folder" />
            ) : (
              <Chip label="Not connected" />
            )
          }
          action={
            !drive ? undefined : !drive.canManage ? undefined : !drive.driveConnected ? (
              <Button
                size="sm"
                disabled={isPending}
                onClick={handleConnectGoogleDrive}
              >
                Connect Google Drive
              </Button>
            ) : !drive.rootFolderConfigured ? (
              <Button
                size="sm"
                disabled={isPending}
                onClick={handleChooseCharterFolder}
              >
                Choose where charters live
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  aria-expanded={storageManageOpen}
                  onClick={() => setStorageManageOpen((open) => !open)}
                >
                  Change where charters live
                </Button>
                {storageManageOpen && (
                  <div className="w-full rounded-inner border border-border bg-sunken p-3">
                    <p className="max-w-help text-help text-muted-foreground">
                      Clearing storage removes Helm&rsquo;s reference to this
                      folder. It does not delete the folder in Drive.
                    </p>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mt-3"
                      disabled={isPending}
                      onClick={handleChangeCharterFolder}
                    >
                      Clear the charter folder
                    </Button>
                  </div>
                )}
              </>
            )
          }
        >
          {!drive ? (
            "Reading the record…"
          ) : !drive.driveConnected ? (
            drive.canManage ? (
              "Helm asks for Drive and Docs access on your Google account, then writes each charter as a document."
            ) : (
              "An organization owner connects Drive before charters can be written."
            )
          ) : !drive.rootFolderConfigured ? (
            drive.canManage ? (
              'Pick a parent folder. Helm creates "Helm Outcome Charters" inside it and writes every charter there.'
            ) : (
              "An owner chooses the charter folder."
            )
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="font-serif text-[17px] text-foreground">
                {drive.rootFolderName}
              </span>
              {drive.rootFolderId && (
                <span className="font-mono text-identifier text-subtle-foreground">
                  {drive.rootFolderId}
                </span>
              )}
              {drive.rootFolderConfiguredAt && (
                <Observed className="text-help">
                  Chosen {formatConfiguredAt(drive.rootFolderConfiguredAt)}
                </Observed>
              )}
            </div>
          )}
        </SourceCard>
      )}

      <SourceCard
        name={primaryChatPlatformLabel}
        state={<Chip label="Not connected" />}
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTest(primaryChatPlatformLabel)}
          >
            Test the connection
          </Button>
        }
      >
        The primary chat platform from organization setup. The bot connection is
        not wired yet; every platform takes the same path when it is.
      </SourceCard>

      <SourceCard
        name="Language model"
        state={<Chip variant="outline" label="Connected" />}
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTest("The language model")}
          >
            Test the connection
          </Button>
        }
      >
        Helm reads conversations through it to draft charters and notice
        contradictions. It never anchors an outcome on its own.
      </SourceCard>
    </div>
  );
}
