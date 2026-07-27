import * as React from "react";

import { cn } from "@/lib/utils";
import { Observed } from "@/components/ui/chip";

/**
 * Compact-density record table. Header in sunken, 1px row rules, mono
 * identifiers. Compact is permitted for settings tables and nothing else —
 * charter, drift and record surfaces stay editorial.
 *
 * There is no status dot in a table cell. State lives at the card edge.
 */
export type TableColumn<Row> = {
  key: keyof Row & string;
  label: React.ReactNode;
  align?: "left" | "right" | "center";
  /** Identifiers are set in mono and read as data, not prose. */
  mono?: boolean;
  /** Observed by Helm rather than authored by a person. */
  observed?: boolean;
};

export type TableProps<Row> = {
  columns: ReadonlyArray<TableColumn<Row>>;
  rows: ReadonlyArray<Row>;
  /** Announced to assistive tech; visually hidden. */
  caption?: string;
  className?: string;
};

export function Table<Row extends Record<string, React.ReactNode>>({
  columns,
  rows,
  caption,
  className,
}: TableProps<Row>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-log border border-border bg-card",
        className
      )}
    >
      <table className="w-full border-collapse text-left">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="bg-sunken">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "border-b border-border px-5 py-3 text-eyebrow uppercase tracking-[0.1em] text-subtle-foreground",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center"
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => {
                const value = row[c.key];
                const empty = value == null || value === "";
                return (
                  <td
                    key={c.key}
                    className={cn(
                      "px-5 py-3.5 text-control align-middle",
                      i === rows.length - 1 ? "" : "border-b border-border",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      c.mono && "font-mono text-muted-foreground"
                    )}
                  >
                    {empty ? (
                      <span className="text-subtle-foreground">—</span>
                    ) : c.observed ? (
                      <Observed>{value}</Observed>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Avatar({
  initials,
  size = 32,
  className,
}: {
  initials: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex flex-none items-center justify-center rounded-full bg-ink-200 font-bold text-ink-700",
        size <= 24 ? "text-[10px]" : "text-[12px]",
        className
      )}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({
  people,
  overflow,
}: {
  people: ReadonlyArray<string>;
  overflow?: number;
}) {
  return (
    <div className="flex">
      {people.map((p, i) => (
        <span
          key={`${p}-${i}`}
          className={cn(
            "inline-flex rounded-full shadow-[0_0_0_2px_var(--background)]",
            i > 0 && "-ml-[9px]"
          )}
        >
          <Avatar initials={p} />
        </span>
      ))}
      {overflow ? (
        <span className="-ml-[9px] inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-sunken text-[11px] font-semibold text-subtle-foreground shadow-[0_0_0_2px_var(--background)]">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-[5px] border border-b-2 border-border-strong bg-card px-1.5 py-0.5 font-mono text-[11px] text-foreground">
      {children}
    </kbd>
  );
}

export function Skeleton({
  width = "100%",
  height = 10,
  shimmer = false,
  className,
}: {
  width?: string | number;
  height?: number;
  shimmer?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        backgroundSize: shimmer ? "440px 100%" : undefined,
      }}
      className={cn(
        height > 14 ? "rounded-inner" : "rounded-[3px]",
        shimmer
          ? "animate-shimmer bg-[linear-gradient(90deg,var(--sunken)_0,var(--ink-100)_50%,var(--sunken)_100%)]"
          : "bg-sunken",
        className
      )}
    />
  );
}

/** "Reading the record…" — loading is stated, never spun. */
export function LoadingRecord({ label = "Reading the record…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-3 rounded-log border border-border bg-card p-card"
    >
      <span className="sr-only">{label}</span>
      <Skeleton width="42%" height={16} shimmer />
      <Skeleton width="88%" shimmer />
      <Skeleton width="64%" shimmer />
      <p aria-hidden className="pt-1 text-help text-subtle-foreground">
        {label}
      </p>
    </div>
  );
}

/**
 * States why the emptiness is meaningful, then offers the one action. "A
 * quarter with no anchored outcome has no direction to drift from" is a fact;
 * "No data" is not.
 */
export function EmptyState({
  title,
  children,
  observed,
  action,
  className,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  observed?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-log border border-dashed border-border-strong px-6 py-9 text-center",
        className
      )}
    >
      <div className="font-serif text-[19px] text-foreground">{title}</div>
      {children && (
        <div className="max-w-[34ch] text-help text-muted-foreground">
          {children}
        </div>
      )}
      {observed && (
        <Observed className="text-[12.5px]">{observed}</Observed>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
