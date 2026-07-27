"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, Eyebrow, RecordTitle } from "@/components/ui/card";
import { Help, Input, RadioOption, Select } from "@/components/ui/field";
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

/** Errors name the cause and the next move, never "Something went wrong". */
const CONNECTION_DROPPED =
  "Not recorded — the connection dropped. Your text is still here; try again.";

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
      setError(err instanceof Error ? err.message : CONNECTION_DROPPED);
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
      setError(err instanceof Error ? err.message : CONNECTION_DROPPED);
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
      setError(err instanceof Error ? err.message : CONNECTION_DROPPED);
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
      setError(err instanceof Error ? err.message : CONNECTION_DROPPED);
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

  const lede =
    step === 1
      ? "Every charter is written under an organization's name. This is that name."
      : step === 2
        ? "Helm reads where strategy is already discussed. Naming the platform is what tells it where to listen."
        : step === 3
          ? "Outcomes are attributed to the team that owns them. This is the team you answer for."
          : viewerIsOwner
            ? "An outcome is anchored to a quarter, so Helm needs to know when yours begins."
            : "One step is left, and an owner holds it.";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Eyebrow>Step {step} of 4</Eyebrow>
        <RecordTitle as="h1" level="page">
          Before the first outcome
        </RecordTitle>
        <p className="max-w-prose text-muted-foreground">{lede}</p>
      </header>

      {step === 1 && (
        <Card surface="app" elevation="e1">
          <form onSubmit={handleSubmitName} className="flex flex-col gap-field">
            <Input
              id="org-name"
              label="Organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Inc."
              required
              disabled={!viewerIsOwner}
              help={
                viewerIsOwner
                  ? "Shown on every charter."
                  : "An owner sets the organization name. Check again once they have."
              }
              error={error ?? undefined}
            />
            {viewerIsOwner ? (
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Recording…" : "Record the name"}
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={loading}
                onClick={handleRecheckQuarterGate}
                className="w-full"
              >
                {loading ? "Reading the record…" : "Check again"}
              </Button>
            )}
          </form>
        </Card>
      )}

      {step === 2 && viewerIsOwner && (
        <Card surface="app" elevation="e1">
          <form
            onSubmit={handleSubmitPrimaryChatPlatform}
            className="flex flex-col gap-field"
          >
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-[13px] font-semibold text-foreground">
                Where strategy is discussed
              </legend>
              {CHAT_PLATFORMS.map((p) => (
                <RadioOption
                  key={p.id}
                  id={`chat-platform-${p.id}`}
                  name="primary-chat-platform"
                  value={p.id}
                  checked={selectedChatPlatform === p.id}
                  onChange={() => setSelectedChatPlatform(p.id)}
                >
                  {p.label}
                </RadioOption>
              ))}
            </fieldset>
            {error && <Help tone="error">{error}</Help>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Recording…" : "Record where Helm listens"}
            </Button>
          </form>
        </Card>
      )}

      {step === 3 && (
        <Card surface="app" elevation="e1">
          <form
            onSubmit={handleSubmitLeadTeam}
            className="flex flex-col gap-field"
          >
            <Input
              id="lead-team"
              label="The team you lead"
              value={leadTeamName}
              onChange={(e) => setLeadTeamName(e.target.value)}
              placeholder="Product"
              required
              help="Product, Engineering, Design — the group you are accountable for in planning."
              error={error ?? undefined}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Recording…" : "Record the team"}
            </Button>
          </form>
        </Card>
      )}

      {step === 4 && !viewerIsOwner && (
        <Card surface="app" elevation="e1" className="flex flex-col gap-field">
          <p className="max-w-prose text-help text-muted-foreground">
            An owner sets the first month of the next quarter and which fiscal
            quarter it is. Until then, no outcome can be anchored.
          </p>
          {error && <Help tone="error">{error}</Help>}
          <Button
            disabled={loading}
            onClick={handleRecheckQuarterGate}
            className="w-full"
          >
            {loading ? "Reading the record…" : "Check again"}
          </Button>
        </Card>
      )}

      {step === 4 && viewerIsOwner && (
        <Card surface="app" elevation="e1">
          <form
            onSubmit={handleSubmitQuarter}
            className="flex flex-col gap-field"
          >
            <Select
              id="q-start-month"
              label="The next quarter's first month"
              value={upcomingQuarterStartMonth}
              onChange={(e) =>
                setUpcomingQuarterStartMonth(Number(e.target.value))
              }
              options={MONTHS.map((m) => ({
                value: String(m.value),
                label: m.label,
              }))}
            />
            <Select
              id="fq-slot"
              label="Which fiscal quarter that is"
              value={upcomingFiscalQuarter}
              onChange={(e) => setUpcomingFiscalQuarter(Number(e.target.value))}
              options={[
                { value: "1", label: "Q1" },
                { value: "2", label: "Q2" },
                { value: "3", label: "Q3" },
                { value: "4", label: "Q4" },
              ]}
              help={`From this, your fiscal year starts in ${
                MONTHS.find((m) => m.value === inferredFiscalYearStart)?.label
              }.`}
            />
            {error && <Help tone="error">{error}</Help>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Recording…" : "Record the fiscal calendar"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
