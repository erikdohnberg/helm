/**
 * The cached Anthropic client — the ONLY path from a pipeline stage to the SDK.
 *
 * No stage constructs an Anthropic client directly. Every inference call goes
 * through `CachedClient.complete()`, which:
 *   1. loads the project `.env` itself (so runs work from any terminal),
 *   2. computes a content-addressed cache key from (pinned model id + prompt
 *      file BYTES hash + the full rendered request),
 *   3. on a hit, replays the committed JSON entry at $0,
 *   4. on a miss, enforces the per-run budget cap, calls the SDK, stores the
 *      entry as a committed JSON file, and bills the real token usage,
 *   5. tallies hits/misses/tokens/dollars for the end-of-run cost report.
 *
 * Cache entries are audit logs (session rule): written once, never hand-edited.
 * They contain the response, key components, timestamp, and usage — never the
 * API key, never request headers.
 */
import Anthropic from "@anthropic-ai/sdk";
import { config as loadDotenv } from "dotenv";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  cacheKey,
  canonicalJson,
  sha256,
  sha256File,
  type KeyComponents,
} from "./hash.ts";
import { appendRun } from "./ledger.ts";
import {
  addUsage,
  costUsd,
  projectedCostUsd,
  ZERO_USAGE,
  type Usage,
} from "./pricing.ts";
import type {
  CacheEntry,
  CompletionResult,
  RunTally,
  SdkResponse,
} from "./types.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Walk up from a start dir until a `.env` (or `.git`) is found; that's repo root. */
function findRepoRoot(start: string): string {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, ".env")) || existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return start; // hit filesystem root; give up gracefully
    dir = parent;
  }
}

const REPO_ROOT = findRepoRoot(HERE);
const DEFAULT_ENTRIES_DIR = join(HERE, "entries");
const DEFAULT_LEDGER_PATH = join(HERE, "LEDGER.md");

/**
 * The slice of the Anthropic SDK the client actually calls. Declaring it as an
 * interface lets tests inject a stub without a real key or a network call —
 * the real SDK satisfies this shape structurally.
 */
export interface SdkLike {
  messages: {
    create(body: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message>;
    stream(body: Anthropic.MessageCreateParamsStreaming | Anthropic.MessageCreateParamsNonStreaming): {
      finalMessage(): Promise<Anthropic.Message>;
    };
  };
}

/** Thrown when a call would push the run past its budget cap. Caller reports and stops. */
export class BudgetExceededError extends Error {
  readonly spentUsd: number;
  readonly projectedUsd: number;
  readonly capUsd: number;

  constructor(message: string, spentUsd: number, projectedUsd: number, capUsd: number) {
    super(message);
    this.name = "BudgetExceededError";
    this.spentUsd = spentUsd;
    this.projectedUsd = projectedUsd;
    this.capUsd = capUsd;
  }
}

export interface CachedClientOptions {
  /** Pinned model id. Must be present in PRICING. */
  model?: string;
  /** Per-run budget cap in USD. Default $2. Raised explicitly per run by the operator. */
  budgetUsd?: number;
  /** Short label for the ledger row / cost report (e.g. "smoke-4scn"). */
  label?: string;
  /**
   * Directory for committed JSON cache entries. Defaults to the package's
   * `entries/`. Tests point this at a temp dir so they never touch the
   * committed audit log.
   */
  entriesDir?: string;
  /** Ledger file to append to. Defaults to the package `LEDGER.md`. Overridden in tests. */
  ledgerPath?: string;
  /**
   * Inject an SDK stub (tests). When set, the client never loads `.env`, never
   * requires a key, and never touches the network — it calls this instead.
   */
  sdk?: SdkLike;
}

/** The request a stage hands us. `model` is NOT here — it's pinned on the client. */
export interface CompleteParams {
  /** Path to the prompt file whose BYTES are hashed into the key (audit + staleness). */
  promptPath: string;
  /** System prompt text sent to the model (usually the rendered prompt file). */
  system: string;
  /** The message turns sent to the model. */
  messages: Anthropic.MessageParam[];
  /** Hard output cap. Also drives the conservative spend projection. */
  maxTokens: number;
  /** Adaptive thinking is the only supported mode on the pinned model. */
  thinking?: Anthropic.ThinkingConfigParam;
}

const DEFAULT_MODEL = "claude-opus-4-8";
const DEFAULT_BUDGET_USD = 2;
/** Above this max_tokens the SDK requires streaming; below it a single create() is fine. */
const STREAM_THRESHOLD_TOKENS = 16_000;

export class CachedClient {
  readonly model: string;
  readonly budgetUsd: number;
  readonly label: string;
  readonly entriesDir: string;
  readonly ledgerPath: string;

  private sdk: SdkLike | null;
  private tally: RunTally = {
    hits: 0,
    misses: 0,
    inputTokensBilled: 0,
    outputTokensBilled: 0,
    runUsd: 0,
  };
  private reported = false;

  constructor(opts: CachedClientOptions = {}) {
    this.model = opts.model ?? DEFAULT_MODEL;
    this.budgetUsd = opts.budgetUsd ?? DEFAULT_BUDGET_USD;
    this.label = opts.label ?? "run";
    this.entriesDir = opts.entriesDir ?? DEFAULT_ENTRIES_DIR;
    this.ledgerPath = opts.ledgerPath ?? DEFAULT_LEDGER_PATH;
    this.sdk = opts.sdk ?? null;
    // Fail fast if we have no price for the pinned model — before any billing.
    costUsd(this.model, ZERO_USAGE);
    if (!existsSync(this.entriesDir)) mkdirSync(this.entriesDir, { recursive: true });
  }

  /** Snapshot of the current run's tallies (for tests / mid-run inspection). */
  get runTally(): RunTally {
    return { ...this.tally };
  }

  /**
   * Build the SDK request body. This exact object is what gets canonicalized and
   * hashed as `input_sha256`, and (on a miss) what is sent to the SDK. It carries
   * no secret — the API key travels in a header we never hash or store.
   */
  private requestBody(p: CompleteParams): Anthropic.MessageCreateParamsNonStreaming {
    return {
      model: this.model,
      max_tokens: p.maxTokens,
      system: p.system,
      messages: p.messages,
      ...(p.thinking ? { thinking: p.thinking } : {}),
    };
  }

  private keyComponents(p: CompleteParams, body: unknown): KeyComponents {
    return {
      model: this.model,
      prompt_path: relative(REPO_ROOT, resolve(p.promptPath)),
      prompt_sha256: sha256File(p.promptPath),
      input_sha256: sha256(Buffer.from(canonicalJson(body), "utf8")),
    };
  }

  private entryPath(key: string): string {
    return join(this.entriesDir, `${key}.json`);
  }

  /**
   * The one call every stage makes. Returns the response plus per-call accounting.
   * Throws BudgetExceededError (before calling the SDK) if the projected cost of
   * a miss would push the run past its cap.
   */
  async complete(p: CompleteParams): Promise<CompletionResult> {
    const body = this.requestBody(p);
    const components = this.keyComponents(p, body);
    const key = cacheKey(components);
    const path = this.entryPath(key);

    // ---- HIT ---------------------------------------------------------------
    if (existsSync(path)) {
      const entry = JSON.parse(readFileSync(path, "utf8")) as CacheEntry;
      this.tally.hits += 1;
      log(`hit   ${short(key)}  $0.0000  (${this.label})`);
      return {
        response: entry.response,
        cacheHit: true,
        usage: ZERO_USAGE,
        costUsd: 0,
        cacheKey: key,
      };
    }

    // ---- MISS: budget guard BEFORE spending --------------------------------
    const requestBytes = Buffer.byteLength(canonicalJson(body), "utf8");
    const projected = projectedCostUsd(this.model, requestBytes, p.maxTokens);
    if (this.tally.runUsd + projected > this.budgetUsd) {
      throw new BudgetExceededError(
        `Budget cap $${this.budgetUsd.toFixed(2)} would be exceeded: ` +
          `spent $${this.tally.runUsd.toFixed(4)}, next call projected ` +
          `$${projected.toFixed(4)} (max_tokens=${p.maxTokens}). Halting before the call.`,
        this.tally.runUsd,
        projected,
        this.budgetUsd
      );
    }

    // ---- MISS: real billed call --------------------------------------------
    const sdkResponse = await this.callSdk(body);
    const usage = normalizeUsage(sdkResponse.usage);
    const cost = costUsd(this.model, usage);

    const entry: CacheEntry = {
      cache_key: key,
      key_components: components,
      stored_at: new Date().toISOString(),
      usage,
      cost_usd: cost,
      response: sdkResponse,
    };
    // Write once. Never overwrite an existing entry (audit log).
    writeFileSync(path, JSON.stringify(entry, null, 2) + "\n");

    this.tally.misses += 1;
    this.tally.inputTokensBilled += usage.input_tokens;
    this.tally.outputTokensBilled += usage.output_tokens;
    this.tally.runUsd += cost;
    log(
      `miss  ${short(key)}  $${cost.toFixed(4)}  ` +
        `(in ${usage.input_tokens} / out ${usage.output_tokens}, ${this.label})`
    );

    return {
      response: sdkResponse,
      cacheHit: false,
      usage,
      costUsd: cost,
      cacheKey: key,
    };
  }

  /** Lazily build the SDK, loading .env from the repo root the first time. */
  private ensureSdk(): SdkLike {
    if (this.sdk) return this.sdk;
    loadDotenv({ path: join(REPO_ROOT, ".env"), quiet: true });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        `ANTHROPIC_API_KEY not found. Expected it in ${join(REPO_ROOT, ".env")} ` +
          `(gitignored). The cache loads it itself; do not export it into the shell.`
      );
    }
    this.sdk = new Anthropic({ apiKey });
    return this.sdk;
  }

  private async callSdk(
    body: Anthropic.MessageCreateParamsNonStreaming
  ): Promise<SdkResponse> {
    const sdk = this.ensureSdk();
    let msg: Anthropic.Message;
    if (body.max_tokens >= STREAM_THRESHOLD_TOKENS) {
      const stream = sdk.messages.stream(body);
      msg = await stream.finalMessage();
    } else {
      msg = await sdk.messages.create(body);
    }
    return {
      id: msg.id,
      model: msg.model,
      role: msg.role,
      stop_reason: msg.stop_reason,
      content: msg.content,
      usage: msg.usage,
    };
  }

  /**
   * Print the end-of-run cost report and append one row to the ledger.
   * Idempotent: safe to call from a `finally` even if a budget halt fired.
   */
  report(): RunTally {
    if (this.reported) return this.runTally;
    this.reported = true;
    const t = this.tally;
    const row = appendRun(this.ledgerPath, {
      timestamp: new Date().toISOString(),
      label: this.label,
      hits: t.hits,
      misses: t.misses,
      inputTokensBilled: t.inputTokensBilled,
      outputTokensBilled: t.outputTokensBilled,
      runUsd: t.runUsd,
    });
    log("");
    log(`── cost report (${this.label}) ─────────────────────────`);
    log(`  hits          ${t.hits}   (served from cache at $0)`);
    log(`  misses        ${t.misses}   (billed calls)`);
    log(`  input tokens  ${t.inputTokensBilled}`);
    log(`  output tokens ${t.outputTokensBilled}`);
    log(`  run spend     $${t.runUsd.toFixed(4)}  of $${this.budgetUsd.toFixed(2)} cap`);
    log(`  cumulative    $${row.cumulativeUsd.toFixed(4)}  (ledger: ${relative(REPO_ROOT, this.ledgerPath)})`);
    log(`────────────────────────────────────────────────────`);
    return this.runTally;
  }
}

/** Coerce the SDK usage object into our billing shape. */
function normalizeUsage(u: unknown): Usage {
  const usage = (u ?? {}) as Record<string, number | undefined>;
  return addUsage(ZERO_USAGE, {
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
    cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
  });
}

function short(key: string): string {
  return key.slice(0, 12);
}

function log(line: string): void {
  // Single sink so tests can silence or capture if needed.
  console.log(line);
}
