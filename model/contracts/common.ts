/**
 * Shared primitive schemas used across the contracts.
 */
import { z } from "zod";

/** Calendar date, e.g. "2026-07-14". */
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected an ISO date (YYYY-MM-DD)");

/** A date or datetime that Date.parse accepts, e.g. "2026-07-14" or "2026-07-14T09:00:00Z". */
export const Timestamp = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), "expected an ISO date or datetime");

/** Stable person id (identity resolution is a connector concern; see §5). */
export const ActorId = z.string().min(1);

export const NonEmptyString = z.string().min(1);
