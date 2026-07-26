/**
 * Pipeline Stages 2 and 3 (spec §6), each a single cached LLM call.
 *
 * Stage 2 — relevance mapping: for a charter and a batch of signals, decide which
 *           signals are relevant to that outcome (topical, may run through the
 *           charter's recorded trade-offs / reasoning, not just its vocabulary).
 * Stage 3 — evidence extraction: for the relevant signals, extract typed evidence,
 *           each carrying a verbatim quote span from the signal content.
 *
 * Both call the SDK ONLY through the CachedClient — no stage touches Anthropic
 * directly. Outputs are validated with zod so a malformed model reply fails here
 * rather than silently downstream.
 */
import { z } from "zod";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { CachedClient } from "./cache/client.ts";
import type { Charter, Signal } from "../contracts/index.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
export const STAGE2_PROMPT = join(HERE, "prompts", "stage2-relevance.md");
export const STAGE3_PROMPT = join(HERE, "prompts", "stage3-evidence.md");

// ---- Stage 2 output contract ------------------------------------------------

export const RelevanceBasis = z.enum([
  "outcome",
  "metric",
  "reasoning",
  "trade_off",
  "unrelated",
]);

export const RelevanceMappingSchema = z.object({
  signal_id: z.string(),
  relevant: z.boolean(),
  confidence: z.number().min(0).max(1),
  basis: RelevanceBasis,
  rationale: z.string(),
});
export type RelevanceMapping = z.infer<typeof RelevanceMappingSchema>;

const Stage2ReplySchema = z.object({ mappings: z.array(RelevanceMappingSchema) });

// ---- Stage 3 output contract ------------------------------------------------

export const EvidenceType = z.enum([
  "progress",
  "blocker",
  "decision",
  "deprioritization_cue",
  "contradiction",
  "competing_priority",
  "metric_reference",
]);

export const ExtractionSchema = z.object({
  type: EvidenceType,
  quote: z.string(),
  reasoning: z.string(),
  contradicts_claim: z.string().nullable().default(null),
  competing_topic: z.string().nullable().default(null),
});
export type Extraction = z.infer<typeof ExtractionSchema>;

export const SignalExtractionsSchema = z.object({
  signal_id: z.string(),
  extractions: z.array(ExtractionSchema),
});
export type SignalExtractions = z.infer<typeof SignalExtractionsSchema>;

const Stage3ReplySchema = z.object({ signals: z.array(SignalExtractionsSchema) });

// ---- Shared helpers ---------------------------------------------------------

/** Concatenate the text blocks of an SDK response (ignores any thinking blocks). */
function responseText(content: unknown[]): string {
  return content
    .map((b) =>
      b && typeof b === "object" && "type" in b && (b as { type: string }).type === "text"
        ? (b as unknown as { text: string }).text
        : ""
    )
    .join("");
}

/** Pull the single JSON object out of a model reply (fenced or bare). Throws if none parses. */
export function parseJsonReply(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`no JSON object found in model reply: ${text.slice(0, 200)}…`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

/** Render the charter into the compact block both prompts consume. */
function charterBlock(charter: Charter): string {
  return JSON.stringify(
    {
      outcome: charter.outcome_statement,
      metric: charter.success_metric,
      reasoning: charter.reasoning,
      trade_offs: charter.trade_offs,
      aliases: charter.aliases,
    },
    null,
    2
  );
}

function signalsBlock(signals: Signal[]): string {
  return JSON.stringify(
    signals.map((s) => ({
      signal_id: s.metadata?.scenario_signal_id ?? s.id,
      date: s.occurred_at,
      source: s.metadata?.original_source ?? s.source_type,
      content: s.content,
    })),
    null,
    2
  );
}

// Stage 2 replies are one short object per signal — 1200 is ample.
// Stage 3 emits typed extractions with verbatim quote spans for every relevant
// signal, so its reply is far larger; 1200 truncated the JSON array mid-element
// (out == 1200 exactly). Give it real headroom, still under the client's
// streaming threshold (16k) so it stays a single non-streamed call.
const STAGE2_MAX_TOKENS = 1200;
const STAGE3_MAX_TOKENS = 8000;

// ---- Stage 2 ----------------------------------------------------------------

export async function mapRelevance(
  client: CachedClient,
  charter: Charter,
  signals: Signal[]
): Promise<{ mappings: RelevanceMapping[]; costUsd: number; cacheHit: boolean }> {
  const promptText = readPrompt(STAGE2_PROMPT);
  const user =
    `CHARTER:\n${charterBlock(charter)}\n\n` +
    `SIGNALS:\n${signalsBlock(signals)}\n\n` +
    `Map every signal. Return the JSON object described in the instructions.`;

  const result = await client.complete({
    promptPath: STAGE2_PROMPT,
    system: promptText,
    messages: [{ role: "user", content: user }],
    maxTokens: STAGE2_MAX_TOKENS,
  });

  const parsed = Stage2ReplySchema.parse(parseJsonReply(responseText(result.response.content)));
  return { mappings: parsed.mappings, costUsd: result.costUsd, cacheHit: result.cacheHit };
}

// ---- Stage 3 ----------------------------------------------------------------

export async function extractEvidence(
  client: CachedClient,
  charter: Charter,
  signals: Signal[]
): Promise<{ signals: SignalExtractions[]; costUsd: number; cacheHit: boolean }> {
  const promptText = readPrompt(STAGE3_PROMPT);
  const user =
    `CHARTER:\n${charterBlock(charter)}\n\n` +
    `RELEVANT SIGNALS:\n${signalsBlock(signals)}\n\n` +
    `Extract typed evidence with verbatim quote spans. Return the JSON object described.`;

  const result = await client.complete({
    promptPath: STAGE3_PROMPT,
    system: promptText,
    messages: [{ role: "user", content: user }],
    maxTokens: STAGE3_MAX_TOKENS,
  });

  const parsed = Stage3ReplySchema.parse(parseJsonReply(responseText(result.response.content)));
  return { signals: parsed.signals, costUsd: result.costUsd, cacheHit: result.cacheHit };
}

// The prompt file text is also hashed into the cache key by the client (via
// promptPath), so this text and that hash stay in lockstep.
function readPrompt(path: string): string {
  return readFileSync(path, "utf8");
}
