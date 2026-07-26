/**
 * Stage 4 — State update (spec §6). Deterministic aggregation, no LLM.
 *
 * Folds each day's Stage 2/3 evidence into rolling per-charter state so that
 * "yesterday was quiet" becomes distinguishable from "this has been dying for
 * three weeks" (spec §6). Stage 5 reads this state; it never re-reads raw
 * signals. Everything here is a pure function of the evidence stream in date
 * order — no future day is visible when folding day D.
 */
import type { DailyEvidence } from "./daily-evidence.ts";

/** Enough of a signal to cite it in a DriftEvent, indexed by scenario_signal_id. */
export interface SignalRef {
  signal_id: string; // the contract Signal.id (globally unique), for evidence citations
  content: string;
  source: string; // original source string (e.g. "doc:google")
  occurred_at: string;
  is_doc: boolean; // published-artifact source — the "declared" signature (spec §3)
}

export type SignalIndex = Map<string, SignalRef>; // key: scenario_signal_id

export interface LedgerEntry {
  date: string;
  scenario_signal_id: string;
  type: string; // Stage 3 evidence type
  quote: string;
  contradicts_claim: string | null;
  competing_topic: string | null;
  ref: SignalRef;
}

export interface CompetingTopicStat {
  topic: string;
  first_seen: string;
  days: Set<string>;
  count: number;
  /** true if any occurrence was on a published-document source (declared, not behavioral). */
  seen_on_doc: boolean;
}

export interface CharterState {
  charter_id: string;
  anchored_at: string;
  first_observed_day: string | null;
  last_observed_day: string | null;
  last_relevant_day: string | null;
  /**
   * Last day carrying evidence of *work on* the outcome (progress / decision /
   * metric_reference) — as opposed to merely being about it.
   *
   * This is the separation BASELINE.md called for from scn-006: "last message
   * containing 'migration' was Aug 8" is topically relevant while being evidence
   * of the outcome's *absence*. A relevance-only clock counts that as activity
   * and never sees the silence; the activity clock does not.
   */
  last_active_day: string | null;
  /** Last day the success metric was actually referenced (spec §3: metric mention rate). */
  last_metric_day: string | null;
  /** Per observed day: how many of that day's signals mapped relevant. */
  per_day_relevant: Array<{ date: string; count: number }>;
  ledger: LedgerEntry[];
  competing: Map<string, CompetingTopicStat>;
  contradictions: LedgerEntry[];
  /**
   * Most recent signal seen at all (relevant or not). An attention-decay flag is
   * about an *absence*, so its ledger can be empty — this guarantees every event
   * can still cite a real span (hard rule: no claim without a citation).
   */
  last_seen_ref: SignalRef | null;
  /** Latched once Stage 5 has emitted for this charter (one flag per charter). */
  emitted: boolean;
}

/** Evidence that the outcome is being *worked on*, not merely discussed. */
const ACTIVITY_EVIDENCE = new Set(["progress", "decision", "metric_reference"]);

const SUBSTANTIVE_DRIFT_EVIDENCE = new Set([
  "blocker",
  "decision",
  "deprioritization_cue",
  "contradiction",
  "competing_priority",
]);

export function isSubstantive(type: string): boolean {
  return SUBSTANTIVE_DRIFT_EVIDENCE.has(type);
}

export function initCharterState(charterId: string, anchoredAt: string): CharterState {
  return {
    charter_id: charterId,
    anchored_at: anchoredAt,
    first_observed_day: null,
    last_observed_day: null,
    last_relevant_day: null,
    last_active_day: null,
    last_metric_day: null,
    per_day_relevant: [],
    ledger: [],
    competing: new Map(),
    contradictions: [],
    last_seen_ref: null,
    emitted: false,
  };
}

/**
 * Fold one day of evidence into the state. Returns the same (mutated) state for
 * convenience; the runner threads it day to day.
 */
export function foldDay(
  state: CharterState,
  day: DailyEvidence,
  index: SignalIndex
): CharterState {
  if (state.first_observed_day === null) state.first_observed_day = day.date;
  state.last_observed_day = day.date;

  const relevantCount = day.relevantSignalIds.length;
  state.per_day_relevant.push({ date: day.date, count: relevantCount });
  if (relevantCount > 0) state.last_relevant_day = day.date;

  // Track the latest signal seen at all — the fallback citation for absence-based
  // events. Stage 2 maps every one of the day's signals, so its output enumerates
  // them in input order.
  for (const m of day.mappings) {
    const ref = index.get(m.signal_id);
    if (ref) state.last_seen_ref = ref;
  }

  for (const se of day.extractions) {
    const ref = index.get(se.signal_id);
    if (!ref) continue; // extraction for a signal not in this scenario — skip defensively
    for (const ex of se.extractions) {
      const entry: LedgerEntry = {
        date: day.date,
        scenario_signal_id: se.signal_id,
        type: ex.type,
        quote: ex.quote,
        contradicts_claim: ex.contradicts_claim ?? null,
        competing_topic: ex.competing_topic ?? null,
        ref,
      };
      state.ledger.push(entry);

      if (ACTIVITY_EVIDENCE.has(ex.type)) state.last_active_day = day.date;
      if (ex.type === "metric_reference") state.last_metric_day = day.date;

      if (ex.type === "contradiction" && entry.contradicts_claim) {
        state.contradictions.push(entry);
      }

      if (ex.competing_topic) {
        const key = ex.competing_topic.trim().toLowerCase();
        const stat = state.competing.get(key) ?? {
          topic: ex.competing_topic,
          first_seen: day.date,
          days: new Set<string>(),
          count: 0,
          seen_on_doc: false,
        };
        stat.days.add(day.date);
        stat.count += 1;
        if (ref.is_doc) stat.seen_on_doc = true;
        state.competing.set(key, stat);
      }
    }
  }

  return state;
}
