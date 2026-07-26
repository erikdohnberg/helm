/**
 * Stage 2 + Stage 3 component eval over the full 13-scenario set.
 *
 *   node pipeline/component-eval.ts [run-date]
 *
 * This is the component gate that precedes the end-to-end pipeline-v1.0 harness
 * run. It bills the LLM calls; the detector run afterwards replays them at $0,
 * because both consumers go through `computeDailyEvidence` on the same
 * (charter, signals) — identical requests, identical cache keys.
 *
 * ── Batching: one day at a time, everywhere ─────────────────────────────────
 * Every Stage 2/3 call here sees ONE day of signals (spec §6). That holds for
 * the hard-negative stress test too, deliberately: measuring precision under
 * whole-scenario batching while production maps per day would be measuring a
 * different system. The earlier 4-scenario smoke used whole-scenario batching,
 * so its cached entries do NOT serve this run — the numbers below are fresh.
 *
 * ── Where the checks come from ──────────────────────────────────────────────
 * There is no hand-written "component golden" file, and inventing per-signal
 * labels is forbidden (session rule #1: ground truth is not a tuning knob). So
 * every check below is derived from structure the scenarios already assert:
 *
 *   Stage 2 — relevance mapping
 *     • self-recall: a drift scenario's charter must map ≥1 of its own signals
 *       (v0's failure was mapping zero — eval/results/BASELINE.md).
 *     • flag-signal recall: the scenario's own `earliest_reasonable_flag_signal`
 *       must map relevant. If Stage 2 drops it, Stage 3 never sees it and the
 *       pipeline cannot flag on time. This is the load-bearing recall number.
 *     • hard-negative stress: signals from one org's scenario scored against an
 *       unrelated org's charter must come back NOT relevant. See the caveat in
 *       the generated report — this is an adversarial over-mapping probe, not a
 *       production precision figure.
 *     • controls are not scored on relevance: topical relevance is legitimately
 *       nonzero on a control; whether it is *drift* is Stage 3/5's judgment.
 *
 *   Stage 3 — evidence extraction
 *     • span faithfulness: every quote must be a verbatim substring of its
 *       signal's content (hard rule #3 — no claim without a citable span).
 *       100% machine-checkable, zero labels needed.
 *     • flag-signal coverage: a drift scenario's own flag signal must yield ≥1
 *       substantive extraction (blocker / decision / deprioritization_cue /
 *       contradiction / competing_priority).
 *     • controls: substantive extractions are REPORTED, not penalized. Stage 3's
 *       job is to surface latent competing-priority evidence faithfully; telling
 *       drift from noise on that evidence is Stage 5's job. See the report.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { CachedClient, BudgetExceededError } from "./cache/client.ts";
import { computeDailyEvidence, signalsByDay, type DailyEvidence } from "./daily-evidence.ts";
import { loadAllScenarios, type LoadedScenario } from "../eval/loader.ts";
import { mapRelevance } from "./stages.ts";

const RESULTS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "eval", "results");
const BUDGET_USD = 5;

/** Evidence types that count as substantive drift evidence for Stage 4/5. */
const SUBSTANTIVE = new Set([
  "blocker",
  "decision",
  "deprioritization_cue",
  "contradiction",
  "competing_priority",
]);

/**
 * Adversarial cross-org pairs (signals-from × charter-of). Each pair crosses two
 * different companies, so a "relevant" verdict is unambiguously an over-map.
 * Derived from the set's structure (different `company_context.name`), never
 * from per-signal labels.
 */
const HARD_NEGATIVES: Array<[string, string]> = [
  ["scn-007", "scn-001"], // carrier-network reorg signals vs an activation charter
  ["scn-001", "scn-011"], // SSO/activation signals vs a churn-premise charter
  ["scn-012", "scn-006"], // dev-portal scope signals vs a reports-migration charter
  ["scn-013", "scn-003"], // metric-detachment signals vs a pilot-networks charter
];

const sidOf = (s: { id: string; metadata?: Record<string, unknown> | null }) =>
  String(s.metadata?.scenario_signal_id ?? s.id);

const pct = (n: number, d: number) => (d === 0 ? "n/a" : `${((100 * n) / d).toFixed(1)}%`);

interface ScenarioComponentResult {
  id: string;
  is_control: boolean;
  drift_type: string;
  days: number;
  signals: number;
  mapped_relevant: number;
  flag_signal: string | null;
  flag_signal_mapped: boolean | null;
  flag_signal_substantive: boolean | null;
  extractions: number;
  spans_faithful: number;
  spans_total: number;
  substantive: number;
  cost_usd: number;
  cache_hits: number;
  calls: number;
}

interface HardNegativeResult {
  signals_from: string;
  charter_of: string;
  mapped_relevant: number;
  signals: number;
  examples: string[];
}

async function main() {
  const runDate =
    process.argv[2] && /^\d{4}-\d{2}-\d{2}$/.test(process.argv[2])
      ? process.argv[2]
      : new Date().toISOString().slice(0, 10);

  const client = new CachedClient({ label: "component-eval-13scn", budgetUsd: BUDGET_USD });
  const scenarios = loadAllScenarios();
  const byId = new Map(scenarios.map((s) => [s.scenario.id as string, s]));

  const results: ScenarioComponentResult[] = [];
  const negatives: HardNegativeResult[] = [];
  const failures: string[] = [];
  let halted: string | null = null;

  try {
    for (const loaded of scenarios) {
      results.push(await evalScenario(client, loaded, failures));
    }
    for (const [from, of_] of HARD_NEGATIVES) {
      negatives.push(await evalHardNegative(client, byId.get(from)!, byId.get(of_)!));
    }
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      halted =
        `BUDGET HALT — spent $${err.spentUsd.toFixed(4)} of the $${err.capUsd.toFixed(2)} cap; ` +
        `the next call projected $${err.projectedUsd.toFixed(4)}. No call was made. ` +
        `Results below cover only the scenarios completed before the halt.`;
      console.error(`\n⛔ ${halted}`);
    } else {
      throw err;
    }
  } finally {
    client.report();
  }

  const md = renderReport(runDate, results, negatives, failures, halted, client.runTally);
  const dir = join(RESULTS_ROOT, `${runDate}-pipeline-stage23-component`);
  if (existsSync(dir)) {
    throw new Error(
      `results directory already exists and results are append-only: ${dir}\n` +
        `Use a different run date rather than overwriting history.`
    );
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "component-eval.md"), md);
  writeFileSync(
    join(dir, "component-eval.json"),
    JSON.stringify({ run_date: runDate, halted, results, negatives, failures }, null, 2) + "\n"
  );

  console.log(`\n${md}`);
  console.log(`\nwrote ${dir}`);
  if (halted) process.exitCode = 1;
}

async function evalScenario(
  client: CachedClient,
  loaded: LoadedScenario,
  failures: string[]
): Promise<ScenarioComponentResult> {
  const id = loaded.scenario.id as string;
  const gt = loaded.scenario.ground_truth;
  const isControl = gt.is_drift === false;
  const flagSignal: string | null = gt.earliest_reasonable_flag_signal ?? null;

  console.log(`\n── ${id} [${gt.drift_type}] ─────────────────────────────`);
  const days: DailyEvidence[] = await computeDailyEvidence(client, loaded.charter, loaded.signals);

  const contentById = new Map(loaded.signals.map((s) => [sidOf(s), s.content]));
  const relevant = new Set(days.flatMap((d) => d.relevantSignalIds));

  let spansTotal = 0;
  let spansFaithful = 0;
  let extractions = 0;
  let substantive = 0;
  let flagSubstantive = false;

  for (const day of days) {
    for (const se of day.extractions) {
      for (const ex of se.extractions) {
        extractions += 1;
        spansTotal += 1;
        const content = contentById.get(se.signal_id) ?? "";
        const faithful = content.includes(ex.quote);
        if (faithful) spansFaithful += 1;
        else
          failures.push(
            `${id}/${se.signal_id}: quote NOT verbatim — ${JSON.stringify(ex.quote).slice(0, 90)}`
          );
        if (SUBSTANTIVE.has(ex.type)) {
          substantive += 1;
          if (se.signal_id === flagSignal) flagSubstantive = true;
        }
        console.log(
          `   ${day.date} ${se.signal_id} ${faithful ? "✓" : "✗HALLUCINATED"} ${ex.type}` +
            `${ex.contradicts_claim ? ` (contradicts ${ex.contradicts_claim})` : ""}` +
            `${ex.competing_topic ? ` (vs ${ex.competing_topic})` : ""}: “${ex.quote.slice(0, 60)}”`
        );
      }
    }
  }

  const flagMapped = flagSignal ? relevant.has(flagSignal) : null;
  if (!isControl) {
    if (relevant.size === 0)
      failures.push(`${id}: Stage 2 mapped ZERO signals to its own charter (v0's failure mode)`);
    if (flagSignal && !flagMapped)
      failures.push(`${id}: Stage 2 dropped the flag signal ${flagSignal} — Stage 3 never sees it`);
    if (flagSignal && flagMapped && !flagSubstantive)
      failures.push(`${id}: flag signal ${flagSignal} produced no substantive evidence`);
  }

  console.log(
    `   → ${relevant.size}/${loaded.signals.length} relevant · flag ${flagSignal ?? "n/a"} ` +
      `${flagMapped === null ? "" : flagMapped ? "mapped✓" : "DROPPED✗"} ` +
      `${flagSubstantive ? "substantive✓" : isControl || !flagSignal ? "" : "no-substantive✗"} · ` +
      `spans ${spansFaithful}/${spansTotal} · $${days.reduce((a, d) => a + d.costUsd, 0).toFixed(4)}`
  );

  return {
    id,
    is_control: isControl,
    drift_type: gt.drift_type,
    days: days.length,
    signals: loaded.signals.length,
    mapped_relevant: relevant.size,
    flag_signal: flagSignal,
    flag_signal_mapped: flagMapped,
    flag_signal_substantive: isControl || !flagSignal ? null : flagSubstantive,
    extractions,
    spans_faithful: spansFaithful,
    spans_total: spansTotal,
    substantive,
    cost_usd: days.reduce((a, d) => a + d.costUsd, 0),
    cache_hits: days.reduce((a, d) => a + d.cacheHits, 0),
    calls: days.reduce((a, d) => a + d.calls, 0),
  };
}

/**
 * Stage 2 only, per day, with the signals of one scenario scored against the
 * charter of an unrelated org's scenario. Stage 3 is not run: an over-map here
 * is already the finding.
 */
async function evalHardNegative(
  client: CachedClient,
  from: LoadedScenario,
  of_: LoadedScenario
): Promise<HardNegativeResult> {
  let mappedRelevant = 0;
  let total = 0;
  const examples: string[] = [];
  for (const { signals } of signalsByDay(from.signals)) {
    const { mappings } = await mapRelevance(client, of_.charter, signals);
    total += mappings.length;
    for (const m of mappings.filter((x) => x.relevant)) {
      mappedRelevant += 1;
      examples.push(`${m.signal_id} [${m.basis}] ${m.rationale}`);
    }
  }
  console.log(
    `\nhard-negative ${from.scenario.id} signals × ${of_.scenario.id} charter — ` +
      `${mappedRelevant}/${total} over-mapped${mappedRelevant === 0 ? "  ✓" : "  ✗"}`
  );
  for (const e of examples) console.log(`   ${e}`);
  return {
    signals_from: from.scenario.id,
    charter_of: of_.scenario.id,
    mapped_relevant: mappedRelevant,
    signals: total,
    examples,
  };
}

function renderReport(
  runDate: string,
  results: ScenarioComponentResult[],
  negatives: HardNegativeResult[],
  failures: string[],
  halted: string | null,
  tally: { hits: number; misses: number; runUsd: number }
): string {
  const drift = results.filter((r) => !r.is_control);
  const flagged = drift.filter((r) => r.flag_signal);
  const flagMapped = flagged.filter((r) => r.flag_signal_mapped).length;
  const flagSubstantive = flagged.filter((r) => r.flag_signal_substantive).length;
  const spansTotal = results.reduce((a, r) => a + r.spans_total, 0);
  const spansFaithful = results.reduce((a, r) => a + r.spans_faithful, 0);
  const negTotal = negatives.reduce((a, n) => a + n.signals, 0);
  const negOverMapped = negatives.reduce((a, n) => a + n.mapped_relevant, 0);

  const L: string[] = [];
  L.push(`# Stage 2–3 component eval — 13 scenarios`);
  L.push("");
  L.push(`- **Run date:** ${runDate}`);
  L.push(`- **Model:** \`claude-opus-4-8\` (pinned), all calls via the content-addressed cache`);
  L.push(`- **Batching:** one day of signals per call (spec §6) — including the hard negatives`);
  L.push(`- **Spend:** $${tally.runUsd.toFixed(4)} of the $${BUDGET_USD.toFixed(2)} cap · ${tally.misses} billed calls · ${tally.hits} cache hits`);
  if (halted) {
    L.push("");
    L.push(`> ⛔ **${halted}**`);
  }
  L.push("");
  L.push("## Headline");
  L.push("");
  L.push("| Component metric | Value |");
  L.push("| --- | --- |");
  L.push(`| Stage 2 — scenarios mapping ≥1 own signal | ${drift.filter((r) => r.mapped_relevant > 0).length}/${drift.length} |`);
  L.push(`| Stage 2 — **flag-signal recall** | ${flagMapped}/${flagged.length} (${pct(flagMapped, flagged.length)}) |`);
  L.push(`| Stage 2 — hard-negative over-mapping | ${negOverMapped}/${negTotal} (${pct(negTotal - negOverMapped, negTotal)} clean) |`);
  L.push(`| Stage 3 — **span faithfulness** | ${spansFaithful}/${spansTotal} (${pct(spansFaithful, spansTotal)}) |`);
  L.push(`| Stage 3 — flag-signal substantive coverage | ${flagSubstantive}/${flagged.length} (${pct(flagSubstantive, flagged.length)}) |`);
  L.push("");
  L.push("## Per scenario");
  L.push("");
  L.push("| Scenario | Expected type | Relevant | Flag signal | Mapped | Substantive | Extractions | Spans | $ |");
  L.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const r of results) {
    L.push(
      `| ${r.id} | ${r.is_control ? "control" : r.drift_type} | ${r.mapped_relevant}/${r.signals} | ` +
        `${r.flag_signal ?? "—"} | ${r.flag_signal_mapped === null ? "—" : r.flag_signal_mapped ? "yes" : "**NO**"} | ` +
        `${r.flag_signal_substantive === null ? "—" : r.flag_signal_substantive ? "yes" : "**NO**"} | ` +
        `${r.extractions} | ${r.spans_faithful}/${r.spans_total} | ${r.cost_usd.toFixed(4)} |`
    );
  }
  L.push("");
  L.push("## Hard-negative stress test (adversarial cross-org pairing)");
  L.push("");
  L.push("| Signals from | Scored against charter of | Over-mapped |");
  L.push("| --- | --- | --- |");
  for (const n of negatives)
    L.push(`| ${n.signals_from} | ${n.charter_of} | ${n.mapped_relevant}/${n.signals} |`);
  L.push("");
  L.push(
    "**Read this number as a stress test, not as production precision.** In production, Stage 2 " +
      "scopes to a single org's charters via `org_id`: a signal is never offered a charter from a " +
      "different company. These pairs deliberately violate that scoping, so what they measure is " +
      "**over-mapping under adversarial pairing** — how readily the mapper reaches for a charter it " +
      "should have no business matching. Keep the check: it is a good canary for a future " +
      "**same-org, multi-charter** corpus, where the mapper really will have to choose between " +
      "several live charters and this failure mode becomes a production one."
  );
  if (negatives.some((n) => n.mapped_relevant > 0)) {
    L.push("");
    L.push("Over-mapped instances:");
    L.push("");
    for (const n of negatives)
      for (const e of n.examples) L.push(`- \`${n.signals_from}×${n.charter_of}\` — ${e}`);
  }
  L.push("");
  L.push("## Controls");
  L.push("");
  for (const r of results.filter((x) => x.is_control))
    L.push(`- **${r.id}** — ${r.mapped_relevant}/${r.signals} relevant, ${r.substantive} substantive extractions.`);
  L.push("");
  L.push(
    "**Substantive extractions on a control are correct-by-design, not a defect.** Stage 3's job is " +
      "to surface latent competing-priority evidence *faithfully*; scn-009 genuinely contains a " +
      "lively, charter-excluded integration thread, and refusing to extract it would be Stage 3 " +
      "hiding evidence from the stages that need it. Telling committed drift from uncommitted " +
      "discussion on that evidence is **Stage 5's** discrimination job (spec §3: the distinction is " +
      "commitment, not topic) — and it is scored there, as a control false positive. So this eval " +
      "reports the count and does not mark a control for review on it."
  );
  L.push("");
  L.push(`## Failure cases (${failures.length})`);
  L.push("");
  if (failures.length === 0) L.push("- none");
  else for (const f of failures) L.push(`- ${f}`);
  L.push("");
  return L.join("\n");
}

main().catch((err) => {
  console.error("\ncomponent eval failed:", err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
