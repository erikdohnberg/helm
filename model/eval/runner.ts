/**
 * Replay runner: runs a detector through a scenario day by day, in date order.
 *
 * The detector is handed only the signals for the current day; future days are
 * never passed and are therefore structurally unreachable. State persists
 * across days within a run and resets between runs.
 */
import type { Detector } from "./detector.ts";
import type { LoadedScenario } from "./loader.ts";
import type { DriftEvent, Signal } from "../contracts/index.ts";

export interface EmittedFlag {
  /** The day the detector emitted this event, "YYYY-MM-DD". */
  emitted_on: string;
  event: DriftEvent;
}

export interface ScenarioReplay {
  scenario_id: string;
  emitted: EmittedFlag[];
  days_processed: number;
  signals_total: number;
}

const dayOf = (s: Signal) => s.occurred_at.slice(0, 10);

export function replayScenario<S>(loaded: LoadedScenario, detector: Detector<S>): ScenarioReplay {
  const { charter, signals } = loaded;

  // Bucket signals by day, then process days in ascending order.
  const byDay = new Map<string, Signal[]>();
  for (const s of signals) {
    const day = dayOf(s);
    const bucket = byDay.get(day);
    if (bucket) bucket.push(s);
    else byDay.set(day, [s]);
  }
  const days = [...byDay.keys()].sort();

  let state = detector.initialState([charter]);
  const emitted: EmittedFlag[] = [];

  for (const day of days) {
    // Pass ONLY this day's signals, frozen so a detector can neither mutate the
    // runner's data nor stash a live reference to future-day arrays. There is no
    // handle to any other day here — future leakage is impossible by construction.
    const daySignals = Object.freeze(byDay.get(day)!.map((s) => Object.freeze({ ...s })));
    const result = detector.observe({ date: day, charters: [charter], daySignals, state });
    state = result.state;
    for (const event of result.events) emitted.push({ emitted_on: day, event });
  }

  return {
    scenario_id: loaded.scenario.id,
    emitted,
    days_processed: days.length,
    signals_total: signals.length,
  };
}
