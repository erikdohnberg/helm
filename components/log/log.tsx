import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The log surface.
 *
 * The marketing site is not a second design language — it is the record, set
 * at reading scale. A ruled margin rail carries numbered entries, hairline
 * rows replace cards, and one full-bleed brass moment per page holds the
 * question the product exists to ask. The same surface serves the quarterly
 * record and a printed board pack.
 *
 * Load-bearing: the rail and the 2px radius. Drop either and this reverts to a
 * conventional marketing page — the ruled document is the whole argument that
 * Helm is a record rather than a dashboard.
 */
export function LogPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("log-surface bg-background text-foreground", className)}>
      <div className="mx-auto max-w-page px-6 md:px-10">{children}</div>
    </div>
  );
}

/**
 * A numbered entry. The rail carries a mono entry number and a 46px tick —
 * brass when the entry is load-bearing, border-strong when it is supporting.
 * Content sits 32px in from the rail. The rail never holds prose.
 *
 * Below `md` the rail folds above the content rather than stealing the
 * measure; the number and tick stay, so the document still reads as ruled.
 */
export function LogEntry({
  number,
  loadBearing = false,
  children,
  className,
}: {
  /** Two digits — `01`, `02`. Arabic numerals are reserved for entry numbers and real quantities. */
  number: string;
  loadBearing?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grid grid-cols-1 border-t border-border py-14 md:grid-cols-[var(--rail)_minmax(0,1fr)] md:py-20",
        className
      )}
    >
      <div
        aria-hidden
        className="mb-6 flex flex-row items-center gap-3 md:mb-0 md:flex-col md:gap-2.5"
      >
        <span
          className={cn(
            "font-mono text-rail uppercase",
            loadBearing ? "text-brass" : "text-subtle-foreground"
          )}
        >
          {number}
        </span>
        <span
          className={cn(
            "h-px w-10 md:h-[46px] md:w-px",
            loadBearing ? "bg-brass" : "bg-border-strong"
          )}
        />
      </div>
      <div className="flex flex-col gap-6 md:pl-rail-indent">{children}</div>
    </section>
  );
}

/** Serif at weight 300. Italic is reserved for the turn in a sentence. */
export function LogHeading({
  children,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag className={cn("font-serif text-heading text-foreground", className)}>
      {children}
    </Tag>
  );
}

export function LogDisplay({
  children,
  className,
  as: Tag = "h1",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "p";
}) {
  return (
    <Tag className={cn("font-serif text-display", className)}>{children}</Tag>
  );
}

/** Serif at reading size, used where the app would use 15px sans. */
export function LogLede({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "max-w-prose font-serif text-lede text-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}

export function RailLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono text-rail uppercase text-subtle-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Rules, not cards. A 2px navy rule opens a block; 1px hairlines separate its
 * rows. Bordered, rounded, shadowed cards belong to the app — a page of them
 * reads as software, and this reads as a document.
 */
export function LogBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t-2 border-foreground", className)}>
      {children}
    </div>
  );
}

export function LogRow({
  label,
  children,
  className,
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 border-b border-border py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6",
        className
      )}
    >
      {label && (
        <div className="font-mono text-rail uppercase text-subtle-foreground">
          {label}
        </div>
      )}
      <div className={cn("text-foreground", !label && "sm:col-span-2")}>
        {children}
      </div>
    </div>
  );
}

/**
 * A three-up band of serif figures with a 27ch caption, divided by 1px
 * verticals and opened by a 2px navy rule. Numbers only — no percentages of
 * progress; the caption does the work.
 */
export function Soundings({
  items,
  className,
}: {
  items: ReadonlyArray<{ figure: string; caption: string }>;
  className?: string;
}) {
  return (
    <div className={cn("border-t-2 border-foreground", className)}>
      <dl className="grid grid-cols-1 sm:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={item.figure + i}
            className={cn(
              "flex flex-col gap-2 py-7 sm:px-7",
              i === 0 && "sm:pl-0",
              i > 0 && "border-t border-border sm:border-l sm:border-t-0"
            )}
          >
            <dt className="font-serif text-[34px] font-light leading-none text-foreground">
              {item.figure}
            </dt>
            <dd className="max-w-[27ch] text-help text-muted-foreground">
              {item.caption}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * The brass moment. Exactly one full-bleed band per page, and it must carry
 * the question, not a feature. A second band spends the scarcity that makes
 * the first one mean something.
 */
export function BrassBand({
  question,
  children,
  className,
}: {
  question: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "bg-navy-deep py-20 text-[oklch(0.97_0.01_85)] md:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-page px-6 md:px-10">
        <div className="border-t-2 border-brass pt-10">
          <p className="font-serif text-display text-[oklch(0.97_0.01_85)]">
            {question}
          </p>
          {children && (
            <div className="mt-10 grid gap-px bg-[oklch(1_0_0_/_0.14)] sm:grid-cols-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** A cell inside the brass band: the verb, then what it costs. */
export function BrassTerm({
  verb,
  children,
}: {
  verb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 bg-navy-deep p-7">
      <div className="text-eyebrow uppercase text-brass-soft">{verb}</div>
      <div className="text-body text-[oklch(0.88_0.015_85)]">{children}</div>
    </div>
  );
}
