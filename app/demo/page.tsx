import type { Metadata } from "next";

import { AlertTriangle, ArrowRight, FileText, MessageSquare } from "lucide-react";

import { Chip } from "@/components/ui/chip";
import { helmLogoBlackSrc, helmLogoWhiteSrc } from "@/lib/brand/helm-logos";
import { getOutcomesByQuarter, getQuarterById } from "@/lib/mock/mockData";
import type { Outcome } from "@/lib/types";

export const metadata: Metadata = {
  title: "Helm — Record of Intent",
  description: "The distilled record of intent for the quarter, with drift flagged.",
};

/**
 * Standalone, public demo of Helm's output view (the payoff screen).
 *
 * Deliberately self-contained: it reads the hardcoded seed data directly and
 * has no auth, database, or session dependency, so it loads instantly on a
 * plain URL. This is a portfolio/video demo screen, not the real product flow.
 */

const DEMO_QUARTER_ID = "q-fy26-q1";

// Provenance shown under the intent summary — sells the "Helm distilled this
// from your tools" story. Hardcoded for the demo narrative.
const INTENT_PROVENANCE = "Distilled by Helm from 14 Slack threads, 4 Google Docs, and 3 meeting transcripts.";

// The drift flag — Helm's differentiator. Grounded in the seed data: the Q1
// record of intent explicitly deferred partner co-sell to Q2 (see the quarter
// narrative and the deferred outcome out-5), yet recent activity contradicts it.
const DRIFT_FLAG = {
  outcomeTitle: "Pilot partner co-sell program",
  detectedOn: "Jul 10, 2026",
  signal:
    "Slack #gtm-strategy and a new Google Doc show the team restarting partner co-sell planning this week — staffing two reps against it.",
  conflictsWith:
    "The FY26 Q1 record of intent explicitly deferred partner co-sell to Q2 to protect billing unification and self-serve migration.",
  recommendation:
    "Re-align with leadership before committing capacity, or record a deliberate change of intent.",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CharterCard({ outcome }: { outcome: Outcome }) {
  return (
    <li className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{outcome.title}</h3>
        <Chip
          label="Anchored"
          className="bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
        />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{outcome.context}</p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Success metric
          </dt>
          <dd className="mt-0.5 text-sm text-foreground">{outcome.metric}</dd>
        </div>
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Target
          </dt>
          <dd className="mt-0.5 text-sm text-foreground">
            {outcome.target}
            <span className="text-muted-foreground"> · {outcome.timeframe}</span>
          </dd>
        </div>
      </dl>

      {outcome.decisionBullets.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Why this, and what we traded off
          </p>
          <ul className="mt-1.5 space-y-1">
            {outcome.decisionBullets.map((bullet, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
        <span>
          Outcome owner{" "}
          <span className="font-medium text-foreground">{outcome.outcomeOwner}</span>
        </span>
        <span>
          Decision owner{" "}
          <span className="font-medium text-foreground">{outcome.decisionOwner}</span>
        </span>
        <span className="ml-auto flex items-center gap-4">
          {outcome.googleDocUrl && (
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4" aria-hidden />
              Google Doc
            </span>
          )}
          {outcome.slackThreadUrl && (
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" aria-hidden />
              Slack thread
            </span>
          )}
        </span>
      </div>
    </li>
  );
}

export default function DemoPage() {
  const quarter = getQuarterById(DEMO_QUARTER_ID);
  const anchoredOutcomes = getOutcomesByQuarter(DEMO_QUARTER_ID).filter(
    (o) => o.status === "Anchored"
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Slim header — logo only, no links into the gated app. */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <img
            src={helmLogoBlackSrc}
            alt="Helm"
            width={110}
            height={30}
            className="h-7 w-auto object-contain dark:hidden"
          />
          <img
            src={helmLogoWhiteSrc}
            alt="Helm"
            width={110}
            height={30}
            className="hidden h-7 w-auto object-contain dark:block"
          />
          <Chip label="Live demo · seed data" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Record of intent — the distilled summary. */}
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Record of intent
            </h1>
            <Chip label={quarter?.label ?? "FY26 Q1"} />
          </div>
          <p className="mt-4 text-base leading-relaxed text-foreground">
            {quarter?.narrativeSummary}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{INTENT_PROVENANCE}</p>
        </section>

        {/* Drift flag — Helm's differentiator, the payoff of the walkthrough. */}
        <section className="mt-8">
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/8 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />
              <h2 className="text-base font-semibold text-foreground">
                Helm detected drift from intent
              </h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {DRIFT_FLAG.detectedOn}
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-foreground">
              {DRIFT_FLAG.outcomeTitle}
            </p>

            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Signal
                </dt>
                <dd className="mt-0.5 text-foreground">{DRIFT_FLAG.signal}</dd>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide">
                    Conflicts with the record of intent
                  </dt>
                  <dd className="mt-0.5 text-foreground">{DRIFT_FLAG.conflictsWith}</dd>
                </div>
              </div>
            </dl>

            <p className="mt-4 rounded-lg bg-background/60 px-3 py-2 text-sm text-foreground">
              <span className="font-medium">Helm suggests: </span>
              {DRIFT_FLAG.recommendation}
            </p>
          </div>
        </section>

        {/* Anchored outcome charters — the structured record. */}
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Anchored outcomes · {quarter?.label ?? "FY26 Q1"}
          </h2>
          <ul className="mt-3 space-y-4">
            {anchoredOutcomes.map((outcome) => (
              <CharterCard key={outcome.id} outcome={outcome} />
            ))}
          </ul>
        </section>

        <footer className="mt-10 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Slack, Google Docs, and meeting integrations — coming soon. This screen
          is populated with representative seed data.
        </footer>
      </main>
    </div>
  );
}
