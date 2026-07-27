import * as React from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Facts only — quarter, owner, role, source. Never state and never severity.
 *
 * A chip puts its content in the content column, competing with the outcome's
 * own words. State therefore lives in the card's left rule, where it is
 * readable while scanning and invisible while reading; drift lives in brass.
 */
export type ChipVariant = "solid" | "outline" | "observed";

const VARIANTS: Record<ChipVariant, string> = {
  solid: "border-transparent bg-sunken text-muted-foreground",
  outline: "border-border bg-transparent text-muted-foreground",
  observed: "border-transparent bg-sea-wash font-semibold text-sea",
};

export type ChipProps = {
  label?: string;
  variant?: ChipVariant;
  /** Renders a dismiss affordance. Never used to resolve drift. */
  onRemove?: () => void;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
    children?: React.ReactNode;
  };

export function Chip({
  label,
  children,
  variant = "solid",
  onRemove,
  className,
  ...props
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-[11px] py-1 text-[12.5px]",
        VARIANTS[variant],
        onRemove && "pr-1.5",
        className
      )}
      {...props}
    >
      {variant === "observed" && <ObservedRing />}
      {children ?? label}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label ?? "item"}`}
          onClick={onRemove}
          className="inline-flex text-current"
        >
          <Icon name="close" size={12} strokeWidth={2} />
        </button>
      )}
    </span>
  );
}

/**
 * The 7px hollow ring. Every observed string carries one — it is the only
 * affordance that fits in a dense list, and greyscale must stay legible.
 */
export function ObservedRing({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-[7px] w-[7px] flex-none -translate-y-px rounded-full border-[1.5px] border-current",
        className
      )}
    />
  );
}

/**
 * Attribution. Verdigris marks what Helm observed; navy ink marks what a
 * person said — the difference between a record and a report.
 *
 * Counts, inferences, freshness, detection metadata. Never a state, never a
 * severity, and never inside an authored sentence. A person who edits an
 * observed value promotes it to navy permanently.
 */
export type ObservedProps = React.HTMLAttributes<HTMLSpanElement>;

export function Observed({ className, children, ...props }: ObservedProps) {
  return (
    <span
      className={cn("inline-flex items-baseline gap-[7px] text-sea", className)}
      {...props}
    >
      <ObservedRing />
      <span>{children}</span>
    </span>
  );
}
