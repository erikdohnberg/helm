/**
 * The cache package's public surface. Pipeline stages import from here and
 * nowhere else — no stage constructs an Anthropic client directly.
 *
 *   import { CachedClient } from "../cache/index.ts";
 *   const client = new CachedClient({ label: "smoke-4scn" });
 *   const { response, cacheHit, costUsd } = await client.complete({ ... });
 *   ...
 *   client.report(); // prints cost report + appends the ledger row
 */
export { CachedClient, BudgetExceededError } from "./client.ts";
export type {
  CachedClientOptions,
  CompleteParams,
} from "./client.ts";
export type {
  CacheEntry,
  CompletionResult,
  RunTally,
  SdkResponse,
} from "./types.ts";
export {
  PRICING,
  costUsd,
  projectedCostUsd,
  ZERO_USAGE,
  type ModelPricing,
  type Usage,
} from "./pricing.ts";
export {
  cacheKey,
  canonicalJson,
  sha256,
  sha256File,
  type KeyComponents,
} from "./hash.ts";
export { appendRun, readCumulativeUsd, type LedgerRow } from "./ledger.ts";
