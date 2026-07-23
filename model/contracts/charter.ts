/**
 * Reference state — the charter as a structured object (spec §4).
 * The model compares observed behavior against these.
 */
import { z } from "zod";
import { ActorId, IsoDate, NonEmptyString } from "./common.ts";
import { SourceTypeSchema } from "./signal.ts";

/** name + target value + current value if known (spec §4). */
export const SuccessMetricSchema = z.object({
  name: NonEmptyString,
  target_value: z.union([z.string(), z.number()]),
  current_value: z.union([z.string(), z.number()]).nullable().optional(),
});
export type SuccessMetric = z.infer<typeof SuccessMetricSchema>;

/** Expected signal profile, learned in the first N weeks (spec §4/§7). Null during calibration. */
export const BaselineProfileSchema = z.object({
  activity_level: z.number().nonnegative(),
  active_actors: z.array(ActorId),
  typical_sources: z.array(SourceTypeSchema),
});
export type BaselineProfile = z.infer<typeof BaselineProfileSchema>;

/**
 * A discrete, independently contradictable reasoning claim (spec §4). The id
 * lets a reasoning_contradiction DriftEvent cite exactly which claim collided.
 */
export const ReasoningClaimSchema = z.object({
  id: NonEmptyString,
  claim: NonEmptyString,
});
export type ReasoningClaim = z.infer<typeof ReasoningClaimSchema>;

export const CharterStatusSchema = z.enum(["Anchored", "Adrift", "Retired"]);
export type CharterStatus = z.infer<typeof CharterStatusSchema>;

export const CharterSchema = z.object({
  id: NonEmptyString,
  org_id: NonEmptyString,
  quarter: NonEmptyString,
  outcome_statement: NonEmptyString,
  success_metric: SuccessMetricSchema,
  // Discrete claims, not one blob — each independently contradictable (spec §4).
  reasoning: z.array(ReasoningClaimSchema).min(1),
  // What was explicitly stopped or declined.
  trade_offs: z.array(NonEmptyString),
  owners: z.array(ActorId).min(1),
  // Living list of names/phrases the org uses for this outcome (spec §4).
  aliases: z.array(z.string()),
  anchored_at: IsoDate,
  status: CharterStatusSchema,
  baseline: BaselineProfileSchema.nullable(),
});
export type Charter = z.infer<typeof CharterSchema>;
