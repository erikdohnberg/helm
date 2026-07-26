/**
 * Model pricing and cost accounting.
 *
 * Rates are USD per 1M tokens, taken from the published Anthropic price list for
 * the pinned model. Cache-read/-write rates are the standard multipliers of the
 * input rate (server-side prompt cache): write 1.25x, read 0.10x. We do not use
 * server-side prompt caching in pipeline calls today, so those token counts are
 * normally zero — but we price them so the cost report stays honest if they ever
 * appear.
 *
 * This is the single place cost is computed; the cache client and the ledger
 * both read from here so a dollar figure means the same thing everywhere.
 */
export interface ModelPricing {
  /** USD per 1M input tokens. */
  inputPerMTok: number;
  /** USD per 1M output tokens. */
  outputPerMTok: number;
}

/**
 * Pinned-model price list. Keyed by the exact model id we send to the SDK.
 * A model id absent here is a hard error at cost time — we never guess a price.
 */
export const PRICING: Record<string, ModelPricing> = {
  // Claude Opus 4.8 — the pinned pipeline model. $5 / $25 per 1M tok.
  "claude-opus-4-8": { inputPerMTok: 5, outputPerMTok: 25 },
};

/** Token usage as reported by the SDK `usage` object (only the fields we bill on). */
export interface Usage {
  input_tokens: number;
  output_tokens: number;
  /** Present only when server-side prompt caching is in play; normally 0. */
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export const ZERO_USAGE: Usage = {
  input_tokens: 0,
  output_tokens: 0,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 0,
};

/** USD cost of one call's usage against the pinned model. Throws on unknown model. */
export function costUsd(model: string, usage: Usage): number {
  const p = PRICING[model];
  if (!p) {
    throw new Error(
      `No pricing for model "${model}". Add it to PRICING before billing against it.`
    );
  }
  const inputRate = p.inputPerMTok / 1_000_000;
  const outputRate = p.outputPerMTok / 1_000_000;
  const cacheWriteRate = inputRate * 1.25;
  const cacheReadRate = inputRate * 0.1;
  return (
    (usage.input_tokens ?? 0) * inputRate +
    (usage.output_tokens ?? 0) * outputRate +
    (usage.cache_creation_input_tokens ?? 0) * cacheWriteRate +
    (usage.cache_read_input_tokens ?? 0) * cacheReadRate
  );
}

/**
 * Conservative upper-bound cost of a call we have NOT made yet, for the spend
 * guard. We overestimate input tokens from the serialized request bytes
 * (~3 chars/token is deliberately low, so the token estimate runs high) and
 * assume the full `max_tokens` of output. Erring high means the guard halts
 * early rather than sliding past the cap.
 */
export function projectedCostUsd(
  model: string,
  requestBytes: number,
  maxTokens: number
): number {
  const estInputTokens = Math.ceil(requestBytes / 3);
  return costUsd(model, { input_tokens: estInputTokens, output_tokens: maxTokens });
}

export function addUsage(a: Usage, b: Usage): Usage {
  return {
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_creation_input_tokens:
      (a.cache_creation_input_tokens ?? 0) + (b.cache_creation_input_tokens ?? 0),
    cache_read_input_tokens:
      (a.cache_read_input_tokens ?? 0) + (b.cache_read_input_tokens ?? 0),
  };
}
