"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  saveMyLeadTeam,
  saveOrgPrimaryChatPlatform,
  saveOrgQuarterCalendar,
  updateOrgName,
} from "@/lib/actions/onboarding";
import {
  CHAT_PLATFORMS,
  DEFAULT_CHAT_PLATFORM,
  isChatPlatformId,
  type ChatPlatformId,
} from "@/lib/integrations/chat-platforms";
import { inferFiscalYearStartMonthFromQuarterAndMonth } from "@/lib/org/fiscal-quarter";
import type { FiscalQuarter1to4, Month1to12 } from "@/lib/org/fiscal-quarter";

const MONTHS: { value: number; label: string }[] = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

type Step = 1 | 2 | 3 | 4;

function computeInitialStep(
  initialOrgName: string,
  initialLeadTeamName: string,
  quarterConfigured: boolean,
  viewerIsOwner: boolean,
  primaryChatPlatform: string | null | undefined
): Step {
  if (!initialOrgName.trim()) return 1;
  const platformSet =
    primaryChatPlatform != null && primaryChatPlatform.trim() !== "";
  if (viewerIsOwner && !platformSet) return 2;
  if (!initialLeadTeamName.trim()) return 3;
  if (!quarterConfigured) return 4;
  // Server redirects when setup is complete; fallback avoids re-showing the quarter form.
  return 1;
}

type Props = {
  orgId: string;
  initialOrgName: string;
  initialLeadTeamName: string;
  initialPrimaryChatPlatform: string | null;
  quarterConfigured: boolean;
  viewerIsOwner: boolean;
};

export default function OnboardingOrgSetupClient({
  orgId,
  initialOrgName,
  initialLeadTeamName,
  initialPrimaryChatPlatform,
  quarterConfigured,
  viewerIsOwner,
}: Props) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [step, setStep] = useState<Step>(() =>
    computeInitialStep(
      initialOrgName,
      initialLeadTeamName,
      quarterConfigured,
      viewerIsOwner,
      initialPrimaryChatPlatform
    )
  );
  const [orgName, setOrgName] = useState(initialOrgName);
  const [leadTeamName, setLeadTeamName] = useState(initialLeadTeamName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedChatPlatform, setSelectedChatPlatform] =
    useState<ChatPlatformId>(() =>
      initialPrimaryChatPlatform &&
      isChatPlatformId(initialPrimaryChatPlatform)
        ? initialPrimaryChatPlatform
        : DEFAULT_CHAT_PLATFORM
    );

  const [upcomingQuarterStartMonth, setUpcomingQuarterStartMonth] = useState(4);
  const [upcomingFiscalQuarter, setUpcomingFiscalQuarter] = useState(1);

  useEffect(() => {
    if (!viewerIsOwner && step === 2) {
      setStep(3);
    }
  }, [viewerIsOwner, step]);

  useEffect(() => {
    const target = computeInitialStep(
      initialOrgName,
      initialLeadTeamName,
      quarterConfigured,
      viewerIsOwner,
      initialPrimaryChatPlatform
    );
    if (target > step) {
      setStep(target);
    }
  }, [
    initialOrgName,
    initialLeadTeamName,
    quarterConfigured,
    viewerIsOwner,
    initialPrimaryChatPlatform,
    step,
  ]);

  useEffect(() => {
    if (quarterConfigured && step === 4 && !viewerIsOwner) {
      void updateSession();
      router.replace("/quarter");
      router.refresh();
    }
  }, [quarterConfigured, step, viewerIsOwner, router, updateSession]);

  const inferredFiscalYearStart = inferFiscalYearStartMonthFromQuarterAndMonth(
    upcomingQuarterStartMonth as Month1to12,
    upcomingFiscalQuarter as FiscalQuarter1to4
  );

  async function handleSubmitName(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updateOrgName(orgId, orgName);
      await updateSession();
      setStep(viewerIsOwner ? 2 : 3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitPrimaryChatPlatform(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await saveOrgPrimaryChatPlatform(orgId, selectedChatPlatform);
      await updateSession();
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitLeadTeam(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await saveMyLeadTeam(orgId, leadTeamName);
      await updateSession();
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitQuarter(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await saveOrgQuarterCalendar(orgId, {
        upcomingFiscalQuarter,
        upcomingQuarterStartMonth,
      });
      await updateSession();
      router.replace("/quarter");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecheckQuarterGate() {
    setError(null);
    setLoading(true);
    try {
      await updateSession();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const subtitle =
    step === 1
      ? "Give your organization a name so your team can find it."
      : step === 2
        ? "Choose where your team already discusses strategy. Helm uses this to align integrations with the Vercel Chat SDK."
        : step === 3
          ? "Tell us which team you lead so Helm can align outcomes with the right groups."
          : viewerIsOwner
            ? "Tell Helm when your next quarter starts and which fiscal quarter it is."
            : "Your workspace is almost ready.";

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Set up your organization
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization name</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitName} className="space-y-4">
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Inc"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
                disabled={!viewerIsOwner}
              />
              {!viewerIsOwner ? (
                <p className="text-sm text-muted-foreground">
                  An organization owner needs to set the workspace name first.
                  You can check again after they’ve saved it.
                </p>
              ) : null}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {viewerIsOwner ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Continue"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRecheckQuarterGate}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {loading ? "Checking…" : "Check again"}
                </button>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && viewerIsOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Primary team chat</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmitPrimaryChatPlatform}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Slack is selected by default. You can change this if your org
                mainly uses another supported platform.
              </p>
              <fieldset className="space-y-2">
                <legend className="sr-only">Chat platform</legend>
                {CHAT_PLATFORMS.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground has-[:checked]:border-ring has-[:checked]:bg-muted/40"
                  >
                    <input
                      type="radio"
                      name="primary-chat-platform"
                      value={p.id}
                      checked={selectedChatPlatform === p.id}
                      onChange={() => setSelectedChatPlatform(p.id)}
                      className="border-border text-primary"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </fieldset>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Saving…" : "Continue"}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team you lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitLeadTeam} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                e.g. Product, Engineering, or Design — the group you’re
                accountable for in planning conversations.
              </p>
              <input
                type="text"
                value={leadTeamName}
                onChange={(e) => setLeadTeamName(e.target.value)}
                placeholder="e.g. Product"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Saving…" : "Continue"}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 4 && !viewerIsOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fiscal calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              An organization owner needs to set the next quarter’s first month
              and fiscal quarter (Q1–Q4). Ask them to sign in and complete this
              step.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="button"
              disabled={loading}
              onClick={handleRecheckQuarterGate}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Checking…" : "Check again"}
            </button>
          </CardContent>
        </Card>
      )}

      {step === 4 && viewerIsOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming quarter</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitQuarter} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="q-start-month"
                  className="text-sm font-medium text-foreground"
                >
                  Next quarter’s first month
                </label>
                <select
                  id="q-start-month"
                  value={upcomingQuarterStartMonth}
                  onChange={(e) =>
                    setUpcomingQuarterStartMonth(Number(e.target.value))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="fq-slot"
                  className="text-sm font-medium text-foreground"
                >
                  Fiscal quarter
                </label>
                <select
                  id="fq-slot"
                  value={upcomingFiscalQuarter}
                  onChange={(e) =>
                    setUpcomingFiscalQuarter(Number(e.target.value))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={1}>Q1</option>
                  <option value={2}>Q2</option>
                  <option value={3}>Q3</option>
                  <option value={4}>Q4</option>
                </select>
              </div>

              <p className="text-xs text-muted-foreground">
                From this, Helm infers your fiscal year starts in{" "}
                <span className="font-medium text-foreground">
                  {MONTHS.find((m) => m.value === inferredFiscalYearStart)?.label}
                </span>{" "}
                (Q1 is the first three months of each fiscal year).
              </p>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Saving…" : "Finish"}
              </button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
