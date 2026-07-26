/**
 * Content hashing for cache keys. All hashes are SHA-256 hex.
 *
 * The cache key is a hash of three components (spec: cached-replay policy):
 *   1. the pinned model id,
 *   2. the prompt FILE CONTENT hash — the actual bytes, never a version label,
 *      so an unversioned prompt edit changes the key and can't serve stale, and
 *   3. the full rendered input (messages + generation params) sent to the model.
 *
 * Because every component is content-derived, the key is identical across
 * machines and sessions — that is what lets a fresh clone replay at $0.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** Hash of a file's raw bytes — the prompt-content hash. */
export function sha256File(path: string): string {
  return sha256(readFileSync(path));
}

/**
 * Canonical JSON: object keys sorted recursively so two logically-identical
 * requests serialize to the same bytes (and hash the same) regardless of key
 * order. Arrays keep their order (order is meaningful in messages).
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      out[k] = sortKeys((value as Record<string, unknown>)[k]);
    }
    return out;
  }
  return value;
}

/** The three key components, hashed together into the cache key. */
export interface KeyComponents {
  model: string;
  /** Path (relative to the model package) the prompt was read from — audit only, not hashed. */
  prompt_path: string;
  /** SHA-256 of the prompt file bytes. */
  prompt_sha256: string;
  /** SHA-256 of the canonical rendered input (messages + generation params). */
  input_sha256: string;
}

/** cache_key = sha256(model \n prompt_sha256 \n input_sha256). prompt_path is not hashed. */
export function cacheKey(c: KeyComponents): string {
  return sha256(`${c.model}\n${c.prompt_sha256}\n${c.input_sha256}`);
}
