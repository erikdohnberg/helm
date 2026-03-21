"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addInvites,
  saveOrgQuarterCalendar,
  updateOrgName,
} from "@/lib/actions/onboarding";
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

function computeInitialStep(
  initialOrgName: string,
  quarterConfigured: boolean
): 1 | 2 | 3 {
  if (!initialOrgName.trim()) return 1;
  if (!quarterConfigured) return 2;
  return 3;
}

type Props = {
  orgId: string;
  initialOrgName: string;
  quarterConfigured: boolean;
  viewerIsOwner: boolean;
};

export default function OnboardingOrgSetupClient({
  orgId,
  initialOrgName,
  quarterConfigured,
  viewerIsOwner,
}: Props) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [step, setStep] = useState<1 | 2 | 3>(() =>
    computeInitialStep(initialOrgName, quarterConfigured)
  );
  const [orgName, setOrgName] = useState(initialOrgName);
  const [inviteEmails, setInviteEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [upcomingQuarterStartMonth, setUpcomingQuarterStartMonth] = useState(4);
  const [upcomingFiscalQuarter, setUpcomingFiscalQuarter] = useState(1);

  useEffect(() => {
    if (quarterConfigured && step === 2) {
      setStep(3);
    }
  }, [quarterConfigured, step]);

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
      setStep(2);
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
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitInvites(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const emails = inviteEmails
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (emails.length > 0) await addInvites(orgId, emails);
      await updateSession();
      router.replace("/quarter");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSkipInvites() {
    await updateSession();
    router.replace("/quarter");
    router.refresh();
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
        ? viewerIsOwner
          ? "Tell Helm when your next quarter starts and which fiscal quarter it is."
          : "Your workspace is almost ready."
        : "Invite teammates by email. They'll be able to join your Helm org once they sign in.";

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

      {step === 2 && !viewerIsOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fiscal calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              An organization owner needs to set the next quarter’s first month and
              fiscal quarter (Q1–Q4). Ask them to sign in and complete this step.
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

      {step === 2 && viewerIsOwner && (
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
                {loading ? "Saving…" : "Continue"}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite team members</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitInvites} className="space-y-4">
              <textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="Enter email addresses, one per line or comma-separated"
                rows={4}
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSkipInvites}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Adding…" : "Send invites"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
