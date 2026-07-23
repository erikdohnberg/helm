/**
 * Drift taxonomy v1.1 (spec §3), as the enum a DriftEvent carries.
 *
 * Note: "none" (a scenario control label in the eval set) is deliberately NOT
 * here — a control is the absence of a drift event, not an emittable type.
 */
import { z } from "zod";

export const DriftTypeSchema = z.enum([
  "attention_decay",
  "priority_displacement",
  "capacity_withdrawal",
  "commitment_overrun",
  "scope_mutation",
  "reasoning_contradiction",
  "metric_detachment",
]);
export type DriftType = z.infer<typeof DriftTypeSchema>;

/** Human-readable labels, matching the spec §3 table. */
export const DRIFT_TYPE_LABELS: Record<DriftType, string> = {
  attention_decay: "Attention decay",
  priority_displacement: "Priority displacement",
  capacity_withdrawal: "Capacity withdrawal",
  commitment_overrun: "Commitment overrun",
  scope_mutation: "Scope mutation",
  reasoning_contradiction: "Reasoning contradiction",
  metric_detachment: "Metric detachment",
};
