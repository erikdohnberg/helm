/**
 * Renders the human-readable markdown doc for the drift eval set from the
 * canonical JSON (model/scenarios/_meta.json + scn-*.json).
 *
 *   node --experimental-strip-types model/scenarios/generate-doc.ts
 *
 * Output: model/scenarios/drift-eval-scenarios.md. The JSON files are the
 * source of truth; this markdown is generated documentation — do not edit it
 * by hand.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "drift-eval-scenarios.md");

const TAXONOMY: Record<string, string> = {
  attention_decay: "Attention decay",
  priority_displacement: "Priority displacement",
  capacity_withdrawal: "Capacity withdrawal",
  commitment_overrun: "Commitment overrun",
  scope_mutation: "Scope mutation",
  reasoning_contradiction: "Reasoning contradiction",
  metric_detachment: "Metric detachment",
};

const meta = JSON.parse(readFileSync(join(DIR, "_meta.json"), "utf8"));
const files = readdirSync(DIR)
  .filter((f) => /^scn-\d{3}\.json$/.test(f))
  .sort();
const scenarios = files.map((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")));

const cell = (v: unknown) => String(v ?? "—").replace(/\|/g, "\\|").replace(/\n+/g, " ");
const out: string[] = [];
const p = (s = "") => out.push(s);

p("<!-- GENERATED FILE — do not edit by hand.");
p("     Source of truth: model/scenarios/_meta.json + scn-*.json");
p("     Regenerate: node --experimental-strip-types model/scenarios/generate-doc.ts -->");
p("");
p("# Drift Eval Scenarios");
p("");
p(`**Schema version:** ${meta.schema_version}`);
p("");
p(meta.purpose);
p("");

// Coverage derived from the JSON files themselves.
p("## Coverage (v1.1 taxonomy)");
p("");
p("| Drift type | Scenarios |");
p("| --- | --- |");
for (const slug of Object.keys(TAXONOMY)) {
  const ids = scenarios.filter((s) => s.ground_truth.drift_type === slug).map((s) => s.id);
  p(`| ${TAXONOMY[slug]} | ${ids.length ? ids.join(", ") : "— (gap)"} |`);
}
const controls = scenarios
  .filter((s) => s.ground_truth.drift_type === "none")
  .map((s) => `${s.id} (${s.ground_truth.control_kind})`);
p(`| _non-drift control_ | ${controls.join(", ")} |`);
p("");

// Design notes.
p("## Design notes");
p("");
const dn = meta.design_notes ?? {};
if (dn.severity_definitions) {
  p("**Severity definitions**");
  p("");
  for (const [k, v] of Object.entries(dn.severity_definitions)) p(`- **${k}** — ${v}`);
  p("");
}
for (const [k, v] of Object.entries(dn)) {
  if (k === "severity_definitions") continue;
  p(`**${k}** — ${v}`);
  p("");
}

// Per-scenario detail.
for (const s of scenarios) {
  const gt = s.ground_truth;
  const dtLabel = gt.drift_type === "none" ? `none (${gt.control_kind})` : TAXONOMY[gt.drift_type] ?? gt.drift_type;
  p("---");
  p("");
  p(`## ${s.id} — ${s.label}`);
  p("");
  p(`**Drift type:** ${dtLabel}  ·  **is_drift:** ${gt.is_drift}  ·  **severity:** ${gt.severity}  ·  **should_flag:** ${gt.should_flag}`);
  p("");
  const cc = s.company_context;
  p(`**Company:** ${cc.name} — ${cc.profile}  ·  **Team:** ${cc.team}`);
  p("");

  const c = s.charter;
  p("### Charter");
  p("");
  p(`- **${c.title}** — ${c.outcome}`);
  p(`- **Metric:** ${c.metric} (${c.baseline} → ${c.target}, ${c.timeframe})`);
  p(`- **Reasoning:** ${c.reasoning}`);
  p(`- **Trade-offs:** ${(c.trade_offs ?? []).map((t: string) => t).join("; ")}`);
  p(`- **Owners:** outcome — ${c.outcome_owner}; decision — ${c.decision_owner}  ·  **Anchored:** ${c.anchored_on}`);
  p("");

  p("### Drift");
  p("");
  p(`- **Mechanism (${s.drift.type}, ${s.drift.severity}):** ${s.drift.mechanism}`);
  p("");

  p("### Signal timeline");
  p("");
  p("| id | date | source | obs. | content |");
  p("| --- | --- | --- | --- | --- |");
  for (const sig of s.signal_timeline) {
    p(`| ${cell(sig.signal_id)} | ${cell(sig.date)} | ${cell(sig.source)} | ${cell(sig.observability)} | ${cell(sig.content)} |`);
  }
  p("");

  const hr = s.human_realization;
  p("### Human realization");
  p("");
  p(`- **First noticed by:** ${cell(hr.first_noticed_by)}${hr.first_noticed_date ? ` on ${hr.first_noticed_date}` : ""} (lag from first signal: ${hr.lag_from_first_signal_days ?? "—"} days)`);
  if (hr.moment) p(`- **Moment:** ${hr.moment}`);
  const la = hr.leadership_awareness ?? {};
  p(`- **Leadership aware:** ${la.aware_on ?? "—"} — ${cell(la.how)} (lag: ${la.lag_from_first_signal_days ?? "—"} days)`);
  p("");

  p("### Ground truth");
  p("");
  p(`- **earliest_reasonable_flag_signal:** ${gt.earliest_reasonable_flag_signal ?? "—"}`);
  p(`- **flag_rationale:** ${gt.flag_rationale}`);
  if (gt.expected_flag_summary) p(`- **expected_flag_summary:** ${gt.expected_flag_summary}`);
  if (gt.expected_behavior_instead) p(`- **expected_behavior_instead:** ${gt.expected_behavior_instead}`);
  if (gt.grader_notes) p(`- **grader_notes:** ${gt.grader_notes}`);
  p("");

  const ia = s.information_asymmetry ?? {};
  p("### Information asymmetry");
  p("");
  if (ia.team_picture) p(`- **Team picture:** ${ia.team_picture}`);
  if (ia.leadership_picture) p(`- **Leadership picture:** ${ia.leadership_picture}`);
  if (ia.the_gap) p(`- **The gap:** ${ia.the_gap}`);
  if (ia.who_needed_to_hear_the_flag) p(`- **Who needed to hear the flag:** ${ia.who_needed_to_hear_the_flag}`);
  p("");
}

writeFileSync(OUT, out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n");
console.log(`wrote ${OUT} (${scenarios.length} scenarios)`);
