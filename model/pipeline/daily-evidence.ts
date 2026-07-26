/**
 * The per-day Stage 2 + Stage 3 pass — the single LLM-touching path for the
 * whole pipeline eval, shared by the component eval and the pipeline detector.
 *
 * Spec §6 is explicit that "stages 1–3 run on one day of data; stages 4–5 run
 * on rolling state." So relevance mapping (Stage 2) and evidence extraction
 * (Stage 3) are computed ONE DAY AT A TIME here: each day's calls see only that
 * day's signals and the charter. That is what keeps the eval honest — a day-D
 * mapping cannot be coloured by a day-D+1 signal, because that signal is not in
 * the batch. (Batching a whole scenario would leak later context into earlier
 * days' relevance judgments; we don't.)
 *
 * Both consumers call `computeDailyEvidence` on the same (charter, signals), so
 * the cached client serves the second consumer entirely from committed entries
 * at $0 — the component eval bills the calls, the detector run replays them.
 */
import type { CachedClient } from "./cache/client.ts";
import type { Charter, Signal } from "../contracts/index.ts";
import {
  mapRelevance,
  extractEvidence,
  type RelevanceMapping,
  type SignalExtractions,
} from "./stages.ts";

/** Everything Stages 4–5 need for one day, already through the LLM stages. */
export interface DailyEvidence {
  date: string;
  /** Stage 2 output for this day's signals. */
  mappings: RelevanceMapping[];
  /** scenario_signal_id set the mapper judged relevant. */
  relevantSignalIds: string[];
  /** Stage 3 output for this day's relevant signals (empty if none relevant). */
  extractions: SignalExtractions[];
  /** Per-call accounting, summed across this day's Stage 2 + Stage 3 calls. */
  costUsd: number;
  cacheHits: number;
  calls: number;
}

const dayOf = (s: Signal) => s.occurred_at.slice(0, 10);
const sidOf = (s: Signal) => String(s.metadata?.scenario_signal_id ?? s.id);

/** Group a scenario's signals into ascending-date buckets. */
export function signalsByDay(signals: Signal[]): Array<{ date: string; signals: Signal[] }> {
  const byDay = new Map<string, Signal[]>();
  for (const s of signals) {
    const d = dayOf(s);
    const bucket = byDay.get(d);
    if (bucket) bucket.push(s);
    else byDay.set(d, [s]);
  }
  return [...byDay.keys()].sort().map((date) => ({ date, signals: byDay.get(date)! }));
}

/**
 * Run Stages 2 and 3 per day for one charter's signal timeline. Returns one
 * DailyEvidence per day that has signals, in date order.
 */
export async function computeDailyEvidence(
  client: CachedClient,
  charter: Charter,
  signals: Signal[]
): Promise<DailyEvidence[]> {
  const out: DailyEvidence[] = [];

  for (const { date, signals: daySignals } of signalsByDay(signals)) {
    const relResult = await mapRelevance(client, charter, daySignals);
    const relevantIds = new Set(relResult.mappings.filter((m) => m.relevant).map((m) => m.signal_id));
    const relevantSignals = daySignals.filter((s) => relevantIds.has(sidOf(s)));

    let extractions: SignalExtractions[] = [];
    let extractCost = 0;
    let extractHit = 0;
    let extractCalls = 0;
    if (relevantSignals.length > 0) {
      const exResult = await extractEvidence(client, charter, relevantSignals);
      extractions = exResult.signals;
      extractCost = exResult.costUsd;
      extractHit = exResult.cacheHit ? 1 : 0;
      extractCalls = 1;
    }

    out.push({
      date,
      mappings: relResult.mappings,
      relevantSignalIds: [...relevantIds],
      extractions,
      costUsd: relResult.costUsd + extractCost,
      cacheHits: (relResult.cacheHit ? 1 : 0) + extractHit,
      calls: 1 + extractCalls,
    });
  }

  return out;
}
