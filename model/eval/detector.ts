/**
 * Detector interface and the NullDetector baseline.
 *
 * A detector sees the charter set and ONE day of signals at a time, plus its
 * own persisted state, and returns zero or more DriftEvents. It never receives
 * future signals — the replay runner enforces that structurally. State the
 * detector returns is handed back to it on the next day within the same run.
 */
import type { Charter, DriftEvent, Signal } from "../contracts/index.ts";

export interface DayInput<S> {
  /** The day being processed, "YYYY-MM-DD". */
  date: string;
  charters: Charter[];
  /** Only the signals that occurred on `date`. */
  daySignals: readonly Signal[];
  /** State this detector returned on the previous day (or initialState on day 1). */
  state: S;
}

export interface DetectorResult<S> {
  events: DriftEvent[];
  state: S;
}

export interface Detector<S = unknown> {
  name: string;
  version: string;
  /** Fresh per-run state, given the run's charters. */
  initialState(charters: Charter[]): S;
  observe(input: DayInput<S>): DetectorResult<S>;
}

/**
 * The trivial baseline: never flags. Proves the harness plumbing end to end and
 * anchors the floor of the scorecard (0 recall, 0 false positives). Every real
 * pipeline version must beat the v0 inactivity baseline; this sits below even
 * that.
 */
export const NullDetector: Detector<null> = {
  name: "null-detector",
  version: "1.0.0",
  initialState: () => null,
  observe: () => ({ events: [], state: null }),
};
