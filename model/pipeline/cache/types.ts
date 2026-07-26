import type { KeyComponents } from "./hash.ts";
import type { Usage } from "./pricing.ts";

/**
 * A committed cache entry. One JSON file per entry under model/pipeline/cache/entries/.
 * These files are audit logs (session rule): once written, never hand-edited.
 *
 * Deliberately excluded: the API key and any request headers. We persist the
 * response, the key components, a timestamp, and token usage — nothing that
 * could leak a credential into version control.
 */
export interface CacheEntry {
  /** SHA-256 cache key; also the filename stem. */
  cache_key: string;
  /** The three hashed components (+ prompt_path for audit). No secrets. */
  key_components: KeyComponents;
  /** ISO-8601 UTC time the entry was first stored (the billed call). */
  stored_at: string;
  /** Token usage of the billed call that produced this response. */
  usage: Usage;
  /** USD billed when this entry was created (0 would mean it was never billed). */
  cost_usd: number;
  /**
   * The SDK response, as returned to callers on a hit. We keep the fields the
   * pipeline consumes — content, stop_reason, model, id — verbatim. Never the
   * request, never headers.
   */
  response: SdkResponse;
}

/** The subset of the Anthropic message response we store and replay. */
export interface SdkResponse {
  id: string;
  model: string;
  role: string;
  stop_reason: string | null;
  content: unknown[];
  /** Usage is also mirrored at entry top level; kept here so the response is self-contained. */
  usage?: unknown;
}

/** What every `complete()` call returns to a pipeline stage. */
export interface CompletionResult {
  response: SdkResponse;
  cacheHit: boolean;
  usage: Usage;
  /** USD attributed to THIS call: 0 on a hit, actual billed cost on a miss. */
  costUsd: number;
  cacheKey: string;
}

/** Rolling per-run tallies, printed as the end-of-run cost report. */
export interface RunTally {
  hits: number;
  misses: number;
  inputTokensBilled: number;
  outputTokensBilled: number;
  runUsd: number;
}
