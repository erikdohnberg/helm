/**
 * Runs the v0 inactivity baseline across N in {5, 7, 10, 14} and writes a
 * scorecard for each into model/eval/results/.
 *
 *   node --experimental-strip-types model/detectors/v0-inactivity/run-baseline.ts [run-date]
 */
import { runHarness } from "../../eval/run.ts";
import { v0InactivityDetector } from "./index.ts";

const N_VALUES = [5, 7, 10, 14];

const runDate =
  process.argv[2] && /^\d{4}-\d{2}-\d{2}$/.test(process.argv[2])
    ? process.argv[2]
    : new Date().toISOString().slice(0, 10);

for (const n of N_VALUES) {
  const { card, dir } = runHarness(v0InactivityDetector(n), runDate);
  const m = card.metrics;
  console.log(
    `N=${String(n).padStart(2)}  recall ${(m.detection_recall * 100).toFixed(0)}%  ` +
      `precision ${m.precision_proxy === null ? "n/a" : (m.precision_proxy * 100).toFixed(0) + "%"}  ` +
      `medLead ${m.median_lead_time_days ?? "n/a"}  ctrlFP ${m.control_false_positive_count}  ` +
      `hardFail ${m.control_hard_failures}  type ${m.type_accuracy === null ? "n/a" : (m.type_accuracy * 100).toFixed(0) + "%"}  ` +
      `-> ${dir.split("/").slice(-1)[0]}`
  );
}
