"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import { useToast } from "@/components/ui/toast";
import { useDemoData } from "@/lib/demo-data-context";
import { cn } from "@/lib/utils";

type Props = {
  /** Primary chat platform label for the health chip (e.g. Slack, Microsoft Teams). */
  chatIntegrationLabel: string;
};

const MOCK_RECENT_EVENTS = [
  {
    id: "1",
    at: "2026-03-12T10:30:00Z",
    message: "Outcome out-1 status updated to Anchored",
  },
  {
    id: "2",
    at: "2026-03-12T09:15:00Z",
    message: "Quarter narrative saved",
  },
  {
    id: "3",
    at: "2026-03-11T16:00:00Z",
    message: "Integration sync completed",
  },
];

const MOCK_RECENT_ERRORS: { id: string; at: string; message: string }[] = [];

function formatEventTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function SystemSettingsClient({ chatIntegrationLabel }: Props) {
  const toast = useToast();
  const { resetDemoData, demoModeEnabled, setDemoModeEnabled } = useDemoData();
  const { theme, setTheme } = useTheme();
  const [appearanceMounted, setAppearanceMounted] = useState(false);

  useEffect(() => {
    setAppearanceMounted(true);
  }, []);

  const healthItems = [
    { id: "db", label: "DB", status: "Healthy" as const },
    {
      id: "chat",
      label: chatIntegrationLabel,
      status: "Healthy" as const,
    },
    { id: "drive", label: "Drive", status: "Healthy" as const },
    { id: "llm", label: "LLM", status: "Healthy" as const },
  ];

  function handleResetDemoData() {
    resetDemoData();
    toast("Demo data reset");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">System</h2>
        <p className="text-sm text-muted-foreground">
          System configuration, API keys, and diagnostics.
        </p>
      </div>

      <section className="space-y-2" aria-label="Appearance">
        <h3 className="text-sm font-medium text-foreground">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Color theme for the signed-in app. Marketing pages always use light
          mode.
        </p>
        {!appearanceMounted ? (
          <p className="text-sm text-muted-foreground">Loading theme options…</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="appearance-theme"
              className="text-sm font-medium text-foreground"
            >
              Theme
            </label>
            <select
              id="appearance-theme"
              value={theme ?? "system"}
              onChange={(e) => setTheme(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={demoModeEnabled}
            aria-label="Demo mode"
            onClick={() => setDemoModeEnabled(!demoModeEnabled)}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              demoModeEnabled ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
                demoModeEnabled && "translate-x-5"
              )}
            />
          </button>
          <span className="text-sm font-medium text-foreground">Demo Mode</span>
        </div>
        <button
          type="button"
          onClick={handleResetDemoData}
          disabled={!demoModeEnabled}
          title={
            demoModeEnabled
              ? undefined
              : "Turn on Demo Mode to reset sample quarters, outcomes, and team data"
          }
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50"
        >
          Reset Demo Data
        </button>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">
          Environment health
        </h3>
        <div className="flex flex-wrap gap-3">
          {healthItems.map(({ id, label, status }) => (
            <div
              key={id}
              className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2"
            >
              <span
                className="h-2 w-2 rounded-full bg-green-600"
                aria-hidden
              />
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">{status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Recent events</h3>
        <div className="rounded-md border border-border">
          {!demoModeEnabled || MOCK_RECENT_EVENTS.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No recent events.</p>
          ) : (
            <ul className="divide-y divide-border">
              {MOCK_RECENT_EVENTS.map((e) => (
                <li key={e.id} className="flex gap-3 px-4 py-2 text-sm">
                  <span className="shrink-0 text-muted-foreground">
                    {formatEventTime(e.at)}
                  </span>
                  <span className="text-foreground">{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Recent errors</h3>
        <div className="rounded-md border border-border">
          {!demoModeEnabled || MOCK_RECENT_ERRORS.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No recent errors.</p>
          ) : (
            <ul className="divide-y divide-border">
              {MOCK_RECENT_ERRORS.map((e) => (
                <li key={e.id} className="flex gap-3 px-4 py-2 text-sm">
                  <span className="shrink-0 text-muted-foreground">
                    {formatEventTime(e.at)}
                  </span>
                  <span className="text-destructive">{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
