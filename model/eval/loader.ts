/**
 * Scenario loader: reads model/scenarios/*.json into contract types.
 *
 * Charters map to the Charter contract; timeline signals map to the Signal
 * contract (source strings like "slack:#growth-pod" -> source_type enums, with
 * the original kept in metadata). Everything is validated through the zod
 * contracts, so a scenario that can't be represented as valid contract data
 * fails loudly here rather than silently downstream.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CharterSchema,
  SignalSchema,
  SourceTypeSchema,
  type Charter,
  type Signal,
  type SourceType,
} from "../contracts/index.ts";

export const SCENARIOS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "scenarios");

export interface LoadedScenario {
  /** The raw scenario JSON, kept for ground-truth scoring. */
  scenario: any;
  charter: Charter;
  signals: Signal[];
}

const SOURCE_PREFIX: Record<string, SourceType> = {
  slack: "chat_message",
  doc: "document_revision",
  meeting: "meeting_transcript",
  calendar: "calendar_event",
  ticket: "work_item_event",
  work: "work_item_event",
};

export function mapSourceType(source: string): SourceType {
  const prefix = source.split(":")[0]?.toLowerCase() ?? "";
  const st = SOURCE_PREFIX[prefix];
  if (!st) throw new Error(`loader: unknown source prefix "${prefix}" in "${source}"`);
  return SourceTypeSchema.parse(st);
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** "Priya Nair (PM)" -> "actor-priya-nair" (role parenthetical dropped). */
export function actorIdFor(person: string): string {
  return "actor-" + slug(person.replace(/\s*\([^)]*\)\s*/g, "").trim());
}

function toCharter(scn: any): Charter {
  const c = scn.charter;
  const owners = Array.from(new Set([actorIdFor(c.outcome_owner), actorIdFor(c.decision_owner)]));
  return CharterSchema.parse({
    id: `${scn.id}-charter`,
    org_id: "org-" + slug(scn.company_context.name),
    quarter: c.timeframe,
    outcome_statement: c.outcome,
    success_metric: { name: c.metric, target_value: c.target, current_value: c.baseline },
    // Charters carry discrete { id, claim } reasoning (contracts §4); pass through.
    reasoning: c.reasoning.map((r: any) => ({ id: r.id, claim: r.claim })),
    trade_offs: c.trade_offs ?? [],
    owners,
    // Title plus the charter's declared aliases (both derived only from the
    // charter's own text — see spec §4 and _meta.json changelog).
    aliases: Array.from(new Set([c.title, ...(c.aliases ?? [])])),
    anchored_at: c.anchored_on,
    status: "Anchored",
    baseline: null,
  });
}

function toSignals(scn: any): Signal[] {
  const orgId = "org-" + slug(scn.company_context.name);
  return scn.signal_timeline.map((sig: any) =>
    SignalSchema.parse({
      id: `${scn.id}-${sig.signal_id}`,
      org_id: orgId,
      occurred_at: sig.date,
      ingested_at: sig.date,
      source_type: mapSourceType(sig.source),
      // Actor/audience resolution is a connector concern absent from the seed
      // scenarios; a placeholder keeps the Signal contract-valid without
      // fabricating specific people.
      actors: ["actor-unknown"],
      audience: { size: 1, owner_overlap_charter_ids: [] },
      content: sig.content,
      thread_ref: null,
      parent_ref: null,
      metadata: {
        original_source: sig.source,
        observability: sig.observability,
        scenario_signal_id: sig.signal_id,
      },
    })
  );
}

export function loadScenario(scn: any): LoadedScenario {
  return { scenario: scn, charter: toCharter(scn), signals: toSignals(scn) };
}

export function loadScenarioFile(path: string): LoadedScenario {
  return loadScenario(JSON.parse(readFileSync(path, "utf8")));
}

export function loadAllScenarios(dir: string = SCENARIOS_DIR): LoadedScenario[] {
  return readdirSync(dir)
    .filter((f) => /^scn-\d{3}\.json$/.test(f))
    .sort()
    .map((f) => loadScenarioFile(join(dir, f)));
}
