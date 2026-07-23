/**
 * Eval harness entrypoint. Runs a detector through every scenario, scores the
 * set, and writes a committed scorecard artifact.
 *
 *   node --experimental-strip-types model/eval/run.ts [run-date] [detector]
 *
 * run-date defaults to today (UTC). detector defaults to "null". Results land in
 * model/eval/results/<run-date>-<detector>-<version>/ and are never overwritten.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { NullDetector, type Detector } from "./detector.ts";
import { loadAllScenarios } from "./loader.ts";
import { replayScenario } from "./runner.ts";
import { buildScorecard, scoreScenario } from "./scorer.ts";
import { writeScorecard } from "./scorecard.ts";

const RESULTS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "results");

const DETECTORS: Record<string, Detector<any>> = {
  null: NullDetector,
};

export function runHarness(detector: Detector<any>, runDate: string, resultsRoot = RESULTS_ROOT) {
  const scenarios = loadAllScenarios();
  const scores = scenarios.map((loaded) => {
    const replay = replayScenario(loaded, detector);
    return scoreScenario(loaded.scenario, replay.emitted);
  });
  const card = buildScorecard(detector, scores, runDate);
  const dir = writeScorecard(card, resultsRoot);
  return { card, dir };
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

// CLI
const runDate = process.argv[2] && /^\d{4}-\d{2}-\d{2}$/.test(process.argv[2]) ? process.argv[2] : todayUtc();
const detectorKey = process.argv[3] ?? "null";
const detector = DETECTORS[detectorKey];
if (!detector) {
  console.error(`unknown detector "${detectorKey}"; known: ${Object.keys(DETECTORS).join(", ")}`);
  process.exit(1);
}

const { card, dir } = runHarness(detector, runDate);
console.log(`wrote ${dir}`);
console.log(
  `recall ${(card.metrics.detection_recall * 100).toFixed(1)}% · ` +
    `control FPs ${card.metrics.control_false_positive_count} · ` +
    `missed ${card.timing_breakdown.missed}/${card.totals.drift_scenarios}`
);
