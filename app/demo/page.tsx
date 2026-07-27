import type { Metadata } from "next";

import { Eyebrow, RecordTitle } from "@/components/ui/card";
import { Chip, Observed } from "@/components/ui/chip";
import { HelmMark } from "@/components/ui/icon";
import { DriftFlag } from "@/components/outcomes/drift-flag";
import { OutcomeCard } from "@/components/outcomes/outcome-card";
import { getOutcomesByQuarter, getQuarterById } from "@/lib/mock/mockData";

export const metadata: Metadata = {
  title: "Helm — Record of intent",
  description:
    "The quarter as recorded: what was committed to, what it cost, and what now contradicts it.",
};

/**
 * Standalone, public demo of Helm's output view (the payoff screen).
 *
 * This is the `Record of intent` composition from §11 of the design system:
 * a navy header carrying the mark, a prose summary, the unresolved
 * contradiction, then hairline rows of outcomes with their state at the edge.
 *
 * Deliberately self-contained: it reads the hardcoded seed data directly and
 * has no auth, database, or session dependency, so it loads instantly on a
 * plain URL.
 */
const DEMO_QUARTER_ID = "q-fy26-q1";

/** Observed, not authored — Helm derived it, nobody typed it. */
const INTENT_PROVENANCE =
  "Distilled from 14 Slack threads, 4 Google Docs and 3 meeting transcripts";

/**
 * The drift flag — grounded in the seed data: the Q1 record of intent
 * explicitly deferred partner co-sell to Q2, yet recent activity contradicts
 * it. Severity is halt, because capacity is already moving.
 */
const DRIFT_FLAG = {
  statement:
    "Work started on partner co-sell contradicts what this quarter anchored: co-sell was deferred to FY26 Q2 to protect billing unification.",
  observed:
    "Two reps staffed against co-sell since 10 Jul, across #gtm-strategy and one new document",
  question: "What stops?",
};

export default function DemoPage() {
  const quarter = getQuarterById(DEMO_QUARTER_ID);
  const anchoredOutcomes = getOutcomesByQuarter(DEMO_QUARTER_ID).filter(
    (o) => o.status === "Anchored"
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navy header with the mark — the masthead of a record. */}
      <header className="border-b-2 border-brass bg-navy-deep">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3 text-[oklch(0.97_0.01_85)]">
            <HelmMark size={26} title="Helm" />
            <span className="font-serif text-[21px] font-medium tracking-[0.01em]">
              Helm
            </span>
          </div>
          <span className="font-mono text-rail uppercase text-brass-soft">
            {quarter?.label ?? "FY26 Q1"}
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-section-compact px-6 py-12">
        <section className="flex flex-col gap-4">
          <Eyebrow>Record of intent</Eyebrow>
          <RecordTitle as="h1" level="page">
            {quarter?.label ?? "FY26 Q1"}
          </RecordTitle>
          <p className="max-w-prose font-serif text-lede text-foreground">
            {quarter?.narrativeSummary}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Observed className="text-help">{INTENT_PROVENANCE}</Observed>
            <Chip variant="observed" label="Seed data" />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <Eyebrow>Unresolved</Eyebrow>
          <DriftFlag
            level="halt"
            statement={DRIFT_FLAG.statement}
            observed={DRIFT_FLAG.observed}
            question={DRIFT_FLAG.question}
          />
          <p className="max-w-prose text-help text-muted-foreground">
            Nothing enters the quarter silently. Helm observed the conflict;
            only a person can resolve it.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <Eyebrow>Anchored</Eyebrow>
          <ul className="flex flex-col gap-3">
            {anchoredOutcomes.map((outcome) => (
              <OutcomeCard
                key={outcome.id}
                state="anchored"
                quarter={quarter?.label ?? "FY26 Q1"}
                title={outcome.title}
                facts={[
                  { label: "Metric", value: outcome.metric },
                  {
                    label: "Target",
                    value: `${outcome.target} · ${outcome.timeframe}`,
                  },
                  { label: "Outcome owner", value: outcome.outcomeOwner },
                  { label: "Decision owner", value: outcome.decisionOwner },
                ]}
                reasons={outcome.decisionBullets}
              >
                {outcome.context && (
                  <p className="max-w-prose text-help text-muted-foreground">
                    {outcome.context}
                  </p>
                )}
              </OutcomeCard>
            ))}
          </ul>
        </section>

        <footer className="border-t border-border pt-5">
          <p className="max-w-prose text-help text-subtle-foreground">
            Slack, Google Docs and meeting integrations are not wired yet. This
            screen reads representative seed data.
          </p>
        </footer>
      </main>
    </div>
  );
}
