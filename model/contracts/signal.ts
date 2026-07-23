/**
 * Canonical input schema — the model's only input record type (spec §5).
 * Connectors normalize every source into a Signal.
 */
import { z } from "zod";
import { ActorId, NonEmptyString, Timestamp } from "./common.ts";

/** Source types (v1), spec §5. */
export const SourceTypeSchema = z.enum([
  "chat_message",
  "meeting_transcript",
  "document_revision",
  "work_item_event",
  "calendar_event",
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

/** Channel/meeting/doc membership size + which charter owners are present (empty = none). */
export const AudienceSchema = z.object({
  size: z.number().int().nonnegative(),
  owner_overlap_charter_ids: z.array(z.string()),
});
export type Audience = z.infer<typeof AudienceSchema>;

export const SignalSchema = z.object({
  id: NonEmptyString,
  org_id: NonEmptyString,
  occurred_at: Timestamp,
  ingested_at: Timestamp,
  source_type: SourceTypeSchema,
  actors: z.array(ActorId).min(1),
  audience: AudienceSchema,
  content: z.string(),
  thread_ref: z.string().nullable().optional(),
  parent_ref: z.string().nullable().optional(),
  // Source-type-specific, schema'd per type later; open bag for now.
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type Signal = z.infer<typeof SignalSchema>;
