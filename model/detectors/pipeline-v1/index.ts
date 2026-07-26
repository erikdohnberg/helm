/**
 * pipeline-v1.0 — the full five-stage drift model, wrapped as an eval Detector.
 *
 * ── Why there is a pre-pass ────────────────────────────────────────────────
 * `Detector.observe` is synchronous by contract, and Stages 2–3 are LLM calls.
 * So the run splits in two:
 *
 *   1. ASYNC PRE-PASS (`prepareScenarios`) — for each scenario, compute the
 *      per-day Stage 2/3 evidence via `computeDailyEvidence`. Every call there
 *      sees exactly one day of signals (spec §6), so a day-D mapping cannot be
 *      coloured by a day-D+1 signal.
 *   2. SYNC FOLD (`observe`) — the replay runner walks the days in order and
 *      this detector folds day D's *precomputed* evidence through Stage 4 and
 *      scores it with Stage 5.
 *
 * **No future leakage.** The pre-pass is not "seeing the whole scenario": it is
 * a batch of independent per-day calls, each with the same inputs it would have
 * had on that day in production. `observe` then looks up only `input.date` and
 * never touches a later day's entry — the runner controls the clock, and the
 * Stage 4 state is a pure fold over days already seen. Precomputation changes
 * *when* the calls happen, not *what they can see*.
 *
 * These are the same `computeDailyEvidence` calls the component eval bills, on
 * the same (charter, signals), so this run replays them from cache at $0.
 */
import { computeDailyEvidence, type DailyEvidence } from "../../pipeline/daily-evidence.ts";
import {
  foldDay,
  initCharterState,
  type CharterState,
  type SignalIndex,
  type SignalRef,
} from "../../pipeline/stage4-state.ts";
import { scoreDrift, type CalibrationMode } from "../../pipeline/stage5-score.ts";
import type { CachedClient } from "../../pipeline/cache/client.ts";
import type { Detector } from "../../eval/detector.ts";
import type { LoadedScenario } from "../../eval/loader.ts";
import type { Charter, DriftEvent, Signal } from "../../contracts/index.ts";

/**
 * 1.1.x — Stage 5 only: the `reasoning_contradiction` branch is gated on a
 * committing decision/artifact, given the same evidentiary bar as every other
 * branch, and no longer wins by running first. Stages 1–4 and both prompts are
 * byte-identical to 1.0.0, so the whole run replays from the 1.0.0 cache.
 *
 * 1.1.1 fixes 1.1.0's gate vocabulary: 1.1.0 reused COMMITMENT_TOKEN, whose bare
 * `\d+% of` matched a statistic in an analysis doc ("44% of sub-90-day cancels")
 * and let scn-011 fire on the analysis instead of the plan. Both runs are kept —
 * results are append-only (session rule #2).
 */
export const PIPELINE_VERSION = "1.1.1";

/** One scenario's precomputed Stage 2/3 output plus the signal index Stage 4 cites through. */
export interface PreparedScenario {
  charter_id: string;
  index: SignalIndex;
  /** date -> that day's evidence. Absent for a day with no signals. */
  byDate: Map<string, DailyEvidence>;
  costUsd: number;
  cacheHits: number;
  calls: number;
}

const sidOf = (s: Signal) => String(s.metadata?.scenario_signal_id ?? s.id);

export function buildSignalIndex(signals: Signal[]): SignalIndex {
  const index: SignalIndex = new Map();
  for (const s of signals) {
    index.set(sidOf(s), {
      signal_id: s.id,
      content: s.content,
      source: String(s.metadata?.original_source ?? s.source_type),
      occurred_at: s.occurred_at,
      is_doc: s.source_type === "document_revision",
    } satisfies SignalRef);
  }
  return index;
}

/** The async pre-pass. Run once, before the (sync) harness replay. */
export async function prepareScenarios(
  client: CachedClient,
  scenarios: LoadedScenario[]
): Promise<Map<string, PreparedScenario>> {
  const prepared = new Map<string, PreparedScenario>();
  for (const loaded of scenarios) {
    const days = await computeDailyEvidence(client, loaded.charter, loaded.signals);
    prepared.set(loaded.charter.id, {
      charter_id: loaded.charter.id,
      index: buildSignalIndex(loaded.signals),
      byDate: new Map(days.map((d) => [d.date, d])),
      costUsd: days.reduce((a, d) => a + d.costUsd, 0),
      cacheHits: days.reduce((a, d) => a + d.cacheHits, 0),
      calls: days.reduce((a, d) => a + d.calls, 0),
    });
  }
  return prepared;
}

interface PipelineState {
  byCharter: Map<string, CharterState>;
}

export interface PipelineDetectorOptions {
  calibration?: CalibrationMode;
  version?: string;
}

export function pipelineDetector(
  prepared: Map<string, PreparedScenario>,
  opts: PipelineDetectorOptions = {}
): Detector<PipelineState> {
  const calibration = opts.calibration ?? "eval-observed";
  return {
    name: "pipeline-v1",
    version: opts.version ?? PIPELINE_VERSION,
    initialState(charters: Charter[]): PipelineState {
      const byCharter = new Map<string, CharterState>();
      for (const c of charters) byCharter.set(c.id, initCharterState(c.id, c.anchored_at));
      return { byCharter };
    },
    observe({ date, charters, state }) {
      const events: DriftEvent[] = [];
      for (const charter of charters) {
        const prep = prepared.get(charter.id);
        // A charter with no pre-pass entry means the pre-pass never ran for it.
        // Failing loudly beats silently scoring an empty state as "no drift".
        if (!prep) throw new Error(`pipeline-v1: no prepared evidence for charter ${charter.id}`);
        const cstate = state.byCharter.get(charter.id)!;

        // Stage 4 — fold ONLY today's evidence. The runner owns the clock.
        const day = prep.byDate.get(date);
        if (day) foldDay(cstate, day, prep.index);

        // Stage 5 — score. One flag per charter, latched in state.
        if (cstate.emitted) continue;
        const event = scoreDrift(charter, cstate, date, { calibration });
        if (event) {
          cstate.emitted = true;
          events.push(event);
        }
      }
      return { events, state };
    },
  };
}
