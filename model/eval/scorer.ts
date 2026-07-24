/**
 * Scorer: turns a detector's emitted flags + a scenario's ground truth into a
 * per-scenario score, and aggregates the set into a scorecard (spec §8.2).
 */
import { CONTRACTS_VERSION } from "../contracts/index.ts";
import type { Detector } from "./detector.ts";
import type { EmittedFlag } from "./runner.ts";

export type Classification =
  | "premature" // flagged before earliest_reasonable_flag_signal
  | "on_time" // flagged between earliest and human realization (inclusive)
  | "late" // flagged after human realization
  | "missed" // drift scenario, never flagged
  | "control_clean" // control scenario, correctly not flagged
  | "control_false_positive"; // control scenario, wrongly flagged

export interface ScenarioScore {
  scenario_id: string;
  label: string;
  is_control: boolean;
  expected_drift_type: string;
  should_flag: boolean;
  flagged: boolean;
  num_events: number;
  first_flag_date: string | null;
  earliest_date: string | null;
  realization_date: string | null;
  classification: Classification;
  /** Days between the first flag and human realization; positive = ahead of humans. */
  lead_time_days: number | null;
  type_match: boolean | null;
  routing: { expected: string[]; covered: string[]; coverage: number | null };
  /** scn-008-style: a control flag after the decision was recorded (a hard failure). */
  control_hard_failure: boolean;
}

const MS_PER_DAY = 86_400_000;
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / MS_PER_DAY);

function signalDate(scn: any, signalId: string | null): string | null {
  if (!signalId) return null;
  const sig = scn.signal_timeline.find((s: any) => s.signal_id === signalId);
  return sig ? sig.date : null;
}

/**
 * The scenario's structured routing target: the actor ids named in
 * ground_truth.expected_recipients (derived from who_needed_to_hear_the_flag).
 * Empty for controls.
 */
function expectedRecipients(scn: any): string[] {
  return (scn.ground_truth?.expected_recipients ?? []).map((r: any) => r.actor_id);
}

export function scoreScenario(scn: any, emitted: EmittedFlag[]): ScenarioScore {
  const gt = scn.ground_truth;
  const isControl = gt.is_drift === false;
  const flagged = emitted.length > 0;
  const flagDates = emitted.map((e) => e.emitted_on).sort();
  const firstFlagDate = flagDates.length ? flagDates[0] : null;

  const earliestDate = signalDate(scn, gt.earliest_reasonable_flag_signal);
  const realizationDate = scn.human_realization?.first_noticed_date ?? null;

  let classification: Classification;
  let control_hard_failure = false;
  let lead_time_days: number | null = null;
  let type_match: boolean | null = null;
  let routing: ScenarioScore["routing"] = { expected: [], covered: [], coverage: null };

  if (isControl) {
    classification = flagged ? "control_false_positive" : "control_clean";
    // Deliberate-replacement control: once the decision is recorded, any flag is
    // a hard failure (scn-008 grader notes). The recorded decision is the last
    // document_revision ("doc:") signal in the timeline.
    if (gt.control_kind === "deliberate_replacement" && flagged) {
      const docDates = scn.signal_timeline
        .filter((s: any) => s.source.startsWith("doc:"))
        .map((s: any) => s.date)
        .sort();
      const recordedDecision = docDates.length ? docDates[docDates.length - 1] : null;
      control_hard_failure = recordedDecision ? flagDates.some((d) => d > recordedDecision) : false;
    }
  } else if (!flagged) {
    classification = "missed";
  } else {
    if (earliestDate && firstFlagDate! < earliestDate) classification = "premature";
    else if (realizationDate && firstFlagDate! > realizationDate) classification = "late";
    // A flag dated exactly on human realization scores on_time with lead 0. It's
    // within the window, but a detector that merely ties the humans has delivered
    // no early warning — recall counts it, median lead time is what exposes it.
    // Don't "fix" this boundary silently, and never read recall without lead time.
    else classification = "on_time";

    if (realizationDate && firstFlagDate) lead_time_days = daysBetween(firstFlagDate, realizationDate);

    const firstEvent = emitted.find((e) => e.emitted_on === firstFlagDate)!.event;
    type_match = firstEvent.drift_type === gt.drift_type;

    const expected = expectedRecipients(scn);
    const routed = new Set(
      emitted.flatMap((e) => e.event.suggested_recipients.map((r) => r.actor_id))
    );
    const covered = expected.filter((a) => routed.has(a));
    routing = { expected, covered, coverage: expected.length ? covered.length / expected.length : null };
  }

  return {
    scenario_id: scn.id,
    label: scn.label,
    is_control: isControl,
    expected_drift_type: gt.drift_type,
    should_flag: gt.should_flag,
    flagged,
    num_events: emitted.length,
    first_flag_date: firstFlagDate,
    earliest_date: earliestDate,
    realization_date: realizationDate,
    classification,
    lead_time_days,
    type_match,
    routing,
    control_hard_failure,
  };
}

export interface Scorecard {
  detector: { name: string; version: string };
  contracts_version: string;
  run_date: string;
  totals: { scenarios: number; drift_scenarios: number; control_scenarios: number };
  metrics: {
    detection_recall: number; // flagged drift / drift scenarios
    precision_proxy: number | null; // (on_time + late) / (on_time + late + premature + control FPs)
    median_lead_time_days: number | null;
    control_false_positive_count: number;
    control_hard_failures: number;
    type_accuracy: number | null; // flagged drift with matching type / flagged drift
    routing_coverage: number | null; // mean routing coverage over flagged drift
  };
  timing_breakdown: { premature: number; on_time: number; late: number; missed: number };
  per_scenario: ScenarioScore[];
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function buildScorecard(
  detector: Pick<Detector, "name" | "version">,
  scores: ScenarioScore[],
  runDate: string
): Scorecard {
  const drift = scores.filter((s) => !s.is_control);
  const controls = scores.filter((s) => s.is_control);
  const flaggedDrift = drift.filter((s) => s.flagged);

  const count = (c: Classification) => scores.filter((s) => s.classification === c).length;
  const onTime = count("on_time");
  const late = count("late");
  const premature = count("premature");
  const controlFPs = count("control_false_positive");

  const goodFlags = onTime + late;
  const allFlags = goodFlags + premature + controlFPs;
  const typedDrift = flaggedDrift.filter((s) => s.type_match === true).length;
  const routings = flaggedDrift.map((s) => s.routing.coverage).filter((c): c is number => c !== null);

  return {
    detector: { name: detector.name, version: detector.version },
    contracts_version: CONTRACTS_VERSION,
    run_date: runDate,
    totals: {
      scenarios: scores.length,
      drift_scenarios: drift.length,
      control_scenarios: controls.length,
    },
    metrics: {
      detection_recall: drift.length ? flaggedDrift.length / drift.length : 0,
      precision_proxy: allFlags ? goodFlags / allFlags : null,
      median_lead_time_days: median(flaggedDrift.map((s) => s.lead_time_days).filter((x): x is number => x !== null)),
      control_false_positive_count: controlFPs,
      control_hard_failures: scores.filter((s) => s.control_hard_failure).length,
      type_accuracy: flaggedDrift.length ? typedDrift / flaggedDrift.length : null,
      routing_coverage: routings.length ? routings.reduce((a, b) => a + b, 0) / routings.length : null,
    },
    timing_breakdown: { premature, on_time: onTime, late, missed: count("missed") },
    per_scenario: scores,
  };
}
