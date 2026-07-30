"use client";

import { useCallback, useId, useRef, useState } from "react";

import { DriftFlag } from "@/components/outcomes/drift-flag";
import { IconButton } from "@/components/ui/button";
import { Chip, Observed } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Alert } from "@/components/ui/toast";
import type { EvalCase } from "@/lib/eval/cases";
import { cn } from "@/lib/utils";

/**
 * The eval cases, one per drift type plus both controls.
 *
 * Every string comes from `model/scenarios/` by way of `lib/eval/cases.ts` —
 * the same files the harness replays. A reader should be able to check the
 * page against the repository and find them identical.
 *
 * The charter carries the anchored left rule and the flag is the real
 * `DriftFlag`, because the point of showing a case is showing what Helm
 * actually produces on it. Brass appears only where drift does: the flag, and
 * a hairline on the one signal the answer key says was enough. The two control
 * cases carry none at all.
 */
export function CaseCarousel({
  cases,
  children,
}: {
  cases: ReadonlyArray<EvalCase>;
  /** Rendered under the carousel — the contribute-a-case invitation. */
  children?: React.ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const active = cases[current];

  const go = useCallback(
    (next: number) => {
      const wrapped = (next + cases.length) % cases.length;
      setCurrent(wrapped);
      const tab = tabsRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]'
      )[wrapped];
      tab?.focus();
    },
    [cases.length]
  );

  function onTabKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(cases.length - 1);
    }
  }

  const flagPoint = active.timeline.find((s) => s.isFlagPoint);

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tabpanel"
        id={`${baseId}-panel-${current}`}
        aria-labelledby={`${baseId}-tab-${current}`}
        className="flex flex-col gap-6 rounded-log border border-border bg-card p-6 md:p-8"
      >
        {/* ── What kind of case this is ─────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-rail uppercase text-sea">
              Case {String(current + 1).padStart(2, "0")} of{" "}
              {String(cases.length).padStart(2, "0")} · {active.typeName}
            </span>
            {active.isControl ? (
              <Chip variant="outline" label="Trap · silence is correct" />
            ) : (
              <Chip
                variant="outline"
                label={`Severity ${active.severity}`}
              />
            )}
          </div>
          <h3 className="max-w-[40ch] font-serif text-[26px] leading-[1.25] text-foreground md:text-[30px]">
            {active.label}
          </h3>
          <p className="max-w-prose text-help text-muted-foreground">
            {active.typeDefinition}
          </p>
          <p className="text-help text-subtle-foreground">
            {active.company} — {active.profile}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ── What the quarter anchored ───────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-rail uppercase text-subtle-foreground">
              What the quarter anchored
            </span>
            <div className="flex overflow-hidden rounded-log border border-border">
              <div aria-hidden className="w-[3px] flex-none bg-foreground" />
              <div className="flex flex-1 flex-col gap-3.5 p-5">
                <div className="flex items-center gap-2">
                  <Icon name="anchor" size={15} strokeWidth={1.7} />
                  <span className="text-eyebrow uppercase">Anchored</span>
                  <span aria-hidden className="text-border-strong">
                    ·
                  </span>
                  <span className="font-mono text-rail uppercase text-sea">
                    {active.charter.timeframe}
                  </span>
                </div>
                <p className="font-serif text-[19px] leading-[1.35]">
                  {active.charter.outcome}
                </p>
                <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-inner border border-border bg-border sm:grid-cols-2">
                  <div className="flex flex-col gap-1 bg-card p-3">
                    <dt className="text-rail font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
                      Metric
                    </dt>
                    <dd className="text-help">{active.charter.metric}</dd>
                  </div>
                  <div className="flex flex-col gap-1 bg-card p-3">
                    <dt className="text-rail font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
                      Target
                    </dt>
                    <dd className="text-help">
                      {active.charter.baseline} → {active.charter.target}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-rail uppercase text-subtle-foreground">
                    Traded away for it
                  </span>
                  <ul className="flex list-disc flex-col gap-1 pl-[18px] text-help text-muted-foreground">
                    {active.charter.tradeOffs.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-help text-subtle-foreground">
                  Anchored {active.charter.anchoredOn}.
                </p>
              </div>
            </div>
          </div>

          {/* ── What actually happened ──────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-rail uppercase text-subtle-foreground">
              What the record then showed
            </span>
            <ol className="border-t border-border">
              {active.timeline.map((s) => (
                <li
                  key={s.id}
                  className={cn(
                    "grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 border-b border-border py-3.5",
                    /* A brass hairline may mark an individual row. This is the
                     * row the answer key says was finally enough. */
                    s.isFlagPoint && "bg-brass-wash pl-3 shadow-[inset_3px_0_0_var(--brass)]"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[12px]",
                      s.isFlagPoint ? "text-brass" : "text-subtle-foreground"
                    )}
                  >
                    {s.date}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[11px] text-subtle-foreground">
                      {s.source}
                    </span>
                    <span className="text-help text-foreground">
                      {s.content}
                    </span>
                    {s.isFlagPoint && (
                      <span className="inline-flex items-center gap-1.5 text-help font-semibold text-drift">
                        <Icon name="bearing-off" size={14} />
                        Enough evidence to flag
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            {active.noticedOn && (
              <Observed className="text-help">
                A person noticed unaided on {active.noticedOn}
                {active.leadDays != null &&
                  (active.leadDays > 0
                    ? ` — ${active.leadDays} days after there was enough to flag`
                    : " — the same day there was enough to flag")}
              </Observed>
            )}
          </div>
        </div>

        {/* ── What Helm should do about it ────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-rail uppercase text-subtle-foreground">
            {active.isControl ? "The correct answer" : "What a correct flag says"}
          </span>
          {active.isControl ? (
            <Alert title="Say nothing">
              {active.insteadSummary}
            </Alert>
          ) : (
            <DriftFlag
              announce={false}
              level={active.severity === "major" ? "halt" : "contradiction"}
              statement={active.flagSummary}
              observed={
                flagPoint
                  ? `Earliest defensible flag: ${flagPoint.date}, from ${flagPoint.source}`
                  : undefined
              }
            />
          )}
          <p className="max-w-prose text-help text-muted-foreground">
            {active.rationale}
          </p>
          <p className="max-w-prose text-help text-subtle-foreground">
            <span className="font-semibold text-foreground">The gap.</span>{" "}
            {active.theGap}
          </p>
        </div>
      </div>

      {/* ── Carousel chrome ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
        <span className="font-mono text-rail uppercase text-subtle-foreground">
          {active.id} · {active.charter.title}
        </span>
        <div className="flex items-center gap-2">
          <IconButton label="The previous case" onClick={() => go(current - 1)}>
            <Icon name="chevron" size={18} className="rotate-180" />
          </IconButton>
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Evaluation cases"
            className="flex items-center gap-2"
          >
            {cases.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-controls={`${baseId}-panel-${i}`}
                aria-selected={i === current}
                tabIndex={i === current ? 0 : -1}
                aria-label={`${c.typeName} — ${c.label}`}
                onClick={() => setCurrent(i)}
                onKeyDown={onTabKeyDown}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-quick ease-out",
                  i === current
                    ? "w-8 bg-foreground"
                    : "w-2.5 bg-border-strong hover:bg-ink-500"
                )}
              />
            ))}
          </div>
          <IconButton label="The next case" onClick={() => go(current + 1)}>
            <Icon name="chevron" size={18} />
          </IconButton>
        </div>
      </div>

      {children}
    </div>
  );
}
