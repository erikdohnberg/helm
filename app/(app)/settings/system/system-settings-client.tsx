"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { Observed } from "@/components/ui/chip";
import { Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useDemoData } from "@/lib/demo-data-context";
import { cn } from "@/lib/utils";

type Props = {
  /** Primary chat platform label (e.g. Slack, Microsoft Teams). */
  chatIntegrationLabel: string;
};

const MOCK_RECENT_EVENTS = [
  {
    id: "1",
    at: "2026-03-12T10:30:00Z",
    message: "Outcome out-1 anchored",
  },
  {
    id: "2",
    at: "2026-03-12T09:15:00Z",
    message: "Quarter narrative written to the record",
  },
  {
    id: "3",
    at: "2026-03-11T16:00:00Z",
    message: "Read 42 messages across 3 channels",
  },
];

const MOCK_RECENT_ERRORS: { id: string; at: string; message: string }[] = [];

function formatEventTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function SystemSettingsClient({ chatIntegrationLabel }: Props) {
  const toast = useToast();
  const { resetDemoData, demoModeEnabled, setDemoModeEnabled } = useDemoData();
  const { theme, setTheme } = useTheme();
  const [appearanceMounted, setAppearanceMounted] = useState(false);

  useEffect(() => {
    setAppearanceMounted(true);
  }, []);

  /**
   * Reachability is observed, not authored — Helm noticed it, nobody typed it
   * — so it takes verdigris and the ring. There is deliberately no green dot
   * and no "Healthy" label: a traffic-light tile converts a judgement into a
   * label nobody made, and it is banned by the system.
   */
  const sources = [
    { id: "db", label: "Database" },
    { id: "chat", label: chatIntegrationLabel },
    { id: "drive", label: "Google Drive" },
    { id: "llm", label: "Language model" },
  ];

  function handleResetDemoData() {
    resetDemoData();
    toast("Demo data reset. The sample quarter reads as it did on first open.");
  }

  return (
    <div className="flex flex-col gap-section-compact">
      <div className="flex flex-col gap-2.5">
        <Eyebrow>System</Eyebrow>
        <p className="max-w-prose text-muted-foreground">
          What Helm can reach, what it has read lately, and how this app looks
          while you read it.
        </p>
      </div>

      <section className="flex flex-col gap-4" aria-label="Appearance">
        <Eyebrow tone="muted">Appearance</Eyebrow>
        {!appearanceMounted ? (
          <p className="text-help text-muted-foreground">Reading the record…</p>
        ) : (
          <div className="max-w-[280px]">
            <Select
              id="appearance-theme"
              label="Theme"
              value={theme ?? "system"}
              onChange={(e) => setTheme(e.target.value)}
              options={[
                { value: "system", label: "Match the system" },
                { value: "light", label: "Chart paper" },
                { value: "dark", label: "Navy" },
              ]}
              help="Applies to the signed-in app. The marketing record is always set on chart paper."
            />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4" aria-label="Demo mode">
        <Eyebrow tone="muted">Demo mode</Eyebrow>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={demoModeEnabled}
              aria-label="Demo mode"
              onClick={() => setDemoModeEnabled(!demoModeEnabled)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full border border-border-strong transition-colors duration-quick ease-out",
                demoModeEnabled ? "bg-primary" : "bg-sunken"
              )}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-card shadow-e1 transition-transform duration-quick ease-out",
                  demoModeEnabled && "translate-x-5"
                )}
              />
            </button>
            <span className="text-control font-medium text-foreground">
              Read a sample quarter
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemoData}
            disabled={!demoModeEnabled}
            title={
              demoModeEnabled
                ? undefined
                : "Demo mode is off, so there is no sample record to reset."
            }
          >
            Reset the sample record
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Eyebrow tone="muted">What Helm can reach</Eyebrow>
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {sources.map(({ id, label }) => (
            <li
              key={id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <span className="text-control text-foreground">{label}</span>
              <Observed className="text-help">
                Last reached four minutes ago
              </Observed>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <Eyebrow tone="muted">What Helm noticed</Eyebrow>
        {!demoModeEnabled || MOCK_RECENT_EVENTS.length === 0 ? (
          <EmptyState title="Nothing observed yet">
            Helm writes here when it reads something that touches the record.
          </EmptyState>
        ) : (
          <ol className="flex flex-col divide-y divide-border border-y border-border">
            {MOCK_RECENT_EVENTS.map((e) => (
              <li key={e.id} className="flex gap-4 py-3">
                <span className="w-16 shrink-0 font-mono text-[12px] text-subtle-foreground">
                  {formatEventTime(e.at)}
                </span>
                <Observed className="text-control">{e.message}</Observed>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <Eyebrow tone="muted">What failed</Eyebrow>
        {!demoModeEnabled || MOCK_RECENT_ERRORS.length === 0 ? (
          <EmptyState title="Nothing has failed">
            Every read Helm attempted since this quarter opened returned.
          </EmptyState>
        ) : (
          <ol className="flex flex-col divide-y divide-border border-y border-border">
            {MOCK_RECENT_ERRORS.map((e) => (
              <li key={e.id} className="flex gap-4 py-3">
                <span className="w-16 shrink-0 font-mono text-[12px] text-subtle-foreground">
                  {formatEventTime(e.at)}
                </span>
                <span className="text-control text-destructive">
                  {e.message}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
