// Shared TypeScript types — export project types from this module.

// --- Enums (string literal unions) ---

export type OutcomeStatus =
  | "Draft"
  | "AwaitingAlignment"
  | "InDevelopment"
  | "Anchored"
  | "Inactive";

export type EntryMode = "Attach" | "Replace" | "Additive";

export type SourceType =
  | "Meeting"
  | "Discussion"
  | "LeadershipInput";

// --- Domain types ---

export interface Quarter {
  id: string;
  label: string;
  year: number;
  startDate: string;
  endDate: string;
  narrativeSummary: string | null;
  hasStarted: boolean;
}

export interface Outcome {
  id: string;
  title: string;
  quarterId: string;
  context: string;
  metric: string;
  target: string;
  timeframe: string;
  decisionBullets: string[];
  googleDocUrl: string | null;
  slackThreadUrl: string | null;
  status: OutcomeStatus;
  outcomeOwner: string;
  decisionOwner: string;
  entryMode: EntryMode;
  sourceType: SourceType;
  reprioritizedFromQuarterLabel: string | null;
  replacedOutcomeId: string | null;
  replacedByOutcomeId: string | null;
  attachedToOutcomeId: string | null;
  focusWarning: string | null;
  noLongerPrioritizedReasonBullets: string[];
  originallyAnchoredLabel: string | null;
  lastActivityDate: string | null;
}

export interface MeetingLink {
  id: string;
  url: string;
  label?: string;
  outcomeId: string;
}

export interface TeamFunction {
  id: string;
  function: string;
  director: string;
  slackId: string;
}
