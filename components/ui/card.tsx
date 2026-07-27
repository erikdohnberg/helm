import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Record surface.
 *
 * `e0` — flat, border only — is the default because nothing in the record
 * floats. Elevation states intent and a surface may not borrow another
 * level's shadow for emphasis:
 *
 * - `e0` part of the record — charters, tables, timeline entries
 * - `e1` actionable object — a card you can pick up
 * - `e2` transient, dismissible — dropdowns, popovers, toasts
 * - `e3` requires a decision — dialogs only, always with a scrim
 *
 * `surface` decides the radius, and the radius is what separates a control
 * from a printed block: 8px in the app, 2px on the record.
 */
export type CardElevation = "e0" | "e1" | "e2" | "e3";
export type CardState =
  | "anchored"
  | "additive"
  | "replaced"
  | "attached"
  | "drift";
export type CardDensity = "editorial" | "compact";
export type CardSurface = "log" | "app";

const ELEVATION: Record<CardElevation, string> = {
  e0: "shadow-e0",
  e1: "shadow-e1",
  e2: "shadow-e2",
  e3: "shadow-e3",
};

/** Declared in `styles/design-system/tokens/state.css`. */
const STATE: Record<CardState, string> = {
  anchored: "state-anchored",
  additive: "state-additive",
  replaced: "state-replaced",
  attached: "state-attached",
  drift: "state-drift",
};

export type CardProps = {
  elevation?: CardElevation;
  state?: CardState;
  density?: CardDensity;
  surface?: CardSurface;
} & React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      elevation = "e0",
      state,
      density = "editorial",
      surface = "log",
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "border border-border bg-card text-foreground",
        surface === "app" ? "rounded-lg" : "rounded-log",
        density === "compact" ? "p-card-compact" : "p-card",
        ELEVATION[elevation],
        state && STATE[state],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/**
 * 11px uppercase kicker — the only uppercase in the system.
 *
 * `sea` is the default because an eyebrow most often names what Helm is
 * showing rather than what a person wrote. Use `ink` when the label is part
 * of an authored statement.
 */
export type EyebrowTone = "sea" | "muted" | "ink";

export type EyebrowProps = {
  tone?: EyebrowTone;
} & React.HTMLAttributes<HTMLDivElement>;

export function Eyebrow({ className, tone = "sea", ...props }: EyebrowProps) {
  return (
    <div
      className={cn(
        "uppercase",
        tone === "sea"
          ? "font-mono text-rail text-sea"
          : "text-eyebrow font-semibold",
        tone === "muted" && "text-subtle-foreground",
        tone === "ink" && "text-foreground",
        className
      )}
      {...props}
    />
  );
}

/**
 * Serif title. Outcome titles and page display read as statements of record —
 * that is the whole reason a serif is in the system.
 *
 * `display` and `heading` belong to log surfaces; `page` and `outcome` to the
 * app.
 */
export type RecordTitleLevel =
  | "display"
  | "heading"
  | "page"
  | "lede"
  | "outcome";

const LEVELS: Record<RecordTitleLevel, string> = {
  display: "text-display",
  heading: "text-heading",
  page: "text-page-title",
  lede: "text-lede",
  outcome: "text-outcome",
};

export type RecordTitleProps = {
  level?: RecordTitleLevel;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
} & React.HTMLAttributes<HTMLElement>;

export function RecordTitle({
  className,
  level = "outcome",
  as: Tag = "div",
  ...props
}: RecordTitleProps) {
  return (
    <Tag
      className={cn(
        "font-serif text-foreground [text-wrap:pretty]",
        LEVELS[level],
        className
      )}
      {...props}
    />
  );
}
