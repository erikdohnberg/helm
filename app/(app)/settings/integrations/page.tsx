"use client";

import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast";
import { getGoogleIdentityFromSession } from "@/lib/google-identity";

const INTEGRATIONS = [
  { id: "slack", name: "Slack", status: "Connected" },
  { id: "llm", name: "LLM", status: "Connected" },
] as const;

export default function IntegrationsSettingsPage() {
  const toast = useToast();
  const { data: session, status: sessionStatus } = useSession();
  const googleIdentity = getGoogleIdentityFromSession(session, sessionStatus);

  function handleTest(name: string) {
    toast(`${name} connection tested`);
  }

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
          ) : googleIdentity.isSignedInWithGoogle ? (
            <>
              <p className="mt-1 text-sm text-foreground">
                Google account connected
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {googleIdentity.googleAccountEmail}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Drive access not configured
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-foreground">
                Google account not connected
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in with Google to enable Drive setup for Outcome Charters.
              </p>
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
