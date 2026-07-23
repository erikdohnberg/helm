/**
 * Contracts — the only interface between pipeline stages and downstream
 * consumers (spec §4, §5, §9). Schemas are zod (runtime validation); the
 * matching TypeScript types are inferred from them, so there is one source of
 * truth per contract.
 */
export { CONTRACTS_VERSION } from "./version.ts";

export { IsoDate, Timestamp, ActorId, NonEmptyString } from "./common.ts";

export { DriftTypeSchema, DRIFT_TYPE_LABELS } from "./taxonomy.ts";
export type { DriftType } from "./taxonomy.ts";

export { SourceTypeSchema, AudienceSchema, SignalSchema } from "./signal.ts";
export type { SourceType, Audience, Signal } from "./signal.ts";

export {
  SuccessMetricSchema,
  ReasoningClaimSchema,
  BaselineProfileSchema,
  CharterStatusSchema,
  CharterSchema,
} from "./charter.ts";
export type {
  SuccessMetric,
  ReasoningClaim,
  BaselineProfile,
  CharterStatus,
  Charter,
} from "./charter.ts";

export {
  SeveritySchema,
  EvidenceSchema,
  SuggestedRecipientSchema,
  DriftEventSchema,
  AlignmentTrendSchema,
  CharterStateSchema,
  CompetingTopicSchema,
  CoverageSchema,
  DriftReportSchema,
} from "./drift-report.ts";
export type {
  Severity,
  Evidence,
  SuggestedRecipient,
  DriftEvent,
  AlignmentTrend,
  CharterState,
  CompetingTopic,
  Coverage,
  DriftReport,
} from "./drift-report.ts";
