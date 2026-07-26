/**
 * Stage 4/5 unit tests — the invariants that must hold regardless of what the
 * LLM stages return. No network, no cache, no scenarios: hand-built evidence.
 *
 *   node --test pipeline/stage45.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";

import { CharterSchema, type Charter } from "../contracts/index.ts";
import { foldDay, initCharterState, type SignalIndex, type SignalRef } from "./stage4-state.ts";
import { CALIB_DAYS, scoreDrift } from "./stage5-score.ts";
import type { DailyEvidence } from "./daily-evidence.ts";

const charter: Charter = CharterSchema.parse({
  id: "chr-1",
  org_id: "org-1",
  quarter: "FY26 Q3",
  outcome_statement: "Ship self-serve onboarding",
  success_metric: { name: "time to first call", target_value: "10 min", current_value: "38 min" },
  reasoning: [{ id: "r1", claim: "The first ten minutes are the lever." }],
  trade_offs: ["No developer-portal work this quarter"],
  owners: ["actor-a", "actor-b"],
  aliases: ["self-serve onboarding"],
  anchored_at: "2026-06-01",
  status: "Anchored",
  baseline: null,
});

function ref(id: string, content: string, date: string, isDoc = false): SignalRef {
  return { signal_id: `sig-${id}`, content, source: isDoc ? "doc:google" : "slack:#x", occurred_at: date, is_doc: isDoc };
}

function indexOf(...refs: Array<[string, SignalRef]>): SignalIndex {
  return new Map(refs);
}

/**
 * `all` is every signal Stage 2 mapped that day (relevant or not) — Stage 2 maps
 * the whole day, so its output enumerates them. Defaults to the relevant set.
 */
function day(
  date: string,
  extractions: DailyEvidence["extractions"],
  relevant: string[],
  all: string[] = relevant
): DailyEvidence {
  return {
    date,
    mappings: all.map((signal_id) => ({
      signal_id,
      relevant: relevant.includes(signal_id),
      confidence: 1,
      basis: "outcome" as const,
      rationale: "test",
    })),
    relevantSignalIds: relevant,
    extractions,
    costUsd: 0,
    cacheHits: 0,
    calls: 0,
  };
}

const ex = (type: string, quote: string, extra: Record<string, unknown> = {}) => ({
  type: type as any,
  quote,
  reasoning: "test",
  contradicts_claim: null,
  competing_topic: null,
  ...extra,
});

test("every emitted event carries at least one citable span", () => {
  // An attention-decay flag is about an absence: the ledger is empty because no
  // extraction ever landed, yet the event must still cite a real signal.
  const r = ref("1", "Some unrelated chatter", "2026-07-01");
  const state = initCharterState(charter.id, charter.anchored_at);
  foldDay(state, day("2026-07-01", [], [], ["s1"]), indexOf(["s1", r]));

  assert.equal(state.ledger.length, 0);
  assert.equal(state.last_seen_ref?.signal_id, "sig-1");

  const event = scoreDrift(charter, state, "2026-08-01");
  assert.ok(event, "expected a decay flag after a long silence");
  assert.equal(event.drift_type, "attention_decay");
  assert.equal(event.evidence.length, 1);
  assert.equal(event.evidence[0].signal_id, "sig-1");
});

test("refuses to emit rather than produce an uncitable claim", () => {
  // No signal has ever been seen, so there is nothing to cite. The hard rule
  // (no claim without a citable span) must win over emitting.
  const state = initCharterState(charter.id, charter.anchored_at);
  state.first_observed_day = "2026-07-01";
  state.last_active_day = "2026-07-01";
  assert.throws(() => scoreDrift(charter, state, "2026-08-01"), /no citable span/);
});

test("topical-but-inactive evidence does not reset the attention clock", () => {
  // The scn-006 failure BASELINE.md named: "last migration message was Aug 8" is
  // relevant to the outcome but is evidence of its absence, not activity.
  const active = ref("1", "Tracker shows 14/34.", "2026-07-01", true);
  const aboutAbsence = ref("2", "last message containing 'migration' was Aug 8", "2026-07-12");
  const index = indexOf(["s1", active], ["s2", aboutAbsence]);

  const state = initCharterState(charter.id, charter.anchored_at);
  foldDay(state, day("2026-07-01", [{ signal_id: "s1", extractions: [ex("metric_reference", "14/34")] }], ["s1"]), index);
  foldDay(
    state,
    day("2026-07-12", [{ signal_id: "s2", extractions: [ex("deprioritization_cue", "was Aug 8")] }], ["s2"]),
    index
  );

  assert.equal(state.last_relevant_day, "2026-07-12", "the day is topically relevant");
  assert.equal(state.last_active_day, "2026-07-01", "but carries no activity evidence");

  // 2026-07-16 is 15 days after the last *activity*, only 4 after the last
  // relevant signal. A relevance-driven clock would still be silent here.
  const event = scoreDrift(charter, state, "2026-07-16");
  assert.equal(event?.drift_type, "attention_decay");
});

test("calibration window suppresses baseline-relative types but not absolute ones", () => {
  const doc = ref("1", "H2 Org Update: three engineers move to Shipper AI.", "2026-07-01", true);
  const index = indexOf(["s1", doc]);
  const state = initCharterState(charter.id, charter.anchored_at);
  foldDay(
    state,
    day(
      "2026-07-01",
      [{ signal_id: "s1", extractions: [ex("competing_priority", "three engineers move to Shipper AI", { competing_topic: "Shipper AI" })] }],
      ["s1"]
    ),
    index
  );

  // Day 1 of observation: inside the eval-mode calibration window.
  const inWindow = scoreDrift(charter, state, "2026-07-01", { calibration: "eval-observed" });
  assert.equal(inWindow?.drift_type, "capacity_withdrawal", "absolute types fire during calibration");

  // A baseline-relative type must not fire inside the window. Strip the
  // declared-artifact signature so only decay is available.
  const quiet = initCharterState(charter.id, charter.anchored_at);
  foldDay(quiet, day("2026-07-01", [], ["s1"]), index);
  const day13 = "2026-07-14"; // 13 days in — still inside [first_observed, +14)
  assert.equal(scoreDrift(charter, quiet, day13, { calibration: "eval-observed" }), null);
  const dayOut = "2026-07-15"; // CALIB_DAYS elapsed
  assert.equal(CALIB_DAYS, 14);
  assert.equal(scoreDrift(charter, quiet, dayOut, { calibration: "eval-observed" })?.drift_type, "attention_decay");
});

test("uncommitted discussion is not displacement, and a parked bound is not overrun", () => {
  // scn-009's shape: a lively charter-excluded thread that is never staffed and
  // is explicitly parked. Spec §3: the distinction is commitment, not topic.
  const s1 = ref("1", "Great call with Traxion. If we integrated, their reps say they'd co-sell.", "2026-08-03");
  const s2 = ref("2", "Their API looks clean, maybe 3-4 weeks? Could be worth a spike after the Salesforce flow ships.", "2026-08-04");
  const s3 = ref("3", "Traxion went quiet, their champion is on leave. Parking this.", "2026-08-11");
  const index = indexOf(["s1", s1], ["s2", s2], ["s3", s3]);

  const state = initCharterState(charter.id, charter.anchored_at);
  const topic = { competing_topic: "Traxion integration" };
  foldDay(state, day("2026-08-03", [{ signal_id: "s1", extractions: [ex("competing_priority", "Great call with Traxion", topic)] }], ["s1"]), index);
  foldDay(state, day("2026-08-04", [{ signal_id: "s2", extractions: [ex("competing_priority", "worth a spike", topic)] }], ["s2"]), index);
  foldDay(state, day("2026-08-11", [{ signal_id: "s3", extractions: [ex("deprioritization_cue", "Parking this", topic)] }], ["s3"]), index);

  for (const d of ["2026-08-03", "2026-08-04", "2026-08-11"]) {
    const event = scoreDrift(charter, state, d);
    assert.equal(event, null, `expected no flag on ${d}, got ${event?.drift_type}`);
  }
});

test("a recorded re-anchor suppresses the declared-artifact branches", () => {
  // scn-008's shape: the outcome is explicitly replaced AND what stops is named.
  // Spec §3 lists that as non-drift — strategic memory working.
  const doc = ref(
    "1",
    "Q4 Re-anchor: new outcome, metric, reasoning, and a 'What stops' section naming the EU payments deferral and its cost.",
    "2026-07-01",
    true
  );
  const index = indexOf(["s1", doc]);
  const state = initCharterState(charter.id, charter.anchored_at);
  foldDay(
    state,
    day("2026-07-01", [{ signal_id: "s1", extractions: [ex("decision", "Q4 Re-anchor: new outcome")] }], ["s1"]),
    index
  );
  assert.equal(scoreDrift(charter, state, "2026-07-01"), null);
});

test("stage 4 folds only the day it is given (no future leakage by construction)", () => {
  const r1 = ref("1", "a", "2026-07-01");
  const r2 = ref("2", "b", "2026-07-05");
  const index = indexOf(["s1", r1], ["s2", r2]);
  const state = initCharterState(charter.id, charter.anchored_at);
  foldDay(state, day("2026-07-01", [{ signal_id: "s1", extractions: [ex("progress", "a")] }], ["s1"]), index);
  assert.equal(state.ledger.length, 1);
  assert.equal(state.last_observed_day, "2026-07-01");
  foldDay(state, day("2026-07-05", [{ signal_id: "s2", extractions: [ex("progress", "b")] }], ["s2"]), index);
  assert.equal(state.ledger.length, 2);
  // Scoring as of an earlier day must not see the later entry.
  const early = state.ledger.filter((e) => e.date <= "2026-07-01");
  assert.equal(early.length, 1);
});
