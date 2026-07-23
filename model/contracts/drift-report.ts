/**
 * Output contract — the daily, per-org DriftReport and its parts (spec §9).
 * This is the only interface downstream products (nudges, alignment threads,
 * memory records) get.
 */
import { z } from "zod";
import { ActorId, IsoDate, NonEmptyString, Timestamp } from "./common.ts";
import { DriftTypeSchema } from "./taxonomy.ts";
import { SourceTypeSchema } from "./signal.ts";

/** Event severity. "none" is non-drift and is never an emitted event. */
export const SeveritySchema = z.enum(["minor", "major"]);
export type Severity = z.infer<typeof SeveritySchema>;

/**
 * A citable span: the quoted signal fragment an event is derived from. Full
 * auditability is a hard rule — no extraction without a quote (spec §6).
 */
export const EvidenceSchema = z.object({
  signal_id: NonEmptyString,
  quote: NonEmptyString,
  source: NonEmptyString,
  occurred_at: Timestamp,
});
export type Evidence = z.infer<typeof EvidenceSchema>;

/**
 * ADDITION (not in the spec's original §9): who a drift event should route to.
 * The eval set scores routing — a flag that reaches only the side already
 * holding half the picture hasn't closed the gap.
 */
export const SuggestedRecipientSchema = z.object({
  actor_id: ActorId,
  reason: NonEmptyString,
});
export type SuggestedRecipient = z.infer<typeof SuggestedRecipientSchema>;

export const DriftEventSchema = z
  .object({
    id: NonEmptyString,
    charter_id: NonEmptyString,
    // Exactly one primary type; secondary types allowed (spec §3).
    drift_type: DriftTypeSchema,
    secondary_types: z.array(DriftTypeSchema).default([]),
    severity: SeveritySchema,
    confidence: z.number().min(0).max(1),
    // Every event must cite at least one signal (hard rule; spec §6).
    evidence: z.array(EvidenceSchema).min(1),
    suggested_recipients: z.array(SuggestedRecipientSchema).min(1),
    // Charter reasoning-claim ids this event contradicts. Present only when
    // reasoning_contradiction is the primary or a secondary type.
    contradicted_claim_ids: z.array(z.string()).optional(),
  })
  .refine(
    (e) =>
      !e.contradicted_claim_ids ||
      e.contradicted_claim_ids.length === 0 ||
      e.drift_type === "reasoning_contradiction" ||
      e.secondary_types.includes("reasoning_contradiction"),
    {
      message:
        "contradicted_claim_ids is only valid when reasoning_contradiction is the primary or a secondary type",
      path: ["contradicted_claim_ids"],
    }
  );
export type DriftEvent = z.infer<typeof DriftEventSchema>;

export const AlignmentTrendSchema = z.enum(["improving", "stable", "declining"]);
export type AlignmentTrend = z.infer<typeof AlignmentTrendSchema>;

export const CharterStateSchema = z.object({
  charter_id: NonEmptyString,
  alignment_score: z.number().min(0).max(1),
  alignment_trend: AlignmentTrendSchema,
  // Ratio of current activity to baseline; null during the calibration window.
  activity_vs_baseline: z.number().nonnegative().nullable(),
  open_items: z.array(z.string()),
});
export type CharterState = z.infer<typeof CharterStateSchema>;

export const CompetingTopicSchema = z.object({
  id: NonEmptyString,
  label: NonEmptyString,
  activity_level: z.number().nonnegative(),
  actors: z.array(ActorId),
  first_seen: IsoDate,
});
export type CompetingTopic = z.infer<typeof CompetingTopicSchema>;

/**
 * Coverage block (spec §9): consumers must be able to tell "no drift" from
 * "no data". by_source_type is keyed by source_type string.
 */
export const CoverageSchema = z.object({
  sources_ingested: z.array(SourceTypeSchema),
  signal_counts: z.object({
    total: z.number().int().nonnegative(),
    by_source_type: z.record(z.string(), z.number().int().nonnegative()),
  }),
  gaps: z.object({
    missed_batches: z.array(IsoDate),
    excluded_spaces: z.array(z.string()),
  }),
});
export type Coverage = z.infer<typeof CoverageSchema>;

export const DriftReportSchema = z.object({
  org_id: NonEmptyString,
  run_date: IsoDate,
  model_version: NonEmptyString,
  // The contracts version this report's shape conforms to (see version.ts).
  contracts_version: NonEmptyString,
  charter_states: z.array(CharterStateSchema),
  drift_events: z.array(DriftEventSchema),
  competing_topics: z.array(CompetingTopicSchema),
  coverage: CoverageSchema,
});
export type DriftReport = z.infer<typeof DriftReportSchema>;
