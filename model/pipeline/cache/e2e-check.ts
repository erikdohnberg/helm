/**
 * End-to-end cache check — makes ONE real (billed) call through the cached client.
 *
 * Run it twice:
 *   node pipeline/cache/e2e-check.ts   # run 1: MISS — bills once, stores the entry
 *   node pipeline/cache/e2e-check.ts   # run 2: HIT  — $0, identical response replayed
 *
 * The entry is written to the committed entries/ dir, so run 2 (a separate
 * process) proving a hit is proof the cache survives across processes/sessions.
 */
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { CachedClient } from "./client.ts";
import { sha256 } from "./hash.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

const client = new CachedClient({ label: "e2e-check", budgetUsd: 2 });

const result = await client.complete({
  promptPath: join(HERE, "e2e-prompt.txt"),
  system: "You are a connectivity check for the Helm drift-model cache.",
  messages: [
    { role: "user", content: "Confirm you received this cache connectivity check." },
  ],
  maxTokens: 128,
});

// Print a short fingerprint of the response so run 1 and run 2 can be compared
// without dumping the whole payload.
const text = result.response.content
  .map((b) => (b && typeof b === "object" && "text" in b ? (b as { text: string }).text : ""))
  .join("");

console.log("");
console.log(`  outcome:        ${result.cacheHit ? "HIT (replayed)" : "MISS (billed)"}`);
console.log(`  cache key:      ${result.cacheKey.slice(0, 16)}…`);
console.log(`  this call cost: $${result.costUsd.toFixed(4)}`);
console.log(`  response sha:   ${sha256(text).slice(0, 16)}…`);
console.log(`  response text:  ${JSON.stringify(text)}`);

client.report();
