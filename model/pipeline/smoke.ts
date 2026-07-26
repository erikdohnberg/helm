/**
 * Stage 2–3 smoke run over the 4-scenario subset (scn-011, scn-007, scn-001,
 * scn-009), through the cached client under the default $2 cap.
 *
 * Run: node pipeline/smoke.ts
 *
 * ── On the component goldens ────────────────────────────────────────────────
 * There was no pre-existing "component golden" file in the repo to score against
 * (only each scenario's `ground_truth`). Rather than invent per-signal labels
 * (which the session rules forbid — ground truth is not a tuning knob), this
 * smoke derives its checks ONLY from structure already asserted by the scenarios:
 *
 *   Stage 2 (relevance mapping):
 *     • recall proxy — a drift scenario's charter must map ≥1 of its own signals
 *       as relevant (v0's failure was mapping zero; see eval/results/BASELINE.md).
 *     • cross-charter precision — signals from one scenario, scored against an
 *       unrelated scenario's charter, must come back NOT relevant. These negative
 *       pairs are derived from the set's structure, not hand-labeled.
 *     • the control (scn-009) is not penalized on relevance: topical relevance is
 *       legitimately nonzero; whether it is *drift* is Stage 3/5's judgment.
 *
 *   Stage 3 (evidence extraction):
 *     • span faithfulness — every extracted quote must be a verbatim substring of
 *       its signal's content (spec hard rule: no extraction without a citable
 *       span). 100% machine-checkable, no labels needed.
 *     • flag-signal coverage — for a drift scenario, the scenario's OWN
 *       `earliest_reasonable_flag_signal` must yield ≥1 substantive extraction
 *       (blocker/decision/deprioritization_cue/contradiction/competing_priority).
 *       Uses the scenario's stated label, nothing invented.
 *
 * This is a wiring + cost smoke, not a scored release gate. Numbers below are
 * diagnostic, and the derivation above is stated so it can be corrected.
 */
import { join } from "node:path";

import { CachedClient } from "./cache/client.ts";
import { SCENARIOS_DIR, loadScenarioFile, type LoadedScenario } from "../eval/loader.ts";
import { mapRelevance, extractEvidence, type RelevanceMapping } from "./stages.ts";

const TARGETS = ["scn-011", "scn-007", "scn-001", "scn-009"] as const;
// Derived cross-charter negative pairs (signals-from × charter-of), unrelated orgs.
const CROSS_NEGATIVES: Array<{ signalsFrom: string; charterOf: string }> = [
  { signalsFrom: "scn-007", charterOf: "scn-001" }, // carrier reorg signals vs activation charter
  { signalsFrom: "scn-001", charterOf: "scn-011" }, // SSO/activation signals vs churn-premise charter
];
const SUBSTANTIVE = new Set([
  "blocker",
  "decision",
  "deprioritization_cue",
  "contradiction",
  "competing_priority",
]);

function load(id: string): LoadedScenario {
  return loadScenarioFile(join(SCENARIOS_DIR, `${id}.json`));
}

/** scenario_signal_id -> content, for verbatim span checking. */
function contentById(s: LoadedScenario): Map<string, string> {
  const m = new Map<string, string>();
  for (const sig of s.signals) {
    const sid = String(sig.metadata?.scenario_signal_id ?? sig.id);
    m.set(sid, sig.content);
  }
  return m;
}

function pct(n: number, d: number): string {
  return d === 0 ? "n/a" : `${((100 * n) / d).toFixed(0)}%`;
}

async function main() {
  const client = new CachedClient({ label: "smoke-4scn", budgetUsd: 2 });
  const loaded = new Map(TARGETS.map((id) => [id, load(id)]));

  const failures: string[] = [];
  try {
    await runStages(client, loaded, failures);
  } finally {
    // Records spend on both the normal path and a budget halt (Step 2).
    client.report();
  }

  console.log(
    "\n⏸  HOLD — smoke complete. Not proceeding to the full 13-scenario run; that needs an" +
      "\n   explicit go (and a raised cap if the run would approach $2)."
  );
}

async function runStages(
  client: CachedClient,
  loaded: Map<string, LoadedScenario>,
  failures: string[]
) {
  // ── Stage 2: relevance mapping ───────────────────────────────────────────
  console.log("\n=== STAGE 2 — relevance mapping ===\n");
  const relevantByScenario = new Map<string, Set<string>>();

  for (const id of TARGETS) {
    const scn = loaded.get(id)!;
    const { mappings } = await mapRelevance(client, scn.charter, scn.signals);
    const relevant = mappings.filter((m) => m.relevant);
    relevantByScenario.set(id, new Set(relevant.map((m) => m.signal_id)));

    const isControl = scn.scenario.ground_truth.is_drift === false;
    const okRecall = isControl || relevant.length >= 1;
    console.log(
      `${id} [${scn.scenario.ground_truth.drift_type}] — ${relevant.length}/${mappings.length} relevant` +
        `${isControl ? "  (control: relevance not scored)" : okRecall ? "  ✓ maps ≥1" : "  ✗ ZERO-MAP"}`
    );
    for (const m of mappings) {
      console.log(
        `    ${m.signal_id}: ${m.relevant ? "REL" : "—  "} conf=${m.confidence.toFixed(2)} ` +
          `[${m.basis}] ${m.rationale}`
      );
    }
    if (!okRecall) failures.push(`${id}: Stage 2 mapped ZERO signals to its own charter (v0's failure mode)`);
  }

  // ── Stage 2: cross-charter precision (negatives) ─────────────────────────
  console.log("\n=== STAGE 2 — cross-charter precision (expect NOT relevant) ===\n");
  let crossTotal = 0;
  let crossFalsePositives = 0;
  for (const pair of CROSS_NEGATIVES) {
    const sigs = loaded.get(pair.signalsFrom) ?? load(pair.signalsFrom);
    const chart = loaded.get(pair.charterOf) ?? load(pair.charterOf);
    const { mappings } = await mapRelevance(client, chart.charter, sigs.signals);
    const fps = mappings.filter((m: RelevanceMapping) => m.relevant);
    crossTotal += mappings.length;
    crossFalsePositives += fps.length;
    console.log(
      `${pair.signalsFrom} signals × ${pair.charterOf} charter — ` +
        `${fps.length}/${mappings.length} wrongly relevant` +
        (fps.length === 0 ? "  ✓" : "  ✗")
    );
    for (const m of fps) console.log(`    false-positive ${m.signal_id}: [${m.basis}] ${m.rationale}`);
    if (fps.length > 0) failures.push(`cross ${pair.signalsFrom}×${pair.charterOf}: ${fps.length} false-positive relevance`);
  }
  console.log(
    `\ncross-charter precision: ${crossTotal - crossFalsePositives}/${crossTotal} correct (${pct(
      crossTotal - crossFalsePositives,
      crossTotal
    )})`
  );

  // ── Stage 3: evidence extraction ─────────────────────────────────────────
  console.log("\n=== STAGE 3 — evidence extraction (span faithfulness + flag coverage) ===\n");
  let spanTotal = 0;
  let spanFaithful = 0;

  for (const id of TARGETS) {
    const scn = loaded.get(id)!;
    const relevantIds = relevantByScenario.get(id)!;
    const relevantSignals = scn.signals.filter((s) =>
      relevantIds.has(String(s.metadata?.scenario_signal_id ?? s.id))
    );
    if (relevantSignals.length === 0) {
      console.log(`${id} — no relevant signals; skipping extraction\n`);
      continue;
    }

    const { signals: extracted } = await extractEvidence(client, scn.charter, relevantSignals);
    const byId = contentById(scn);
    const flagSignal: string | null = scn.scenario.ground_truth.earliest_reasonable_flag_signal ?? null;
    const isControl = scn.scenario.ground_truth.is_drift === false;

    console.log(`${id} [${scn.scenario.ground_truth.drift_type}] — flag@${flagSignal ?? "none"}`);
    let flagSignalCovered = false;

    for (const se of extracted) {
      const content = byId.get(se.signal_id) ?? "";
      for (const ex of se.extractions) {
        spanTotal += 1;
        const faithful = content.includes(ex.quote);
        if (faithful) spanFaithful += 1;
        else failures.push(`${id}/${se.signal_id}: quote NOT verbatim — ${JSON.stringify(ex.quote).slice(0, 80)}`);
        if (se.signal_id === flagSignal && SUBSTANTIVE.has(ex.type)) flagSignalCovered = true;
        console.log(
          `    ${se.signal_id} ${faithful ? "✓" : "✗HALLUCINATED"} ${ex.type}` +
            `${ex.contradicts_claim ? ` (contradicts ${ex.contradicts_claim})` : ""}` +
            `${ex.competing_topic ? ` (vs ${ex.competing_topic})` : ""}: “${ex.quote.slice(0, 70)}”`
        );
      }
      if (se.extractions.length === 0) console.log(`    ${se.signal_id}: (no evidence)`);
    }

    if (!isControl && flagSignal) {
      console.log(
        `  flag-signal ${flagSignal} substantive coverage: ${flagSignalCovered ? "✓ covered" : "✗ MISSED"}`
      );
      if (!flagSignalCovered)
        failures.push(`${id}: flag signal ${flagSignal} produced no substantive evidence`);
    }
    if (isControl) {
      const substantive = extracted.flatMap((se) => se.extractions).filter((e) => SUBSTANTIVE.has(e.type));
      console.log(
        `  control expectation — substantive drift evidence should be sparse: ${substantive.length} found` +
          (substantive.length === 0 ? "  ✓" : "  (review)")
      );
    }
    console.log("");
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("=== COMPONENT RESULTS ===");
  console.log(`Stage 2 cross-charter precision: ${pct(crossTotal - crossFalsePositives, crossTotal)}`);
  console.log(`Stage 3 span faithfulness:       ${spanFaithful}/${spanTotal} (${pct(spanFaithful, spanTotal)})`);
  console.log(`\n=== FAILURE CASES (${failures.length}) ===`);
  if (failures.length === 0) console.log("  none");
  else for (const f of failures) console.log(`  • ${f}`);
}

main().catch((err) => {
  console.error("\nsmoke run failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
