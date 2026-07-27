"use client";

import { useState } from "react";

import { LogHeading, RailLabel } from "@/components/log/log";
import { IconButton } from "@/components/ui/button";
import { Chip, Observed } from "@/components/ui/chip";
import { Icon, type IconName } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * How Helm works, in six entries.
 *
 * The specimens below are drawn from the system rather than mocked up: ruled
 * blocks on chart paper, the left-rule state vocabulary, instrument glyphs,
 * and verdigris on anything Helm observed. Brass appears nowhere here — the
 * page's one brass moment belongs to the question, further down.
 */
function Specimen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[340px] w-full flex-col justify-center gap-4 rounded-log border border-border bg-card p-6">
      {children}
    </div>
  );
}

/** A ruled block inside a specimen — 2px rule opens it, hairlines divide it. */
function SpecimenBlock({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t-2 border-foreground pt-3", className)}>
      {label && <RailLabel className="mb-2">{label}</RailLabel>}
      {children}
    </div>
  );
}

function SourceRow({ icon, label }: { icon: IconName; label: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border py-2.5 last:border-b-0">
      <Icon name={icon} size={16} className="text-muted-foreground" />
      <span className="text-control text-foreground">{label}</span>
    </div>
  );
}

function ListeningSpecimen() {
  return (
    <Specimen>
      <SpecimenBlock label="Where Helm reads">
        <SourceRow icon="watch" label="Meeting transcripts" />
        <SourceRow icon="search" label="Strategy discussions" />
        <SourceRow icon="provenance" label="Slack channels you nominate" />
      </SpecimenBlock>
      <div className="flex items-center gap-3 py-2">
        <span className="h-px flex-1 bg-border" />
        <Icon name="heading" size={16} className="text-muted-foreground" />
        <span className="h-px flex-1 bg-border" />
      </div>
      <SpecimenBlock label="What it noticed">
        <div className="flex flex-col gap-2 pt-1">
          <Observed className="text-help">
            Eleven mentions of billing across two channels
          </Observed>
          <Observed className="text-help">
            Four engineers moved to unentered work
          </Observed>
        </div>
      </SpecimenBlock>
    </Specimen>
  );
}

function DraftSpecimen() {
  return (
    <Specimen>
      <RailLabel>Draft charter</RailLabel>
      <div className="flex overflow-hidden rounded-log border border-border">
        <div aria-hidden className="w-[3px] flex-none bg-foreground" />
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <Icon name="anchor" size={15} strokeWidth={1.7} />
            <span className="text-eyebrow uppercase">Anchored</span>
          </div>
          <p className="font-serif text-[19px] leading-[1.35]">
            Two named design partners live on the co-sell motion
          </p>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-inner border border-border bg-border">
            <div className="flex flex-col gap-1 bg-card p-3">
              <dt className="text-rail font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
                Metric
              </dt>
              <dd className="text-control">Partners live in production</dd>
            </div>
            <div className="flex flex-col gap-1 bg-card p-3">
              <dt className="text-rail font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
                Target
              </dt>
              <dd className="text-control">2 by 31 Mar</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-1.5">
            <RailLabel>Traded away for this</RailLabel>
            <Skeleton width="82%" />
            <Skeleton width="58%" />
          </div>
        </div>
      </div>
    </Specimen>
  );
}

function AlignmentSpecimen() {
  return (
    <Specimen>
      <SpecimenBlock label="FY26 Q1 · anchored">
        <div className="flex flex-col">
          {[
            "Self-serve billing live for all new accounts",
            "Reduce onboarding time to three days",
            "Publish the pricing page rewrite",
          ].map((title, i) => (
            <div
              key={title}
              className="flex items-start gap-3 border-b border-border py-3.5 last:border-b-0"
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1 h-6 w-[3px] flex-none",
                  i === 2
                    ? "bg-[linear-gradient(to_bottom,var(--ink-400)_0_38%,transparent_38%_100%)]"
                    : "bg-foreground"
                )}
              />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-serif text-[17px]">{title}</span>
                <span className="text-help text-subtle-foreground">
                  {i === 2
                    ? "Added 03 Feb · nothing stopped"
                    : "Anchored 14 Jan"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SpecimenBlock>
      <p className="text-help text-muted-foreground">
        The partial rule marks the third outcome as additive: it entered without
        displacing anything.
      </p>
    </Specimen>
  );
}

function ThreadSpecimen() {
  return (
    <Specimen>
      <RailLabel>Attached · adds no commitment</RailLabel>
      <div className="flex overflow-hidden rounded-log border border-border">
        <div aria-hidden className="w-[3px] flex-none bg-foreground" />
        <div className="flex flex-1 flex-col gap-1.5 p-5">
          <span className="text-eyebrow uppercase">Anchored</span>
          <span className="font-serif text-[17px]">
            Two design partners live on co-sell
          </span>
        </div>
      </div>
      <div className="ml-[2.125rem] flex flex-col gap-3">
        {["Partner onboarding runbook", "Co-sell enablement deck"].map(
          (title) => (
            <div
              key={title}
              className="flex flex-col gap-1.5 rounded-log border border-border p-4"
            >
              <div className="flex items-center gap-2">
                <Icon name="shackle" size={14} className="text-sea" />
                <span className="font-mono text-rail uppercase text-sea">
                  Attached
                </span>
              </div>
              <span className="font-serif text-[16px]">{title}</span>
            </div>
          )
        )}
      </div>
      <p className="text-help text-muted-foreground">
        Attachment earns no edge mark, only subordination in space. Nesting is
        the semantics.
      </p>
    </Specimen>
  );
}

function DriftSpecimen() {
  return (
    <Specimen>
      <RailLabel>Drift · severity: halt</RailLabel>
      <div className="flex overflow-hidden rounded-log border border-drift">
        <div aria-hidden className="w-[3px] flex-none bg-drift" />
        <div className="flex-1">
          <div aria-hidden className="h-1.5 bg-drift-wash" />
          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="h-2 w-2 flex-none rotate-45 bg-drift"
              />
              <span className="text-eyebrow font-bold uppercase text-drift">
                Halt
              </span>
              <Icon
                name="bearing-off"
                size={17}
                className="ml-auto text-drift"
              />
            </div>
            <p className="font-serif text-[18px] leading-[1.4]">
              Work started 21 Feb contradicts what this quarter anchored on 14
              Jan.
            </p>
            <Observed className="text-help">
              Four engineers have been on unentered work for three days
            </Observed>
            <p className="text-control font-semibold">What stops?</p>
          </div>
        </div>
      </div>
      <p className="text-help text-muted-foreground">
        Brass appears in exactly one context. If you see it, something you
        already decided is being contradicted.
      </p>
    </Specimen>
  );
}

function MemorySpecimen() {
  return (
    <Specimen>
      <SpecimenBlock label="14 Jan – 21 Feb">
        <ol className="flex flex-col">
          {[
            {
              date: "14 Jan",
              glyph: "anchor" as IconName,
              title: "Anchored — two design partners live on co-sell",
            },
            {
              date: "18 Feb",
              glyph: "bearing-off" as IconName,
              title: "Drift detected — billing work started unentered",
              observed: true,
            },
            {
              date: "21 Feb",
              glyph: "beacon" as IconName,
              title: "Replaced — self-serve billing anchored in its place",
            },
          ].map((entry) => (
            <li
              key={entry.date}
              className="grid grid-cols-[3.5rem_1.25rem_minmax(0,1fr)] items-baseline gap-3 border-b border-border py-3 last:border-b-0"
            >
              <span className="font-mono text-[12px] text-subtle-foreground">
                {entry.date}
              </span>
              <span className="flex justify-center">
                <Icon
                  name={entry.glyph}
                  size={15}
                  className={
                    entry.observed ? "text-sea" : "text-muted-foreground"
                  }
                />
              </span>
              {entry.observed ? (
                <Observed className="text-control">{entry.title}</Observed>
              ) : (
                <span className="text-control">{entry.title}</span>
              )}
            </li>
          ))}
        </ol>
      </SpecimenBlock>
      <div className="flex overflow-hidden rounded-log border border-border opacity-[0.72]">
        <div
          aria-hidden
          className="w-[3px] flex-none bg-[repeating-linear-gradient(to_bottom,var(--ink-300)_0_3px,transparent_3px_7px)]"
        />
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <span className="text-eyebrow uppercase text-muted-foreground">
            Replaced
          </span>
          <span className="font-serif text-[16px] line-through decoration-ink-400 decoration-1">
            Two design partners live on co-sell
          </span>
          <span className="text-help text-muted-foreground">
            Traded away, never deleted. The reasoning stays fully legible.
          </span>
        </div>
      </div>
    </Specimen>
  );
}

const slides = [
  {
    number: "01",
    kicker: "Helm listens",
    title: "It reads where strategy already happens",
    description:
      "Helm connects to the meetings, documents and channels a team already uses, and collects the signals that shape a quarter.",
    terms: [
      "Meeting transcripts",
      "Strategy discussions",
      "Nominated channels",
    ],
    visual: <ListeningSpecimen />,
  },
  {
    number: "02",
    kicker: "Draft outcomes",
    title: "It turns those signals into a charter",
    description:
      "Related signals become a draft Outcome Charter — the commitment in serif, the metric and target beside it, and what the team traded away underneath.",
    terms: ["Cluster the inputs", "Draft the charter", "Attach the cost"],
    visual: <DraftSpecimen />,
  },
  {
    number: "03",
    kicker: "Anchor the quarter",
    title: "Leadership anchors, and the quarter says so",
    description:
      "A draft becomes anchored when a person decides it. An outcome that entered without displacing anything carries a partial rule for the rest of the quarter.",
    terms: ["Review", "Anchor", "Or add, and say nothing stopped"],
    visual: <AlignmentSpecimen />,
  },
  {
    number: "04",
    kicker: "Attached work",
    title: "Work joins an outcome without becoming one",
    description:
      "Attachment adds no commitment, so it earns no edge mark — only subordination in space. The quarter's shape does not change because a task appeared.",
    terms: ["Join work to an outcome", "Add no commitment", "Keep the context"],
    visual: <ThreadSpecimen />,
  },
  {
    number: "05",
    kicker: "Drift",
    title: "It says so when new work contradicts the quarter",
    description:
      "Helm names both sides, the contradiction between them, and the question. Severity is carried by rule weight and the verb, never by a second colour.",
    terms: ["Notice", "Contradiction", "Halt"],
    visual: <DriftSpecimen />,
  },
  {
    number: "06",
    kicker: "Institutional memory",
    title: "Nothing is deleted, only replaced",
    description:
      "A traded-away outcome keeps its reasoning and names its successor, so a person who missed the meeting can still say what changed and what it cost.",
    terms: ["Record what changed", "Keep the trade-off", "Name the successor"],
    visual: <MemorySpecimen />,
  },
];

export function FeatureCarouselSection() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  return (
    <section
      className="grid grid-cols-1 border-t border-border py-14 md:grid-cols-[var(--rail)_minmax(0,1fr)] md:py-20"
      aria-label="How Helm works"
    >
      <div
        aria-hidden
        className="mb-6 flex flex-row items-center gap-3 md:mb-0 md:flex-col md:gap-2.5"
      >
        <span className="font-mono text-rail uppercase text-subtle-foreground">
          03
        </span>
        <span className="h-px w-10 bg-border-strong md:h-[46px] md:w-px" />
      </div>

      <div className="flex flex-col gap-10 md:pl-rail-indent">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex max-w-xl flex-col gap-5">
            <RailLabel>
              {slide.number} · {slide.kicker}
            </RailLabel>
            <LogHeading className="text-[34px] md:text-[40px]">
              {slide.title}
            </LogHeading>
            <p className="max-w-prose text-[16px] text-muted-foreground">
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {slide.terms.map((term) => (
                <Chip key={term} variant="outline" label={term} />
              ))}
            </div>
          </div>

          <div aria-live="polite">{slide.visual}</div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
          <RailLabel>
            Entry {slide.number} of {String(slides.length).padStart(2, "0")}
          </RailLabel>

          <div className="flex items-center gap-2">
            <IconButton
              label="The previous entry"
              onClick={() =>
                setCurrent((i) => (i === 0 ? slides.length - 1 : i - 1))
              }
            >
              <Icon name="chevron" size={18} className="rotate-180" />
            </IconButton>

            <div
              className="flex items-center gap-2"
              role="tablist"
              aria-label="Entries"
            >
              {slides.map((s, i) => (
                <button
                  key={s.number}
                  type="button"
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Entry ${s.number} — ${s.kicker}`}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-quick ease-out",
                    i === current
                      ? "w-8 bg-foreground"
                      : "w-2.5 bg-border-strong hover:bg-ink-500"
                  )}
                />
              ))}
            </div>

            <IconButton
              label="The next entry"
              onClick={() =>
                setCurrent((i) => (i === slides.length - 1 ? 0 : i + 1))
              }
            >
              <Icon name="chevron" size={18} />
            </IconButton>
          </div>
        </div>
      </div>
    </section>
  );
}
