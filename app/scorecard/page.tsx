import type { Metadata } from "next";

import { DriftFlag } from "@/components/outcomes/drift-flag";
import { CaseCarousel } from "@/components/scorecard/case-carousel";
import { Reveal, RevealNoScript } from "@/components/scorecard/reveal";
import { Button } from "@/components/ui/button";
import { Chip, Observed } from "@/components/ui/chip";
import { ExternalLink } from "@/components/ui/field";
import { HelmMark, Icon, type IconName } from "@/components/ui/icon";
import { Table, type TableColumn } from "@/components/ui/table";
import { EVAL_CASES } from "@/lib/eval/cases";
import {
  CASE_COUNT,
  DETECTOR_VERSION,
  RUN_DATE,
} from "@/lib/eval/scorecard-run";
import { cn } from "@/lib/utils";

const ORIGIN = "https://helmyourstrategy.vercel.app";
const REPO = "https://github.com/erikdohnberg/helm";

export const metadata: Metadata = {
  title: "Helm — Drift model evaluation record",
  description:
    "The measured performance of Helm's drift model on thirteen cases with known answers — six measures, each against a crude baseline it had to beat — and what it still cannot claim.",
  alternates: { canonical: `${ORIGIN}/scorecard` },
  openGraph: {
    type: "article",
    siteName: "Helm",
    url: `${ORIGIN}/scorecard`,
    title: "Helm — Drift model evaluation record",
    description:
      "The measured performance of Helm's drift model on thirteen cases with known answers — six measures, each against a crude baseline it had to beat — and what it still cannot claim.",
    images: [
      {
        url: `${ORIGIN}/landing/helm%20logo%20black.png`,
        width: 363,
        height: 363,
        alt: "Helm logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Helm — Drift model evaluation record",
    description:
      "The measured performance of Helm's drift model on thirteen cases with known answers.",
    images: [`${ORIGIN}/landing/helm%20logo%20black.png`],
  },
};

/**
 * The drift model evaluation record — a log surface.
 *
 * The date, version and case count are read from the run's own
 * `scorecard.json` (see `lib/eval/scorecard-run.ts`), so the page reports the
 * date the detector was run rather than the date someone wrote the page. The
 * measured figures below are still transcribed by hand; when a new run is
 * published, change the import in that module and update them together.
 *
 * This is a route rather than static HTML because the design composes real
 * design-system components: the drift flag, the table, chips and buttons. A
 * second hand-written copy of them would be the exact duplication the system
 * exists to remove.
 */

/** A numbered entry. The rail carries the number and its name; a 2px navy rule
 * opens the block. The rail never holds prose. */
function Entry({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="px-6 pt-section md:px-8">
        <div className="mx-auto grid max-w-page grid-cols-1 gap-y-3 md:grid-cols-[var(--rail)_minmax(0,1fr)] md:gap-x-rail-indent">
          <div className="pt-2 font-mono text-rail uppercase text-subtle-foreground">
            {label}
          </div>
          <div className="border-t-2 border-foreground pt-7">{children}</div>
        </div>
      </section>
    </Reveal>
  );
}

function EntryHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-page-title text-foreground">{children}</h2>
  );
}

/** The detection window — three states, marked by rule weight, never colour. */
const WINDOW = [
  {
    label: "Too early",
    body: "Talk, not committed work. A flag here is noise.",
    rule: "bg-[linear-gradient(to_right,var(--ink-400)_0_40%,transparent_40%)] bg-[length:5px_3px] bg-repeat-x",
    tone: "bg-sunken",
    strong: false,
  },
  {
    label: "The window",
    body: "Real evidence exists and nobody has connected it. The whole product lives here.",
    rule: "bg-foreground",
    tone: "bg-card",
    strong: true,
  },
  {
    label: "Too late",
    body: "A person already noticed. The flag tells them what they know.",
    rule: "bg-transparent",
    tone: "bg-sunken",
    strong: false,
  },
] as const;

const TIMELINE: {
  date: string;
  glyph: IconName;
  tone: string;
  body: React.ReactNode;
}[] = [
  {
    date: "14 Jul",
    glyph: "watch",
    tone: "text-subtle-foreground",
    body: "Sales asks who owns single sign-on for a large prospect. Talk, not committed work.",
  },
  {
    date: "17 Jul",
    glyph: "bearing-off",
    tone: "text-drift",
    body: (
      <>
        <div className="font-serif text-[19px] leading-[1.4]">
          A design document lands with two named engineers on it.
        </div>
        <Observed className="mt-2 text-help">
          Flagged 17 Jul across 2 sources — the window opens here.
        </Observed>
      </>
    ),
  },
  {
    date: "21 Jul",
    glyph: "sounding",
    tone: "text-subtle-foreground",
    body: "At sprint planning the product lead sees 40 per cent of capacity gone and reaches the same conclusion. The window closes here.",
  },
  {
    date: "11 Aug",
    glyph: "half-mast",
    tone: "text-subtle-foreground",
    body: "Leadership finds out at the mid-quarter review. The setup metric has been flat for a month.",
  },
];

/**
 * The six measures. `clearsBaseline` draws the anchored left rule — the same
 * stroke vocabulary the product uses, doing the same job: state at the edge,
 * legible in greyscale, never a colour.
 */
const MEASURES = [
  {
    question: "When it speaks up, is it right?",
    figure: "80.0",
    unit: "%",
    baseline: "precision · baseline 75.0%",
    note: "Four flags in five are real. A wrong flag mutes the tool faster than a missed one does.",
    clearsBaseline: true,
  },
  {
    question: "Of the real contradictions, how many does it catch?",
    figure: "90.9",
    unit: "%",
    baseline: "recall · baseline 72.7%",
    note: "Ten of eleven. Version 1.0 caught all eleven and was worse, by flagging early and often.",
    clearsBaseline: true,
  },
  {
    question: "How much warning does it give?",
    figure: "9.5",
    unit: " days",
    baseline: "median lead · baseline 5.5 days",
    note: "Days ahead of the person who noticed unaided. Zero would mean it only confirms what people already see.",
    clearsBaseline: true,
  },
  {
    question: "Does it know when to say nothing?",
    figure: "0",
    unit: "",
    baseline: "false flags on 2 trap cases",
    note: "A properly recorded replacement, and a lively thread that never became work. Both correctly left alone.",
    clearsBaseline: true,
  },
  {
    question: "Does it name the right contradiction?",
    figure: "60.0",
    unit: "%",
    baseline: "type accuracy · baseline 12.5%",
    note: "Whether to re-staff, re-scope or replace depends on which kind of drift it is. Six of ten named it.",
    clearsBaseline: true,
  },
  {
    question: "Does it reach the right people?",
    figure: "65.0",
    unit: "%",
    baseline: "routing · baseline 68.8% · below the baseline",
    note: (
      <>
        Drift sits between two people holding half a picture each. Reaching only
        the half that already knows closes nothing.{" "}
        <strong className="font-semibold text-foreground">
          The weakest measure, unmoved since 1.0, and next.
        </strong>
      </>
    ),
    clearsBaseline: false,
  },
] as const;

const LIMITS = [
  {
    title: "Written, not lived",
    body: "No real company produced these cases. Replaying a past quarter with the people who lived it is the validation that counts.",
  },
  {
    title: "The days are too clean",
    body: "Each case contains only signals that matter. A real day is mostly irrelevant traffic the detector never has to filter here.",
  },
  {
    title: "One outcome at a time",
    body: "Real quarters anchor several outcomes competing for the same people, where drift on one funds another. Unmeasured.",
  },
  {
    title: "Routing is unproven",
    body: "Flags reach the outcome’s owners, which is one side of the gap. Reaching the other side is designed and unbuilt.",
  },
];

type BaselineRow = Record<string, React.ReactNode>;

const BASELINE_COLUMNS: TableColumn<BaselineRow>[] = [
  { key: "model", label: "Detector" },
  { key: "precision", label: "Precision", align: "right", mono: true },
  { key: "recall", label: "Recall", align: "right", mono: true },
  { key: "lead", label: "Median lead", align: "right", mono: true },
  { key: "type", label: "Type accuracy", align: "right", mono: true },
];

const BASELINE_ROWS: BaselineRow[] = [
  {
    model: (
      <span className="font-semibold text-foreground">
        Detector {DETECTOR_VERSION} — shipped
      </span>
    ),
    precision: "80.0%",
    recall: "90.9%",
    lead: "9.5 d",
    type: "60.0%",
  },
  {
    model: "Detector v1.0.0 — withheld",
    precision: "45.5%",
    recall: "100%",
    lead: "13 d",
    type: "36.4%",
  },
  {
    model: "Ten-day silence rule — the bar",
    precision: "75.0%",
    recall: "72.7%",
    lead: "5.5 d",
    type: "12.5%",
  },
];

export default function ScorecardPage() {
  return (
    <div className="log-surface min-h-screen bg-background text-foreground">
      <RevealNoScript />
      <header className="border-b-2 border-brass bg-navy-deep text-[oklch(0.958_0.008_85)]">
        <div className="mx-auto flex max-w-page flex-wrap items-center gap-4 px-6 py-5 md:px-8">
          <HelmMark size={26} title="Helm" />
          <span className="font-serif text-[22px] tracking-[-0.015em]">
            Helm
          </span>
          <span className="ml-auto font-mono text-identifier uppercase tracking-[0.1em] text-[oklch(0.780_0.016_85)]">
            Evaluation record · {DETECTOR_VERSION} · {RUN_DATE}
          </span>
        </div>
      </header>

      {/* ── The record header ───────────────────────────────────────────── */}
      <Reveal>
        <section className="px-6 pt-section md:px-8">
          <div className="mx-auto grid max-w-page grid-cols-1 gap-y-3 md:grid-cols-[var(--rail)_minmax(0,1fr)] md:gap-x-rail-indent">
            <div className="pt-2.5 font-mono text-rail uppercase text-sea">
              Record
            </div>
            <div>
              <h1 className="max-w-[24ch] font-serif text-display">
                Evaluating the drift model
              </h1>
              <p className="mt-7 max-w-prose font-serif text-lede">
                The drift model is the part of Helm that catches the moment a
                plan stops matching the work. This record states its measured
                performance on thirteen cases with known answers — six measures,
                each against a crude baseline it had to beat — and what it still
                cannot claim.
              </p>
              <p className="mt-4 max-w-prose text-muted-foreground">
                The model, the cases and every evaluation run are open source.
                Corrections, harder cases and better rules are welcome —{" "}
                <ExternalLink href={REPO}>github.com/erikdohnberg/helm</ExternalLink>
                .
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <Chip variant="outline" label={`Drift model ${DETECTOR_VERSION}`} />
                <Chip variant="outline" label={`${CASE_COUNT} written cases`} />
                <Chip variant="outline" label="6 measures" />
                <Chip variant="outline" label="Open source" />
                {/* Longer than a fact chip, so it is allowed to wrap rather
                  * than push the page sideways on a narrow screen. */}
                <Chip
                  variant="observed"
                  className="whitespace-normal"
                  label="Replayed one day at a time, no human in the loop"
                />
              </div>
              <div className="mt-7">
                <a href={REPO} className="inline-flex no-underline">
                  <Button>Read the model in the repository</Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── 01 · Drift ──────────────────────────────────────────────────── */}
      <Entry label="01 · Drift">
        <EntryHeading>Nobody decides to abandon a priority</EntryHeading>
        <p className="mt-6 max-w-prose">
          A company anchors on faster customer setup for the quarter and records
          that enterprise single sign-on is deliberately deferred. Three weeks
          later two of the five engineers are building single sign-on. A large
          deal came in, an executive asked, an engineer read the ask as
          approval.{" "}
          <strong className="font-semibold">
            The priority changed and nobody decided it.
          </strong>
        </p>
        <p className="mt-3.5 max-w-prose text-muted-foreground">
          Drift is that distance — recorded intent against actual behaviour,
          with no decision in between. Reading the traffic is not the hard part.
          Being right often enough that people keep listening is.
        </p>
        <div className="mt-8 max-w-prose">
          <DriftFlag
            level="contradiction"
            statement="Work started 17 Jul contradicts what this quarter anchored on 14 Jan."
            observed="Observed 17 Jul across 2 sources."
            question="What stops?"
          />
        </div>
        <p className="mt-3.5 max-w-help text-help text-subtle-foreground">
          The flag the detector produced on the case below, five days before
          anyone raised it unaided.
        </p>
      </Entry>

      {/* ── 02 · Method ─────────────────────────────────────────────────── */}
      <Entry label="02 · Method">
        <EntryHeading>Thirteen cases with known answers</EntryHeading>
        <p className="mt-6 max-w-prose">
          Thirteen fictional companies were written out in full: the plan each
          anchored, then the weeks of messages, meetings and documents that
          followed. Each carries an answer key giving the earliest point there
          was enough evidence to flag, and the day a person noticed unaided. The
          detector replays each case a day at a time and never sees tomorrow.
          Two cases are traps where silence is the correct answer.
        </p>

        <div className="mt-9 grid grid-cols-1 overflow-hidden rounded-log border border-border sm:grid-cols-3">
          {WINDOW.map((w, i) => (
            <div
              key={w.label}
              className={cn(
                "px-5 py-4.5",
                w.tone,
                i < WINDOW.length - 1 &&
                  "border-b border-border sm:border-b-0 sm:border-r"
              )}
            >
              <div aria-hidden className={cn("h-[3px] w-11", w.rule)} />
              <div
                className={cn(
                  "mt-3 text-eyebrow uppercase",
                  w.strong
                    ? "font-bold text-foreground"
                    : "font-semibold text-subtle-foreground"
                )}
              >
                {w.label}
              </div>
              <p className="mt-2 text-help text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>

        {/* An abridged view of case 01 — the same case the carousel below
          * opens with — showing where the window opens and closes. */}
        <p className="mt-10 font-mono text-rail uppercase text-subtle-foreground">
          The window, on case 01
        </p>
        <div className="mt-3 border-t border-border">
          {TIMELINE.map((t) => (
            <div
              key={t.date}
              className="grid grid-cols-[4.5rem_1.625rem_minmax(0,1fr)] items-start gap-x-4 border-b border-border py-4"
            >
              <div className="pt-[3px] font-mono text-identifier text-muted-foreground">
                {t.date}
              </div>
              <div className={cn("inline-flex pt-0.5", t.tone)}>
                <Icon name={t.glyph} size={18} />
              </div>
              <div>{t.body}</div>
            </div>
          ))}
        </div>

        {/* The cases themselves — one per drift type, plus both traps. Read
          * from model/scenarios/ so the page cannot drift from the eval set. */}
        <div className="mt-10 flex flex-col gap-4">
          <p className="max-w-prose text-muted-foreground">
            Here are nine of them: one for each kind of drift the model
            recognises, and both traps. Each shows what the quarter anchored,
            what the record then showed, and what a correct flag would have
            said.
          </p>
          <CaseCarousel cases={EVAL_CASES}>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5">
              <a
                href={`${REPO}/issues/new?labels=eval-case`}
                className="inline-flex no-underline"
              >
                <Button variant="outline">Contribute a case</Button>
              </a>
              <span className="max-w-help text-help text-muted-foreground">
                A quarter that drifted, the plan it drifted from, and the day
                someone noticed. The cases are open source; thirteen is not
                enough.
              </span>
            </div>
          </CaseCarousel>
        </div>
      </Entry>

      {/* ── 03 · Result ─────────────────────────────────────────────────── */}
      <Entry label="03 · Result">
        <EntryHeading>Six measures, plainly</EntryHeading>
        <p className="mt-6 max-w-prose text-muted-foreground">
          A left rule marks the five measures that clear the crude baseline. The
          sixth carries none.
        </p>
        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {MEASURES.map((m) => (
            <div
              key={m.question}
              className={cn(
                "rounded-log border border-border bg-card p-card",
                m.clearsBaseline && "border-l-[3px] border-l-foreground"
              )}
            >
              <div className="font-serif text-outcome">{m.question}</div>
              <div
                className={cn(
                  "mt-5 font-serif text-[44px] leading-none tracking-[-0.015em] [font-variant-numeric:tabular-nums]",
                  m.clearsBaseline ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {m.figure}
                {m.unit && (
                  <span
                    className={cn(
                      "text-[20px]",
                      m.clearsBaseline
                        ? "text-muted-foreground"
                        : "text-subtle-foreground"
                    )}
                  >
                    {m.unit}
                  </span>
                )}
              </div>
              <div className="mt-2 font-mono text-identifier text-muted-foreground">
                {m.baseline}
              </div>
              <p className="mt-3.5 text-help text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>
      </Entry>

      {/* ── 04 · Baseline ───────────────────────────────────────────────── */}
      <Entry label="04 · Baseline">
        <EntryHeading>Against the bar it had to beat</EntryHeading>
        <p className="mt-6 max-w-prose">
          The bar is a deliberately crude detector: flag any anchored outcome
          with no visible activity for ten days. Anything more complex has to
          earn its complexity against it. Version 1.0 did not, and did not ship.
        </p>
        <div className="mt-7">
          <Table
            caption="Detector versions against the ten-day silence rule"
            columns={BASELINE_COLUMNS}
            rows={BASELINE_ROWS}
          />
        </div>
        <p className="mt-5 max-w-prose">
          <strong className="font-semibold">One change fixed it.</strong> A rule
          that fired on any hint of tension now requires evidence of a decision
          colliding with the anchored plan. Early flags fell from six to two,
          and precision moved from 45.5 per cent to 80.0 per cent.
        </p>
      </Entry>

      {/* ── 05 · Limits ─────────────────────────────────────────────────── */}
      <Entry label="05 · Limits">
        <EntryHeading>What this record cannot claim yet</EntryHeading>
        <div className="mt-7 border-t border-border">
          {LIMITS.map((l) => (
            <div
              key={l.title}
              className="grid grid-cols-1 gap-x-6 gap-y-1 border-b border-border py-4.5 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]"
            >
              <div className="font-serif text-[19px] leading-[1.35]">
                {l.title}
              </div>
              <div className="text-muted-foreground">{l.body}</div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={`${REPO}/issues/new?labels=pilot`}
            className="inline-flex no-underline"
          >
            <Button>Ask about the pilot</Button>
          </a>
          <span className="max-w-help text-help text-muted-foreground">
            Written cases cannot settle any of the four limits above. A pilot
            with a real company can. If that could be yours, say so.
          </span>
        </div>
      </Entry>

      <footer className="mt-section border-t border-border bg-sunken">
        <div className="mx-auto grid max-w-page grid-cols-1 gap-y-3 px-6 pb-14 pt-10 md:grid-cols-[var(--rail)_minmax(0,1fr)] md:gap-x-rail-indent md:px-8">
          <div className="pt-1 font-mono text-rail uppercase text-subtle-foreground">
            Filed
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <div className="max-w-help text-help text-muted-foreground">
              Recorded {RUN_DATE}. The specification, every evaluation run and the
              failure analyses are committed in the repository.
            </div>
            <ExternalLink href={REPO} className="font-mono text-identifier">
              github.com/erikdohnberg/helm
            </ExternalLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
