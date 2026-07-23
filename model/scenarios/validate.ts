/**
 * Scenario validator for the drift eval set.
 *
 * Checks every model/scenarios/scn-*.json file against the scenario schema and
 * cross-checks the set's `ground_truth.drift_type` assignments against the
 * coverage table at the end of §3 of helm-drift-model-spec.md.
 *
 * Run with zero dependencies:
 *   node --experimental-strip-types model/scenarios/validate.ts
 * Exits non-zero and prints every failure if anything is wrong. It never edits
 * data — on a spec-vs-scenario disagreement it reports which side to reconcile.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const SCENARIO_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCENARIO_DIR, "..", "..");
const SPEC_PATH = join(REPO_ROOT, "helm-drift-model-spec.md");

// v1.1 taxonomy: slug -> display name as it appears in the spec coverage table.
const TAXONOMY: Record<string, string> = {
  attention_decay: "Attention decay",
  priority_displacement: "Priority displacement",
  capacity_withdrawal: "Capacity withdrawal",
  commitment_overrun: "Commitment overrun",
  scope_mutation: "Scope mutation",
  reasoning_contradiction: "Reasoning contradiction",
  metric_detachment: "Metric detachment",
};
const CONTROL_KINDS = new Set(["deliberate_replacement", "uncommitted_discussion"]);
const SEVERITIES = new Set(["major", "minor", "none"]);

type Errors = string[];
const errors: Errors = [];
const fail = (id: string, msg: string) => errors.push(`  [${id}] ${msg}`);

// --- Load scenario files -----------------------------------------------------
const files = readdirSync(SCENARIO_DIR)
  .filter((f) => /^scn-\d{3}\.json$/.test(f))
  .sort();

type Scenario = any;
const scenarios: { file: string; data: Scenario }[] = [];
for (const file of files) {
  let data: Scenario;
  try {
    data = JSON.parse(readFileSync(join(SCENARIO_DIR, file), "utf8"));
  } catch (e) {
    fail(file, `invalid JSON: ${(e as Error).message}`);
    continue;
  }
  scenarios.push({ file, data });
}

// --- Per-scenario schema checks ---------------------------------------------
const REQUIRED_TOP = [
  "id",
  "label",
  "company_context",
  "charter",
  "drift",
  "signal_timeline",
  "human_realization",
  "ground_truth",
  "information_asymmetry",
];
const REQUIRED_GT = [
  "is_drift",
  "severity",
  "drift_type",
  "should_flag",
  "earliest_reasonable_flag_signal",
  "flag_rationale",
];

for (const { file, data: s } of scenarios) {
  const id = s?.id ?? basename(file, ".json");

  for (const k of REQUIRED_TOP) {
    if (!(k in s)) fail(id, `missing required field: ${k}`);
  }

  // id shape + filename agreement
  if (typeof s.id !== "string" || !/^scn-\d{3}$/.test(s.id)) {
    fail(id, `id "${s.id}" is not of the form scn-NNN`);
  } else if (s.id !== basename(file, ".json")) {
    fail(id, `id "${s.id}" does not match filename ${file}`);
  }

  // signal_timeline: present, non-empty, well-formed, unique ids, dates ordered
  const timeline = s.signal_timeline;
  const signalIds = new Set<string>();
  if (!Array.isArray(timeline) || timeline.length === 0) {
    fail(id, `signal_timeline must be a non-empty array`);
  } else {
    let prevDate = "";
    for (let i = 0; i < timeline.length; i++) {
      const sig = timeline[i];
      for (const k of ["signal_id", "date", "source", "content", "observability"]) {
        if (!(k in sig)) fail(id, `signal_timeline[${i}] missing ${k}`);
      }
      if (typeof sig.signal_id === "string") {
        if (signalIds.has(sig.signal_id)) fail(id, `duplicate signal_id ${sig.signal_id}`);
        signalIds.add(sig.signal_id);
      }
      if (typeof sig.date === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(sig.date)) {
        fail(id, `signal ${sig.signal_id} has non-ISO date "${sig.date}"`);
      }
      // ISO dates sort lexicographically; require non-decreasing order.
      if (prevDate && typeof sig.date === "string" && sig.date < prevDate) {
        fail(id, `timeline out of order: ${sig.signal_id} (${sig.date}) precedes ${prevDate}`);
      }
      if (typeof sig.date === "string") prevDate = sig.date;
    }
  }

  const gt = s.ground_truth ?? {};
  for (const k of REQUIRED_GT) {
    if (!(k in gt)) fail(id, `ground_truth missing required field: ${k}`);
  }

  // severity value
  if (!SEVERITIES.has(gt.severity)) fail(id, `ground_truth.severity "${gt.severity}" invalid`);

  // drift_type validity + is_drift / control coherence
  const dt = gt.drift_type;
  if (dt === "none") {
    if (gt.is_drift !== false) fail(id, `drift_type "none" but is_drift is ${gt.is_drift}`);
    if (gt.severity !== "none") fail(id, `control has severity "${gt.severity}", expected "none"`);
    if (gt.should_flag !== false) fail(id, `control has should_flag ${gt.should_flag}, expected false`);
    if (!CONTROL_KINDS.has(gt.control_kind)) {
      fail(id, `control_kind "${gt.control_kind}" invalid (expected one of ${[...CONTROL_KINDS].join(", ")})`);
    }
  } else if (dt in TAXONOMY) {
    if (gt.is_drift !== true) fail(id, `drift_type "${dt}" but is_drift is ${gt.is_drift}`);
    if (gt.severity === "none") fail(id, `drift_type "${dt}" but severity is "none"`);
    if ("control_kind" in gt) fail(id, `non-control scenario should not carry control_kind`);
  } else {
    fail(id, `drift_type "${dt}" is not a valid v1.1 taxonomy value`);
  }

  // earliest_reasonable_flag_signal must reference an existing timeline signal
  const earliest = gt.earliest_reasonable_flag_signal;
  if (earliest !== null && earliest !== undefined) {
    if (!signalIds.has(earliest)) {
      fail(id, `earliest_reasonable_flag_signal "${earliest}" not found in signal_timeline`);
    }
    // ... and must precede or equal the human-realization moment.
    const realized = s.human_realization?.first_noticed_date ?? null;
    const sigDate = (timeline ?? []).find((x: any) => x.signal_id === earliest)?.date;
    if (realized && sigDate && sigDate > realized) {
      fail(
        id,
        `earliest_reasonable_flag_signal ${earliest} (${sigDate}) is AFTER human realization (${realized})`
      );
    }
  } else if (gt.is_drift === true) {
    fail(id, `is_drift true but earliest_reasonable_flag_signal is null`);
  }
}

// --- Cross-check: scenario drift_type set vs spec §3 coverage table ----------
type Coverage = { types: Map<string, Set<string>>; controlKinds: Map<string, string> };

function parseCoverageTable(): Coverage | null {
  const spec = readFileSync(SPEC_PATH, "utf8");
  const start = spec.indexOf("### Coverage against the eval set");
  if (start === -1) return null;
  const rest = spec.slice(start);
  const end = rest.indexOf("\n---");
  const section = end === -1 ? rest : rest.slice(0, end);

  const nameToSlug = new Map<string, string>();
  for (const [slug, name] of Object.entries(TAXONOMY)) nameToSlug.set(name.toLowerCase(), slug);

  const types = new Map<string, Set<string>>();
  for (const slug of Object.keys(TAXONOMY)) types.set(slug, new Set());
  const controlIds = new Set<string>();
  const controlKinds = new Map<string, string>();

  for (const line of section.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").map((c) => c.trim());
    // cells[0] is empty (leading |); [1]=type, [2]=scenarios, [3]=status
    const rawType = (cells[1] ?? "").replace(/[*`]/g, "").trim();
    const scen = cells[2] ?? "";
    if (!rawType || rawType.toLowerCase() === "type" || /^-+$/.test(rawType)) continue;

    const ids = (scen.match(/\d{3}/g) ?? []).map((n) => `scn-${n}`);

    if (rawType.toLowerCase().includes("non-drift control")) {
      // e.g. "008 (deliberate replacement), 009 (uncommitted discussion)"
      for (const m of scen.matchAll(/(\d{3})\s*\(([^)]+)\)/g)) {
        const sid = `scn-${m[1]}`;
        controlIds.add(sid);
        controlKinds.set(sid, m[2].trim().toLowerCase().replace(/\s+/g, "_"));
      }
      continue;
    }
    const slug = nameToSlug.get(rawType.toLowerCase());
    if (!slug) {
      errors.push(`  [spec §3] coverage table row "${rawType}" is not a known v1.1 type`);
      continue;
    }
    for (const sid of ids) types.get(slug)!.add(sid);
  }
  types.set("__control__", controlIds);
  return { types, controlKinds };
}

const cov = parseCoverageTable();
if (!cov) {
  errors.push(`  [spec §3] could not locate "### Coverage against the eval set" table`);
} else {
  // Build actual assignments from scenario files.
  const actual = new Map<string, Set<string>>();
  for (const slug of Object.keys(TAXONOMY)) actual.set(slug, new Set());
  const actualControl = new Set<string>();
  const actualControlKinds = new Map<string, string>();
  for (const { data: s } of scenarios) {
    const dt = s.ground_truth?.drift_type;
    if (dt === "none") {
      actualControl.add(s.id);
      if (s.ground_truth?.control_kind) actualControlKinds.set(s.id, s.ground_truth.control_kind);
    } else if (actual.has(dt)) {
      actual.get(dt)!.add(s.id);
    }
  }

  const setEq = (a: Set<string>, b: Set<string>) =>
    a.size === b.size && [...a].every((x) => b.has(x));
  const diff = (a: Set<string>, b: Set<string>) => [...a].filter((x) => !b.has(x));

  for (const slug of Object.keys(TAXONOMY)) {
    const specSet = cov.types.get(slug)!;
    const jsonSet = actual.get(slug)!;
    if (!setEq(specSet, jsonSet)) {
      const onlySpec = diff(specSet, jsonSet);
      const onlyJson = diff(jsonSet, specSet);
      errors.push(`  [coverage] ${TAXONOMY[slug]} disagrees:`);
      if (onlySpec.length)
        errors.push(
          `      spec §3 lists ${onlySpec.join(", ")} here but no scenario file asserts it → reconcile the spec table or add the drift_type`
        );
      if (onlyJson.length)
        errors.push(
          `      scenario file(s) ${onlyJson.join(", ")} assert this drift_type but spec §3 does not list them → reconcile the scenario file or the spec table`
        );
    }
  }

  // Controls
  const specControl = cov.types.get("__control__")!;
  if (!setEq(specControl, actualControl)) {
    const onlySpec = diff(specControl, actualControl);
    const onlyJson = diff(actualControl, specControl);
    errors.push(`  [coverage] non-drift controls disagree:`);
    if (onlySpec.length) errors.push(`      spec §3 lists ${onlySpec.join(", ")} as control but scenario file is not drift_type "none"`);
    if (onlyJson.length) errors.push(`      scenario(s) ${onlyJson.join(", ")} are drift_type "none" but spec §3 does not list them as controls`);
  }
  for (const [sid, kind] of cov.controlKinds) {
    const actualKind = actualControlKinds.get(sid);
    if (actualKind && actualKind !== kind) {
      errors.push(
        `  [coverage] ${sid} control_kind "${actualKind}" disagrees with spec §3 annotation "${kind}" → reconcile the scenario file or the spec table`
      );
    }
  }
}

// --- Report ------------------------------------------------------------------
if (errors.length) {
  console.error(`\nFAIL — ${errors.length} problem(s) across ${scenarios.length} scenario file(s):\n`);
  console.error(errors.join("\n"));
  console.error("");
  process.exit(1);
}

console.log(`PASS — ${scenarios.length} scenarios valid; drift_type assignments agree with spec §3 coverage table.`);
for (const slug of Object.keys(TAXONOMY)) {
  const ids = [...cov!.types.get(slug)!].sort();
  console.log(`  ${TAXONOMY[slug].padEnd(24)} ${ids.length ? ids.join(", ") : "— (gap)"}`);
}
console.log(`  ${"non-drift control".padEnd(24)} ${[...cov!.types.get("__control__")!].sort().join(", ")}`);
