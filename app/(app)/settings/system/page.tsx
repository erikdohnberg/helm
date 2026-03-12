"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const HEALTH_ITEMS = [
  { id: "db", label: "DB", status: "Healthy" as const },
  { id: "slack", label: "Slack", status: "Healthy" as const },
  { id: "drive", label: "Drive", status: "Healthy" as const },
  { id: "llm", label: "LLM", status: "Healthy" as const },
];

const MOCK_RECENT_EVENTS = [
  { id: "1", at: "2026-03-12T10:30:00Z", message: "Outcome out-1 status updated to Anchored" },
  { id: "2", at: "2026-03-12T09:15:00Z", message: "Quarter narrative saved" },
  { id: "3", at: "2026-03-11T16:00:00Z", message: "Integration sync completed" },
];

const MOCK_RECENT_ERRORS: { id: string; at: string; message: string }[] = [];

function formatEventTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SystemSettingsPage() {
  const toast = useToast();
  const [demoMode, setDemoMode] = useState(false);

  function handleResetDemoData() {
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

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={demoMode}
            aria-label="Demo mode"
            onClick={() => setDemoMode((prev) => !prev)}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              demoMode ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
                demoMode && "translate-x-5"
              )}
            />
          </button>
          <span className="text-sm font-medium text-foreground">
            Demo Mode
          </span>
        </div>
        <button
          type="button"
          onClick={handleResetDemoData}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50"
        >
          Reset Demo Data
        </button>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">
          Environment health
        </h3>
        <div className="flex flex-wrap gap-3">
          {HEALTH_ITEMS.map(({ id, label, status }) => (
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
          {MOCK_RECENT_EVENTS.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No recent events.
            </p>
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
          {MOCK_RECENT_ERRORS.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No recent errors.
            </p>
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
