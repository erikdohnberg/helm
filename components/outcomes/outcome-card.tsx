import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/ui/icon";
import { Observed } from "@/components/ui/chip";

/**
 * The Outcome Charter — the core artifact in Helm.
 *
 * Five states have to be distinguishable at a glance, in both modes, without
 * red/amber/green, dots or meters. The carrier is a 3px left rule whose
 * treatment names the state, plus an instrument glyph. Position and typography
 * do the rest, so every state reads correctly in greyscale.
 *
 * | state      | rule                     | glyph       |
 * | ---------- | ------------------------ | ----------- |
 * | `anchored` | solid, full height       | anchor      |
 * | `additive` | partial — 38%, top-aligned | half-mast |
 * | `replaced` | dotted, content at 72%   | strike      |
 * | `attached` | none — indent instead    | shackle     |
 * | `drift`    | solid brass              | bearing off |
 *
 * `attached` earns no edge mark because attachment adds no commitment:
 * nesting is the semantics.
 */
export type OutcomeState =
  | "anchored"
  | "additive"
  | "replaced"
  | "attached"
  | "drift";

type StateSpec = {
  rule: string;
  glyph: IconName | null;
  label: string;
};

const STATE: Record<Exclude<OutcomeState, "attached">, StateSpec> = {
  anchored: { rule: "bg-foreground", glyph: "anchor", label: "Anchored" },
  additive: {
    rule: "bg-[linear-gradient(to_bottom,var(--ink-400)_0_38%,transparent_38%_100%)]",
    glyph: "half-mast",
    label: "Additive",
  },
  replaced: {
    rule: "bg-[repeating-linear-gradient(to_bottom,var(--ink-300)_0_3px,transparent_3px_7px)]",
    glyph: null,
    label: "Replaced",
  },
  drift: { rule: "bg-drift", glyph: "bearing-off", label: "Bearing off" },
};

export type OutcomeFact = {
  label: string;
  value: React.ReactNode;
  /** Derived by Helm from attached work rather than typed by a person. */
  observed?: boolean;
};

export type OutcomeCardProps = {
  state?: OutcomeState;
  title: React.ReactNode;
  /** The quarter this outcome stands in. A fact, so it reads as a chip-like label. */
  quarter?: React.ReactNode;
  /** Named successor or predecessor, written as a sentence fragment. */
  replaces?: React.ReactNode;
  /** An observed line — counts, freshness, inferences. */
  observed?: React.ReactNode;
  facts?: ReadonlyArray<OutcomeFact>;
  /** Reasoning and trade-offs. Authored, so it stays in navy. */
  reasons?: ReadonlyArray<React.ReactNode>;
  actions?: React.ReactNode;
  links?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

function StateLine({
  state,
  quarter,
}: {
  state: Exclude<OutcomeState, "attached">;
  quarter?: React.ReactNode;
}) {
  const spec = STATE[state];
  const drift = state === "drift";
  const replaced = state === "replaced";
  const tone = drift
    ? "text-drift"
    : replaced
      ? "text-muted-foreground"
      : "text-foreground";

  return (
    <div className="flex items-center gap-2">
      {spec.glyph ? (
        <Icon name={spec.glyph} size={15} className={tone} strokeWidth={1.7} />
      ) : (
        /* The strike — traded away, never deleted. */
        <span aria-hidden className="h-[1.5px] w-[7px] flex-none bg-ink-500" />
      )}
      <span
        className={cn(
          "text-eyebrow uppercase",
          drift ? "font-bold" : "font-semibold",
          tone
        )}
      >
        {spec.label}
      </span>
      {quarter && (
        <>
          <span aria-hidden className="text-border-strong">
            ·
          </span>
          <span className="font-mono text-rail uppercase text-sea">
            {quarter}
          </span>
        </>
      )}
    </div>
  );
}

export function OutcomeCard({
  state = "anchored",
  title,
  quarter,
  replaces,
  observed,
  facts,
  reasons,
  actions,
  links,
  children,
  className,
}: OutcomeCardProps) {
  const attached = state === "attached";
  const dim = state === "replaced";
  const drift = state === "drift";

  return (
    <li
      className={cn(
        "flex list-none overflow-hidden rounded-log border bg-card",
        drift ? "border-drift" : "border-border",
        attached && "ml-[2.125rem]",
        className
      )}
    >
      {!attached && (
        <div
          aria-hidden
          className={cn(
            "w-[3px] flex-none",
            STATE[state as Exclude<OutcomeState, "attached">].rule
          )}
        />
      )}
      <div
        className={cn(
          "flex flex-1 flex-col gap-4 p-card",
          dim && "opacity-[0.72]"
        )}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2.5">
            {attached ? (
              <div className="flex items-center gap-2">
                <Icon
                  name="shackle"
                  size={15}
                  className="text-sea"
                  strokeWidth={1.7}
                />
                <span className="font-mono text-rail uppercase text-sea">
                  Attached · adds no commitment
                </span>
              </div>
            ) : (
              <StateLine
                state={state as Exclude<OutcomeState, "attached">}
                quarter={quarter}
              />
            )}
            <h3
              className={cn(
                "max-w-[32ch] font-serif text-outcome text-foreground",
                dim && "line-through decoration-ink-400 decoration-1"
              )}
            >
              {title}
            </h3>
            {replaces && (
              <p className="text-help text-muted-foreground">
                Replaces {replaces}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-none items-center gap-2">{actions}</div>
          )}
        </div>

        {facts && facts.length > 0 && (
          <dl className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-px overflow-hidden rounded-inner border border-border bg-border">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col gap-1 bg-card p-4">
                <dt className="text-rail font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
                  {f.label}
                </dt>
                <dd className="text-control">
                  {f.observed ? <Observed>{f.value}</Observed> : f.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {reasons && reasons.length > 0 && (
          <ul className="flex max-w-prose list-disc flex-col gap-1 pl-[18px] text-help text-muted-foreground">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}

        {observed && <Observed className="text-help">{observed}</Observed>}
        {children}
        {links && <div className="flex flex-wrap gap-4">{links}</div>}
      </div>
    </li>
  );
}
