import * as React from "react";

import { Observed } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * The reserved exception.
 *
 * Brass appears in exactly one context: a contradiction between new work and
 * an anchored outcome. It is not a status palette — there is no matching
 * green, no matching red. Its meaning comes from scarcity: if you see brass
 * anywhere in Helm, something you already decided is being contradicted.
 *
 * Severity is carried by rule weight and the verb in the sentence, never by a
 * second hue. The flag stays legible in greyscale from its rule weight, its
 * diamond mark and its sentence, and it renders in an `aria-live` region.
 *
 * - `notice` — hairline. "Attachment volume has doubled without a charter change."
 * - `contradiction` — 3px rule. "Work started 21 Feb contradicts what this quarter anchored on 14 Jan."
 * - `halt` — rule plus wash band, and it asks "What stops?"
 */
export type DriftLevel = "notice" | "contradiction" | "halt";

const LEVELS: Record<
  DriftLevel,
  { rule: string; label: string; weight: string }
> = {
  notice: { rule: "w-px opacity-50", label: "Notice", weight: "font-semibold" },
  contradiction: {
    rule: "w-[3px]",
    label: "Contradiction",
    weight: "font-bold",
  },
  halt: { rule: "w-[3px]", label: "Halt", weight: "font-bold" },
};

export type DriftFlagProps = {
  level?: DriftLevel;
  /** What is contradicted, in past tense with dates. Authored voice. */
  statement: React.ReactNode;
  /** What Helm noticed without being told. Set in verdigris. */
  observed?: React.ReactNode;
  /** The question a person has to answer. "What stops?" */
  question?: React.ReactNode;
  actions?: React.ReactNode;
  /**
   * A real flag announces itself, because drift arriving while you read is the
   * whole point. Set false when the flag is a *specimen* — an example on a
   * documentation or record page — so a screen reader is not told a
   * contradiction just appeared when nothing has.
   */
  announce?: boolean;
  className?: string;
};

export function DriftFlag({
  level = "contradiction",
  statement,
  observed,
  question,
  actions,
  announce = true,
  className,
}: DriftFlagProps) {
  const spec = LEVELS[level];

  return (
    <div
      role={announce ? "status" : undefined}
      aria-live={announce ? "polite" : undefined}
      className={cn(
        "flex overflow-hidden rounded-log border border-drift bg-card",
        announce && "animate-drift-in",
        className
      )}
    >
      <div aria-hidden className={cn("flex-none bg-drift", spec.rule)} />
      <div className="flex-1">
        {level === "halt" && (
          <div aria-hidden className="h-1.5 bg-drift-wash" />
        )}
        <div className="flex flex-col gap-3 p-card">
          <div className="flex items-center gap-2.5">
            {/* Never colour alone: the diamond survives greyscale. */}
            <span
              aria-hidden
              className="h-2 w-2 flex-none rotate-45 bg-drift"
            />
            <span
              className={cn("text-eyebrow uppercase text-drift", spec.weight)}
            >
              {spec.label}
            </span>
            <Icon name="bearing-off" size={18} className="ml-auto text-drift" />
          </div>
          <p className="max-w-prose font-serif text-[19px] leading-[1.4] text-foreground">
            {statement}
          </p>
          {observed && <Observed className="text-help">{observed}</Observed>}
          {question && (
            <p className="text-body font-semibold text-foreground">
              {question}
            </p>
          )}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * Institutional memory: how something changed, and who noticed. Date column in
 * mono, glyph column, prose column. Observed entries in verdigris.
 */
export type TimelineEntry = {
  date: string;
  glyph?: React.ComponentProps<typeof Icon>["name"];
  title: React.ReactNode;
  detail?: React.ReactNode;
  /** Helm noticed it; nobody declared it. */
  observed?: boolean;
};

export function OutcomeTimeline({
  entries,
  className,
}: {
  entries: ReadonlyArray<TimelineEntry>;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {entries.map((entry, i) => (
        <li
          key={`${entry.date}-${i}`}
          className={cn(
            "grid grid-cols-[4.5rem_1.25rem_minmax(0,1fr)] items-baseline gap-4 py-4",
            i > 0 && "border-t border-border"
          )}
        >
          <span className="font-mono text-[12px] text-subtle-foreground">
            {entry.date}
          </span>
          <span className="flex justify-center">
            {entry.glyph && (
              <Icon
                name={entry.glyph}
                size={15}
                className={
                  entry.observed ? "text-sea" : "text-muted-foreground"
                }
              />
            )}
          </span>
          <div className="flex flex-col gap-1">
            {entry.observed ? (
              <Observed className="text-control">{entry.title}</Observed>
            ) : (
              <span className="text-control text-foreground">
                {entry.title}
              </span>
            )}
            {entry.detail && (
              <span className="max-w-prose text-help text-muted-foreground">
                {entry.detail}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
