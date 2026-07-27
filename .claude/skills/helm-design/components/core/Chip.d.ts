import * as React from "react";

/**
 * Pill for a fact — quarter, owner, role, team. Never a status: status is the
 * card's left rule, and severity is brass.
 */
export interface ChipProps {
  label?: string;
  children?: React.ReactNode;
  /** `observed` adds the verdigris wash and the hollow ring. */
  variant?: "solid" | "outline" | "observed";
  /** Renders a remove affordance. */
  onRemove?: () => void;
  style?: React.CSSProperties;
}

/**
 * An observed string — anything Helm noticed rather than a person authored.
 * Counts, inferences, freshness. Never a state, never a severity.
 */
export interface ObservedProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function Chip(props: ChipProps): JSX.Element;
export declare function Observed(props: ObservedProps): JSX.Element;
