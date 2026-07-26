/**
 * End-to-end harness run for pipeline-v1.0, plus the two comparison runs on the
 * SAME 13 scenarios and the SAME scorer:
 *
 *   • pipeline-v1.0        — the five-stage model
 *   • v0-inactivity @ N=10 — the v0.1 baseline's best operating point
 *   • null-detector        — the floor
 *
 * Re-running the baselines matters: the numbers in eval/results/BASELINE.md were
 * scored on **10** scenarios with the charter-owner routing proxy. The set is now
 * 13 and the scorer routes against `ground_truth.expected_recipients`, so the old
 * table is not comparable to this run. History is left untouched (session rule
 * #2); the baselines are re-scored into fresh, dated directories.
 *
 *   node detectors/pipeline-v1/run-pipeline.ts [run-date]
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { CachedClient } from "../../pipeline/cache/client.ts";
import { NullDetector, type Detector } from "../../eval/detector.ts";
import { loadAllScenarios } from "../../eval/loader.ts";
import { runHarness } from "../../eval/run.ts";
import { v0InactivityDetector } from "../v0-inactivity/index.ts";
import { pipelineDetector, prepareScenarios } from "./index.ts";
import type { Scorecard } from "../../eval/scorer.ts";

const BUDGET_USD = 5;
const RESULTS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../eval/results");

/**
 * Baselines are re-scored only once per (date, version). A later pipeline
 * version on the same day reads the scorecard already on disk rather than
 * re-running into an existing directory — session rule #2, results are
 * append-only history. The baselines are deterministic and LLM-free, so the
 * stored card and a fresh run are the same numbers.
 */
function scoreOrReuse(detector: Detector<any>, runDate: string): { card: Scorecard; dir: string } {
  const existing = readdirSync(RESULTS_ROOT).find((d) =>
    d.startsWith(`${runDate}-${detector.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${detector.version}`)
  );
  if (existing && existsSync(join(RESULTS_ROOT, existing, "scorecard.json"))) {
    const card = JSON.parse(readFileSync(join(RESULTS_ROOT, existing, "scorecard.json"), "utf8")) as Scorecard;
    return { card, dir: `${join(RESULTS_ROOT, existing)} (reused)` };
  }
  return runHarness(detector, runDate);
}

const pct = (x: number | null) => (x === null ? "n/a" : `${(x * 100).toFixed(1)}%`);
const num = (x: number | null) => (x === null ? "n/a" : String(x));

function summary(card: Scorecard): string {
  const m = card.metrics;
  const t = card.timing_breakdown;
  return (
    `| ${card.detector.name} v${card.detector.version} | ${pct(m.detection_recall)} | ` +
    `${pct(m.precision_proxy)} | ${num(m.median_lead_time_days)} | ` +
    `${m.control_false_positive_count} | ${m.control_hard_failures} | ${pct(m.type_accuracy)} | ` +
    `${pct(m.routing_coverage)} | ${t.premature} / ${t.on_time} / ${t.late} / ${t.missed} |`
  );
}

/** The newest committed pipeline-v1 scorecard that isn't the version just run. */
function loadPrevPipelineCard(currentVersion: string): Scorecard | null {
  const dirs = readdirSync(RESULTS_ROOT)
    .filter((d) => /-pipeline-v1-\d+\.\d+\.\d+$/.test(d) && !d.endsWith(`-${currentVersion}`))
    .sort();
  const dir = dirs.at(-1);
  if (!dir) return null;
  const file = join(RESULTS_ROOT, dir, "scorecard.json");
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Scorecard) : null;
}

async function main() {
  const runDate =
    process.argv[2] && /^\d{4}-\d{2}-\d{2}$/.test(process.argv[2])
      ? process.argv[2]
      : new Date().toISOString().slice(0, 10);

  const scenarios = loadAllScenarios();
  console.log(`loaded ${scenarios.length} scenarios`);

  // ── Async pre-pass: Stages 2–3, one day at a time, through the cache ──────
  const client = new CachedClient({ label: "pipeline-v1-prepass", budgetUsd: BUDGET_USD });
  let prepared;
  try {
    prepared = await prepareScenarios(client, scenarios);
  } finally {
    client.report();
  }
  const spent = client.runTally;
  if (spent.misses > 0) {
    console.log(
      `\nNOTE: ${spent.misses} pre-pass call(s) were NOT cache hits ($${spent.runUsd.toFixed(4)}). ` +
        `Expected 0 — the component eval should have billed every one of these.`
    );
  }

  // ── Sync replay: Stages 4–5 through the standard harness ─────────────────
  const cards: Scorecard[] = [];
  const dirs: string[] = [];

  const pipeline = pipelineDetector(prepared);
  {
    const { card, dir } = runHarness(pipeline, runDate);
    cards.push(card);
    dirs.push(dir);
    console.log(`\npipeline-v${pipeline.version}: wrote ${dir}`);
  }
  for (const [detector, label] of [
    [v0InactivityDetector(10, "1.1.0"), "v0.1 @ N=10"],
    [NullDetector, "null"],
  ] as const) {
    const { card, dir } = scoreOrReuse(detector, runDate);
    cards.push(card);
    dirs.push(dir);
    console.log(`${label}: ${dir}`);
  }

  console.log("\n=== COMPARISON (all 13 scenarios, same scorer) ===\n");
  console.log(
    "| Detector | Recall | Precision proxy | Median lead (d) | Control FP | Hard fail | Type acc | Routing | prem/on-time/late/missed |"
  );
  console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const c of cards) console.log(summary(c));

  // ── Per-scenario delta against the previous pipeline version ──────────────
  const prev = loadPrevPipelineCard(cards[0].detector.version);
  if (prev) {
    console.log(
      `\n=== PER-SCENARIO DELTA: v${prev.detector.version} (${prev.run_date}) → v${cards[0].detector.version} ===\n`
    );
    console.log("| Scenario | Expected | v" + prev.detector.version + " | v" + cards[0].detector.version + " | Δ |");
    console.log("| --- | --- | --- | --- | --- |");
    const before = new Map(prev.per_scenario.map((s) => [s.scenario_id, s]));
    for (const now of cards[0].per_scenario) {
      const was = before.get(now.scenario_id);
      const fmt = (s: typeof now | undefined) =>
        !s ? "—" : `${s.classification}${s.flagged ? ` ${s.first_flag_date} as ${s.type_match ? "correct type" : "wrong type"}` : ""}`;
      const changed = !was || was.classification !== now.classification || was.type_match !== now.type_match;
      console.log(
        `| ${now.scenario_id} | ${now.is_control ? "control" : now.expected_drift_type} | ${fmt(was)} | ${fmt(now)} | ${changed ? "**changed**" : "same" } |`
      );
    }
  }

  console.log(`\n=== pipeline-v${cards[0].detector.version} per scenario ===\n`);
  for (const s of cards[0].per_scenario) {
    const evented = s.flagged ? `${s.first_flag_date}` : "—";
    console.log(
      `${s.scenario_id.padEnd(8)} exp=${(s.is_control ? "control" : s.expected_drift_type).padEnd(24)} ` +
        `${s.classification.padEnd(22)} flag=${evented.padEnd(11)} lead=${String(num(s.lead_time_days)).padEnd(5)} ` +
        `type=${s.type_match === null ? "—" : s.type_match ? "yes" : "NO"} ` +
        `routing=${s.routing.coverage === null ? "—" : pct(s.routing.coverage)}` +
        `${s.control_hard_failure ? "  ** HARD FAIL **" : ""}`
    );
  }
}

main().catch((err) => {
  console.error("\npipeline run failed:", err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
