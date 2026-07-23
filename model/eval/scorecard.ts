/**
 * Writes a scorecard as JSON + human-readable markdown into
 * model/eval/results/<run_date>-<detector>-<version>/.
 *
 * Refuses to overwrite an existing results directory — scorecards are
 * append-only history (model/CLAUDE.md session rule #2).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Scorecard, ScenarioScore } from "./scorer.ts";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function resultDirName(card: Scorecard): string {
  return `${card.run_date}-${slug(card.detector.name)}-${card.detector.version}`;
}

const pct = (x: number | null) => (x === null ? "n/a" : `${(x * 100).toFixed(1)}%`);
const num = (x: number | null) => (x === null ? "n/a" : String(x));

function scenarioRow(s: ScenarioScore): string {
  const cells = [
    s.scenario_id,
    s.is_control ? "control" : s.expected_drift_type,
    s.classification,
    num(s.lead_time_days),
    s.type_match === null ? "—" : s.type_match ? "yes" : "NO",
    s.routing.coverage === null ? "—" : pct(s.routing.coverage),
    s.control_hard_failure ? "**HARD FAIL**" : "",
  ];
  return `| ${cells.join(" | ")} |`;
}

export function renderMarkdown(card: Scorecard): string {
  const m = card.metrics;
  const t = card.timing_breakdown;
  const lines: string[] = [];
  lines.push(`# Eval scorecard — ${card.detector.name} v${card.detector.version}`);
  lines.push("");
  lines.push(`- **Run date:** ${card.run_date}`);
  lines.push(`- **Contracts version:** ${card.contracts_version}`);
  lines.push(
    `- **Scenarios:** ${card.totals.scenarios} (${card.totals.drift_scenarios} drift, ${card.totals.control_scenarios} control)`
  );
  lines.push("");
  lines.push("## Scorecard");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("| --- | --- |");
  lines.push(`| Detection recall | ${pct(m.detection_recall)} |`);
  lines.push(`| Precision proxy (on-time+late / all flags) | ${pct(m.precision_proxy)} |`);
  lines.push(`| Median lead time (days) | ${num(m.median_lead_time_days)} |`);
  lines.push(`| Control false positives | ${m.control_false_positive_count} |`);
  lines.push(`| Control hard failures | ${m.control_hard_failures} |`);
  lines.push(`| Drift-type accuracy | ${pct(m.type_accuracy)} |`);
  lines.push(`| Routing coverage | ${pct(m.routing_coverage)} |`);
  lines.push("");
  lines.push(
    `**Timing:** premature ${t.premature} · on-time ${t.on_time} · late ${t.late} · missed ${t.missed}`
  );
  lines.push("");
  lines.push("## Per scenario");
  lines.push("");
  lines.push("| Scenario | Expected | Classification | Lead (d) | Type | Routing | Flag |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const s of card.per_scenario) lines.push(scenarioRow(s));
  lines.push("");
  return lines.join("\n");
}

export function writeScorecard(card: Scorecard, resultsRoot: string): string {
  const dir = join(resultsRoot, resultDirName(card));
  if (existsSync(dir)) {
    throw new Error(
      `results directory already exists and scorecards are append-only: ${dir}\n` +
        `Bump the detector version or run date rather than overwriting history.`
    );
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "scorecard.json"), JSON.stringify(card, null, 2) + "\n");
  writeFileSync(join(dir, "scorecard.md"), renderMarkdown(card));
  return dir;
}
