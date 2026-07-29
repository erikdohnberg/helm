import run from "@/model/eval/results/2026-07-26-pipeline-v1-1.1.1/scorecard.json";

/**
 * The evaluation run the public record reports on.
 *
 * The date, version and case count are read from the run's own
 * `scorecard.json` rather than typed into the page, because a hand-typed date
 * on a record about honesty is exactly the thing that goes stale first. To
 * publish a newer run, change the import above and nothing else.
 */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/**
 * `2026-07-26` → `26 Jul`. Day, short month, no year — and parsed from the
 * string's own parts, so a timezone never shifts the date by a day.
 */
function formatRunDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day} ${MONTHS[Number(month) - 1]}`;
}

/** The date the detector was run, not the date the page was written. */
export const RUN_DATE = formatRunDate(run.run_date);

/** e.g. `v1.1.1` */
export const DETECTOR_VERSION = `v${run.detector.version}`;

/** 13 — eleven drift cases plus two traps. */
export const CASE_COUNT = run.totals.scenarios;
