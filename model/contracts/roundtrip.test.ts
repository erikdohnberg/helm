/**
 * Round-trip tests for the contracts: construct a valid instance of each type,
 * serialize -> parse -> validate; plus intentionally-invalid instances that
 * must fail validation.
 *
 *   node --experimental-strip-types --test model/contracts/roundtrip.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import type { z } from "zod";

import {
  CONTRACTS_VERSION,
  CharterSchema,
  SignalSchema,
  DriftEventSchema,
  DriftReportSchema,
  CoverageSchema,
} from "./index.ts";

/** Serialize -> parse -> validate, the way a real consumer receives a contract. */
function roundtrip<S extends z.ZodType>(schema: S, value: unknown): z.ZodSafeParseResult<z.infer<S>> {
  return schema.safeParse(JSON.parse(JSON.stringify(value)));
}

// --- Fixtures ----------------------------------------------------------------
const validCharter = {
  id: "ch-activation",
  org_id: "org-ledgerline",
  quarter: "FY26 Q3",
  outcome_statement: "New workspaces reach their first shared ledger within 24 hours of signup",
  success_metric: { name: "24h activation rate", target_value: "34%", current_value: "18%" },
  reasoning: [{ id: "r1", claim: "Activation is the leak, not acquisition" }],
  trade_offs: ["SSO deferred to Q4"],
  owners: ["actor-priya"],
  aliases: ["the activation work"],
  anchored_at: "2026-06-28",
  status: "Anchored",
  baseline: null,
};

const validSignal = {
  id: "sig-1",
  org_id: "org-ledgerline",
  occurred_at: "2026-07-17T14:00:00Z",
  ingested_at: "2026-07-18T02:00:00Z",
  source_type: "document_revision",
  actors: ["actor-marco"],
  audience: { size: 6, owner_overlap_charter_ids: ["ch-activation"] },
  content: "SAML SSO – Technical Design (Meridian)",
  thread_ref: null,
  parent_ref: null,
  metadata: { pages: 9 },
};

const validEvidence = {
  signal_id: "sig-1",
  quote: "SAML SSO – Technical Design (Meridian)",
  source: "doc:google",
  occurred_at: "2026-07-17",
};

const validEvent = {
  id: "de-1",
  charter_id: "ch-activation",
  drift_type: "priority_displacement",
  severity: "major",
  confidence: 0.82,
  evidence: [validEvidence],
  suggested_recipients: [{ actor_id: "actor-dana", reason: "charter owner, unaware capacity is being spent" }],
};

const validContradictionEvent = {
  id: "de-2",
  charter_id: "ch-activation",
  drift_type: "reasoning_contradiction",
  severity: "minor",
  confidence: 0.6,
  evidence: [{ signal_id: "sig-9", quote: "data shows pricing is the churn driver", source: "slack:#data", occurred_at: "2026-08-01" }],
  suggested_recipients: [{ actor_id: "actor-dana", reason: "decision owner whose stated reasoning is contradicted" }],
  contradicted_claim_ids: ["r1"],
};

const validCoverage = {
  sources_ingested: ["chat_message", "document_revision"],
  signal_counts: { total: 1240, by_source_type: { chat_message: 1200, document_revision: 40 } },
  gaps: { missed_batches: [], excluded_spaces: ["#hr-private"] },
};

const validReport = {
  org_id: "org-ledgerline",
  run_date: "2026-07-18",
  model_version: "0.2.0",
  contracts_version: CONTRACTS_VERSION,
  charter_states: [
    {
      charter_id: "ch-activation",
      alignment_score: 0.62,
      alignment_trend: "declining",
      activity_vs_baseline: 0.7,
      open_items: ["SSO work displacing activation"],
    },
  ],
  drift_events: [validEvent, validContradictionEvent],
  competing_topics: [
    { id: "ct-sso", label: "SAML SSO for Meridian", activity_level: 8, actors: ["actor-marco"], first_seen: "2026-07-15" },
  ],
  coverage: validCoverage,
};

// --- Valid round-trips -------------------------------------------------------
test("Charter round-trips", () => {
  const r = roundtrip(CharterSchema, validCharter);
  assert.equal(r.success, true, r.success ? "" : JSON.stringify(r.error?.issues));
  assert.equal(r.data?.reasoning[0].id, "r1");
});

test("Signal round-trips (metadata default applies when omitted)", () => {
  assert.equal(roundtrip(SignalSchema, validSignal).success, true);
  const noMeta = { ...validSignal };
  delete (noMeta as Record<string, unknown>).metadata;
  const r = roundtrip(SignalSchema, noMeta);
  assert.equal(r.success, true);
  assert.deepEqual(r.data?.metadata, {});
});

test("DriftEvent round-trips (secondary_types defaults to [])", () => {
  const r = roundtrip(DriftEventSchema, validEvent);
  assert.equal(r.success, true, r.success ? "" : JSON.stringify(r.error?.issues));
  assert.deepEqual(r.data?.secondary_types, []);
});

test("DriftEvent with contradicted_claim_ids round-trips (reasoning_contradiction)", () => {
  const r = roundtrip(DriftEventSchema, validContradictionEvent);
  assert.equal(r.success, true, r.success ? "" : JSON.stringify(r.error?.issues));
  assert.deepEqual(r.data?.contradicted_claim_ids, ["r1"]);
});

test("Coverage round-trips", () => {
  assert.equal(roundtrip(CoverageSchema, validCoverage).success, true);
});

test("DriftReport round-trips (whole contract)", () => {
  const r = roundtrip(DriftReportSchema, validReport);
  assert.equal(r.success, true, r.success ? "" : JSON.stringify(r.error?.issues));
  assert.equal(r.data?.contracts_version, CONTRACTS_VERSION);
  assert.equal(r.data?.drift_events.length, 2);
});

// --- Intentionally invalid instances (must fail) -----------------------------
function assertFails(label: string, schema: z.ZodType, value: unknown, expectPathContains?: string) {
  const r = schema.safeParse(value);
  assert.equal(r.success, false, `${label}: expected validation to FAIL but it passed`);
  if (expectPathContains && !r.success) {
    const hit = r.error.issues.some(
      (i) => i.path.join(".").includes(expectPathContains) || i.message.includes(expectPathContains)
    );
    assert.equal(hit, true, `${label}: failed, but not for ${expectPathContains} — got ${JSON.stringify(r.error.issues)}`);
  }
}

test("INVALID Charter: reasoning as bare strings (pre-{id,claim}) fails", () => {
  assertFails("charter.reasoning", CharterSchema, { ...validCharter, reasoning: ["a bare claim string"] }, "reasoning");
});

test("INVALID Signal: audience.owner_overlap boolean (pre-charter-ids) fails", () => {
  assertFails("signal.audience", SignalSchema, { ...validSignal, audience: { size: 6, owner_overlap: true } }, "audience");
});

test("INVALID DriftEvent: empty evidence fails (hard rule #3)", () => {
  assertFails("event.evidence", DriftEventSchema, { ...validEvent, evidence: [] }, "evidence");
});

test("INVALID DriftEvent: stale taxonomy value silent_abandonment fails", () => {
  assertFails("event.drift_type", DriftEventSchema, { ...validEvent, drift_type: "silent_abandonment" }, "drift_type");
});

test("INVALID DriftEvent: contradicted_claim_ids without reasoning_contradiction fails", () => {
  assertFails(
    "event.contradicted_claim_ids",
    DriftEventSchema,
    { ...validEvent, contradicted_claim_ids: ["r1"] },
    "contradicted_claim_ids"
  );
});

test("INVALID DriftReport: missing contracts_version fails", () => {
  const bad = { ...validReport };
  delete (bad as Record<string, unknown>).contracts_version;
  assertFails("report.contracts_version", DriftReportSchema, bad, "contracts_version");
});

test("INVALID Coverage: negative signal count fails", () => {
  assertFails("coverage.total", CoverageSchema, { ...validCoverage, signal_counts: { total: -5, by_source_type: {} } }, "total");
});
