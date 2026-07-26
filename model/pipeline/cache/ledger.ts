/**
 * The running spend ledger at model/pipeline/cache/LEDGER.md.
 *
 * Append-only (session rule): every run adds exactly one row and no existing
 * row is ever rewritten. Cumulative spend is carried from the last row, so the
 * ledger — not any in-memory state — is the source of truth for lifetime spend.
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

export interface LedgerRow {
  timestamp: string;
  label: string;
  hits: number;
  misses: number;
  inputTokensBilled: number;
  outputTokensBilled: number;
  runUsd: number;
  cumulativeUsd: number;
}

const HEADER = [
  "# Cache Spend Ledger",
  "",
  "Append-only. One row per run; cumulative spend is carried from the row above.",
  "Never edit or delete a past row — this is the audit trail of real dollars spent.",
  "",
  "| timestamp (UTC) | run | hits | misses | input tok | output tok | run $ | cumulative $ |",
  "|---|---|---:|---:|---:|---:|---:|---:|",
].join("\n");

/** Parse the cumulative $ of the last data row, or 0 if the ledger has no rows yet. */
export function readCumulativeUsd(ledgerPath: string): number {
  if (!existsSync(ledgerPath)) return 0;
  const lines = readFileSync(ledgerPath, "utf8").split("\n");
  const dataRows = lines.filter(
    (l) => l.startsWith("|") && !l.includes("---") && !/\|\s*timestamp/i.test(l)
  );
  const last = dataRows.at(-1);
  if (!last) return 0;
  const cells = last.split("|").map((c) => c.trim());
  // trailing cell is cumulative $
  const cum = Number(cells.at(-2)?.replace(/[^0-9.]/g, ""));
  return Number.isFinite(cum) ? cum : 0;
}

/**
 * Append one run's row. Reads the prior cumulative from the file itself
 * (append-only), adds this run's spend, and writes the new row. Creates the
 * header if the ledger does not exist yet.
 */
export function appendRun(
  ledgerPath: string,
  run: {
    timestamp: string;
    label: string;
    hits: number;
    misses: number;
    inputTokensBilled: number;
    outputTokensBilled: number;
    runUsd: number;
  }
): LedgerRow {
  if (!existsSync(ledgerPath)) writeFileSync(ledgerPath, HEADER + "\n");
  const cumulativeUsd = readCumulativeUsd(ledgerPath) + run.runUsd;
  const row: LedgerRow = { ...run, cumulativeUsd };
  const line =
    `| ${row.timestamp} | ${row.label} | ${row.hits} | ${row.misses} | ` +
    `${row.inputTokensBilled} | ${row.outputTokensBilled} | ` +
    `$${row.runUsd.toFixed(4)} | $${row.cumulativeUsd.toFixed(4)} |\n`;
  appendFileSync(ledgerPath, line);
  return row;
}
