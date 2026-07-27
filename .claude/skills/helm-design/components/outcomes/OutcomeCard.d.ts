import * as React from "react";

/**
 * The Outcome Charter row — the central object of Helm. Status is carried by
 * the left rule and the instrument glyph, never by colour.
 */
export interface OutcomeCardProps {
  /** anchored (solid rule) · additive (38% partial) · replaced (dotted, dimmed) · drift (brass) */
  state?: "anchored" | "additive" | "replaced" | "drift";
  title: string;
  /** e.g. "FY26 Q1" — set in mono verdigris beside the state label. */
  quarter?: string;
  /** Title of the outcome this one displaced. */
  replaces?: string;
  /** One observed line — rendered in verdigris with the hollow ring. */
  observed?: string;
  /** Metric / target / owner cells. Set `observed` on anything Helm derived. */
  facts?: Array<{ label: string; value: React.ReactNode; observed?: boolean }>;
  /** Why it was replaced or retired. Never render a replaced card without them. */
  reasons?: string[];
  actions?: React.ReactNode;
  /** `OutcomeLink`s. */
  links?: React.ReactNode;
  /** Attached work: no rule at all, indented 2.125rem. */
  attached?: boolean;
  children?: React.ReactNode;
}

export interface OutcomeLinkProps {
  children?: React.ReactNode;
  href?: string;
}

export declare function OutcomeCard(props: OutcomeCardProps): JSX.Element;
export declare function OutcomeLink(props: OutcomeLinkProps): JSX.Element;
