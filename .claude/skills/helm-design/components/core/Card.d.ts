import * as React from "react";

/**
 * The record surface. Flat by default — nothing in the record floats. Its
 * `state` prop draws the left-edge stroke that names an outcome's standing
 * without using colour.
 */
export interface CardProps {
  children?: React.ReactNode;
  /** e0 part of the record · e1 actionable · e2 transient · e3 requires a decision */
  elevation?: "e0" | "e1" | "e2" | "e3";
  /** Left-rule state vocabulary. Omit for a plain surface. */
  state?: "anchored" | "additive" | "replaced" | "attached" | "drift";
  /** `compact` is permitted for settings tables only. */
  density?: "editorial" | "compact";
  /** `log` = 2px radius (record surfaces) · `app` = 8px radius. */
  surface?: "log" | "app";
  style?: React.CSSProperties;
}

export interface EyebrowProps {
  children?: React.ReactNode;
  /** `sea` marks an observed/meta kicker; `muted` and `ink` are plain labels. */
  tone?: "sea" | "muted" | "ink";
  style?: React.CSSProperties;
}

export interface RecordTitleProps {
  children?: React.ReactNode;
  level?: "display" | "heading" | "page" | "lede" | "outcome";
  style?: React.CSSProperties;
}

export declare function Card(props: CardProps): JSX.Element;
export declare function Eyebrow(props: EyebrowProps): JSX.Element;
export declare function RecordTitle(props: RecordTitleProps): JSX.Element;
