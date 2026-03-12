"use client";

import { useToast } from "@/components/ui/toast";

const INTEGRATIONS = [
  { id: "slack", name: "Slack", status: "Connected" },
  { id: "google-drive", name: "Google Drive", status: "Connected" },
  { id: "llm", name: "LLM", status: "Connected" },
] as const;

export default function IntegrationsSettingsPage() {
  const toast = useToast();

  function handleTest(name: string) {
    toast(`${name} connection tested`);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-foreground">Integrations</h2>
      <p className="text-sm text-muted-foreground">
        Connect and configure external tools and services.
      </p>

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
  );
}
