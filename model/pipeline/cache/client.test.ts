/**
 * Cache unit tests — no network, no spend. A stubbed SDK stands in for Anthropic,
 * and every client writes into a throwaway temp dir so the committed audit log
 * (entries/, LEDGER.md) is never touched.
 *
 * Run: node --test pipeline/cache/*.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { CachedClient, BudgetExceededError, type SdkLike } from "./client.ts";
import type { CompleteParams } from "./client.ts";
import { cacheKey, type KeyComponents } from "./hash.ts";

/** A stub SDK that returns a canned message and counts how many times it was called. */
function stubSdk(opts: { outputTokens?: number; inputTokens?: number } = {}) {
  const calls = { create: 0, stream: 0 };
  const make = () =>
    ({
      id: `msg_${calls.create + calls.stream}`,
      model: "claude-opus-4-8",
      role: "assistant",
      stop_reason: "end_turn",
      content: [{ type: "text", text: "stubbed response" }],
      usage: {
        input_tokens: opts.inputTokens ?? 100,
        output_tokens: opts.outputTokens ?? 50,
      },
    }) as any;
  const sdk: SdkLike = {
    messages: {
      create: async () => {
        calls.create += 1;
        return make();
      },
      stream: () => ({
        finalMessage: async () => {
          calls.stream += 1;
          return make();
        },
      }),
    },
  };
  return { sdk, calls };
}

/** Fresh temp workspace with a prompt file; returns paths + a cleanup fn. */
function workspace() {
  const dir = mkdtempSync(join(tmpdir(), "cache-test-"));
  const promptPath = join(dir, "prompt.txt");
  writeFileSync(promptPath, "You are the relevance mapper. Map signals to charters.\n");
  return {
    dir,
    promptPath,
    entriesDir: join(dir, "entries"),
    ledgerPath: join(dir, "LEDGER.md"),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

function params(promptPath: string, over: Partial<CompleteParams> = {}): CompleteParams {
  return {
    promptPath,
    system: "system text",
    messages: [{ role: "user", content: "signal: shipped SSO login" }],
    maxTokens: 1024,
    ...over,
  };
}

test("key sensitivity (pure): each component flips the key; identical components reuse it", () => {
  const base: KeyComponents = {
    model: "claude-opus-4-8",
    prompt_path: "pipeline/prompts/relevance.txt", // audit only — NOT hashed
    prompt_sha256: "a".repeat(64),
    input_sha256: "b".repeat(64),
  };
  const k = cacheKey(base);

  // Identical components → identical key.
  assert.equal(cacheKey({ ...base }), k, "identical components reuse the entry");

  // prompt_path is audit-only; changing it must NOT change the key.
  assert.equal(cacheKey({ ...base, prompt_path: "elsewhere.txt" }), k, "prompt_path is not hashed");

  // Each of the three hashed components must change the key.
  assert.notEqual(cacheKey({ ...base, model: "claude-opus-9" }), k, "model changes the key");
  assert.notEqual(cacheKey({ ...base, prompt_sha256: "c".repeat(64) }), k, "prompt bytes change the key");
  assert.notEqual(cacheKey({ ...base, input_sha256: "d".repeat(64) }), k, "input changes the key");
});

test("miss then hit: first call bills and stores, second replays at $0", async () => {
  const ws = workspace();
  try {
    const { sdk, calls } = stubSdk();
    const client = new CachedClient({
      sdk,
      entriesDir: ws.entriesDir,
      ledgerPath: ws.ledgerPath,
      label: "unit",
    });

    const first = await client.complete(params(ws.promptPath));
    assert.equal(first.cacheHit, false, "first call is a miss");
    assert.ok(first.costUsd > 0, "miss is billed");
    assert.equal(calls.create, 1, "SDK called exactly once on miss");
    assert.ok(existsSync(join(ws.entriesDir, `${first.cacheKey}.json`)), "entry file written");

    const second = await client.complete(params(ws.promptPath));
    assert.equal(second.cacheHit, true, "second call is a hit");
    assert.equal(second.costUsd, 0, "hit costs nothing");
    assert.equal(calls.create, 1, "SDK NOT called again on hit");
    assert.equal(second.cacheKey, first.cacheKey, "same key");
    assert.deepEqual(second.response, first.response, "identical response replayed");

    const t = client.runTally;
    assert.equal(t.hits, 1);
    assert.equal(t.misses, 1);
  } finally {
    ws.cleanup();
  }
});

test("integration key sensitivity: input change misses; prompt-byte edit misses", async () => {
  const ws = workspace();
  try {
    const { sdk, calls } = stubSdk();
    const client = new CachedClient({ sdk, entriesDir: ws.entriesDir, ledgerPath: ws.ledgerPath });

    const k0 = (await client.complete(params(ws.promptPath))).cacheKey;
    assert.equal(calls.create, 1);

    // Same everything → hit, no new call.
    const same = await client.complete(params(ws.promptPath));
    assert.equal(same.cacheHit, true);
    assert.equal(same.cacheKey, k0);
    assert.equal(calls.create, 1, "identical inputs did not re-bill");

    // Different rendered input → miss (new key, new call).
    const diffInput = await client.complete(
      params(ws.promptPath, { messages: [{ role: "user", content: "different signal" }] })
    );
    assert.equal(diffInput.cacheHit, false);
    assert.notEqual(diffInput.cacheKey, k0, "changed input → different key");
    assert.equal(calls.create, 2);

    // Edit the prompt FILE BYTES (no version label change) → miss.
    writeFileSync(ws.promptPath, "You are the relevance mapper. EDITED BODY.\n");
    const diffPrompt = await client.complete(params(ws.promptPath));
    assert.equal(diffPrompt.cacheHit, false, "unversioned prompt edit must not serve stale");
    assert.notEqual(diffPrompt.cacheKey, k0, "changed prompt bytes → different key");
    assert.equal(calls.create, 3);
  } finally {
    ws.cleanup();
  }
});

test("persistence across client instances: a fresh client hits the committed entry", async () => {
  const ws = workspace();
  try {
    const { sdk: sdk1, calls: calls1 } = stubSdk();
    const a = new CachedClient({ sdk: sdk1, entriesDir: ws.entriesDir, ledgerPath: ws.ledgerPath });
    const first = await a.complete(params(ws.promptPath));
    assert.equal(first.cacheHit, false);
    assert.equal(calls1.create, 1);

    // Brand-new client, brand-new stub SDK, same entriesDir — simulates a later session.
    const { sdk: sdk2, calls: calls2 } = stubSdk();
    const b = new CachedClient({ sdk: sdk2, entriesDir: ws.entriesDir, ledgerPath: ws.ledgerPath });
    const again = await b.complete(params(ws.promptPath));
    assert.equal(again.cacheHit, true, "second client hits the persisted entry");
    assert.equal(calls2.create, 0, "second client never calls the SDK");
    assert.deepEqual(again.response, first.response);
  } finally {
    ws.cleanup();
  }
});

test("budget halt: projected overage throws BEFORE any SDK call, stores nothing", async () => {
  const ws = workspace();
  try {
    const { sdk, calls } = stubSdk();
    // A large max_tokens projects well over a $0.01 cap (output alone: 25/1e6 * 200000 = $5).
    const client = new CachedClient({
      sdk,
      budgetUsd: 0.01,
      entriesDir: ws.entriesDir,
      ledgerPath: ws.ledgerPath,
      label: "capped",
    });

    await assert.rejects(
      () => client.complete(params(ws.promptPath, { maxTokens: 200_000 })),
      (err: unknown) => {
        assert.ok(err instanceof BudgetExceededError, "throws BudgetExceededError");
        assert.equal(err.capUsd, 0.01);
        assert.ok(err.projectedUsd > err.capUsd, "projection exceeded the cap");
        return true;
      }
    );
    assert.equal(calls.create, 0, "SDK never called when the cap would be crossed");
    assert.equal(calls.stream, 0);
    assert.ok(
      !existsSync(ws.entriesDir) || readdirSync(ws.entriesDir).length === 0,
      "no entry stored on halt"
    );
    assert.equal(client.runTally.runUsd, 0, "no spend recorded");
  } finally {
    ws.cleanup();
  }
});

test("report(): writes exactly one append-only ledger row and is idempotent", async () => {
  const ws = workspace();
  try {
    const { sdk } = stubSdk();
    const client = new CachedClient({
      sdk,
      entriesDir: ws.entriesDir,
      ledgerPath: ws.ledgerPath,
      label: "ledger-test",
    });
    await client.complete(params(ws.promptPath));
    const t1 = client.report();
    const t2 = client.report(); // second call must NOT append again
    assert.deepEqual(t1, t2, "report is idempotent");

    const rows = readFileSync(ws.ledgerPath, "utf8")
      .split("\n")
      .filter((l) => l.startsWith("|") && !l.includes("---") && !/timestamp/i.test(l));
    assert.equal(rows.length, 1, "exactly one ledger row after two report() calls");
  } finally {
    ws.cleanup();
  }
});
