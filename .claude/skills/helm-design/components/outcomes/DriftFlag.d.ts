import * as React from "react";

/**
 * The one place brass is permitted. Three severities, carried by rule weight
 * and the verb in the sentence — never by a second hue, a dot or a score.
 * Renders in an aria-live="polite" region.
 */
export interface DriftFlagProps {
  /** notice (1px hairline) · contradiction (3px rule) · halt (3px rule + wash band) */
  level?: "notice" | "contradiction" | "halt";
  /** Past tense, dated, factual: "Work started 21 Feb contradicts what this quarter anchored on 14 Jan." */
  statement: React.ReactNode;
  /** The evidence Helm observed — verdigris with the hollow ring. */
  observed?: string;
  /** Present tense, for a person: "What stops?" — required at halt. */
  question?: string;
  actions?: React.ReactNode;
}

export declare function DriftFlag(props: DriftFlagProps): JSX.Element;
