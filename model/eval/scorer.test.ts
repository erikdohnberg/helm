/**
 * Scorer edge-case tests: boundary flag timing, multiple flags, controls,
 * hard-failure escalation, routing, and type match.
 *
 *   node --experimental-strip-types --test model/eval/scorer.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";

import { scoreScenario, buildScorecard, type Classification } from "./scorer.ts";
import type { EmittedFlag } from "./runner.ts";

// A drift scenario: earliest reasonable flag = s3 (2026-07-17), human realization = 2026-07-21.
const driftScn = {
  id: "scn-t1",
  label: "test drift",
  charter: { outcome_owner: "Priya Nair (PM)", decision_owner: "Dana Okafor (CPO)" },
  signal_timeline: [
    { signal_id: "s1", date: "2026-07-14", source: "slack:#x" },
    { signal_id: "s2", date: "2026-07-15", source: "slack:#x" },
    { signal_id: "s3", date: "2026-07-17", source: "doc:google" },
    { signal_id: "s4", date: "2026-07-21", source: "meeting:sprint" },
  ],
  human_realization: { first_noticed_date: "2026-07-21" },
  ground_truth: {
    is_drift: true,
    drift_type: "priority_displacement",
    should_flag: true,
    earliest_reasonable_flag_signal: "s3",
  },
};

// A deliberate-replacement control (scn-008 shape): recorded decision = last doc = 2026-10-17.
const controlScn = {
  id: "scn-t8",
  label: "test control",
  charter: { outcome_owner: "Priya Nair (PM)", decision_owner: "Dana Okafor (CPO)" },
  signal_timeline: [
    { signal_id: "s1", date: "2026-10-13", source: "slack:#x" },
    { signal_id: "s2", date: "2026-10-16", source: "meeting:exec" },
    { signal_id: "s3", date: "2026-10-17", source: "doc:google" },
    { signal_id: "s4", date: "2026-10-20", source: "slack:#x" },
  ],
  human_realization: { first_noticed_date: null },
  ground_truth: {
    is_drift: false,
    drift_type: "none",
    should_flag: false,
    control_kind: "deliberate_replacement",
    earliest_reasonable_flag_signal: null,
  },
};

function flag(date: string, drift_type = "priority_displacement", recipients: string[] = []): EmittedFlag {
  return {
    emitted_on: date,
    event: { drift_type, suggested_recipients: recipients.map((a) => ({ actor_id: a, reason: "r" })) },
  } as unknown as EmittedFlag;
}

const cls = (scn: any, flags: EmittedFlag[]): Classification => scoreScenario(scn, flags).classification;

test("flag exactly at earliest signal is on_time (boundary inclusive)", () => {
  assert.equal(cls(driftScn, [flag("2026-07-17")]), "on_time");
});

test("flag exactly at human realization is on_time (boundary inclusive)", () => {
  const s = scoreScenario(driftScn, [flag("2026-07-21")]);
  assert.equal(s.classification, "on_time");
  assert.equal(s.lead_time_days, 0);
});

test("flag before earliest is premature", () => {
  assert.equal(cls(driftScn, [flag("2026-07-15")]), "premature");
});

test("flag after human realization is late, with negative lead time", () => {
  const s = scoreScenario(driftScn, [flag("2026-07-22")]);
  assert.equal(s.classification, "late");
  assert.equal(s.lead_time_days, -1);
});

test("no flag on a drift scenario is missed", () => {
  const s = scoreScenario(driftScn, []);
  assert.equal(s.classification, "missed");
  assert.equal(s.lead_time_days, null);
  assert.equal(s.flagged, false);
});

test("multiple flags: earliest flag determines timing; all events counted", () => {
  const s = scoreScenario(driftScn, [flag("2026-07-21"), flag("2026-07-17"), flag("2026-07-19")]);
  assert.equal(s.classification, "on_time"); // earliest is 07-17, not the first array element
  assert.equal(s.first_flag_date, "2026-07-17");
  assert.equal(s.num_events, 3);
  assert.equal(s.lead_time_days, 4); // 07-21 minus 07-17
});

test("type match uses the earliest flag's drift_type", () => {
  assert.equal(scoreScenario(driftScn, [flag("2026-07-17", "priority_displacement")]).type_match, true);
  assert.equal(scoreScenario(driftScn, [flag("2026-07-17", "capacity_withdrawal")]).type_match, false);
});

test("routing coverage = fraction of expected recipients reached", () => {
  const both = ["actor-priya-nair", "actor-dana-okafor"];
  assert.equal(scoreScenario(driftScn, [flag("2026-07-17", "priority_displacement", both)]).routing.coverage, 1);
  assert.equal(
    scoreScenario(driftScn, [flag("2026-07-17", "priority_displacement", ["actor-dana-okafor"])]).routing.coverage,
    0.5
  );
  assert.equal(scoreScenario(driftScn, [flag("2026-07-17", "priority_displacement", [])]).routing.coverage, 0);
});

test("control: no flag is control_clean, no hard failure", () => {
  const s = scoreScenario(controlScn, []);
  assert.equal(s.classification, "control_clean");
  assert.equal(s.control_hard_failure, false);
});

test("control: flag before the recorded decision is a false positive but not a hard failure", () => {
  const s = scoreScenario(controlScn, [flag("2026-10-15")]);
  assert.equal(s.classification, "control_false_positive");
  assert.equal(s.control_hard_failure, false);
});

test("control: flag after the recorded decision is a hard failure (scn-008 rule)", () => {
  const s = scoreScenario(controlScn, [flag("2026-10-18")]);
  assert.equal(s.classification, "control_false_positive");
  assert.equal(s.control_hard_failure, true);
});

test("aggregate: a perfect run scores full recall, no FPs, positive lead time", () => {
  const scores = [
    scoreScenario(driftScn, [flag("2026-07-17", "priority_displacement", ["actor-priya-nair", "actor-dana-okafor"])]),
    scoreScenario(controlScn, []),
  ];
  const card = buildScorecard({ name: "x", version: "1" }, scores, "2026-07-23");
  assert.equal(card.metrics.detection_recall, 1);
  assert.equal(card.metrics.precision_proxy, 1);
  assert.equal(card.metrics.control_false_positive_count, 0);
  assert.equal(card.metrics.control_hard_failures, 0);
  assert.equal(card.metrics.type_accuracy, 1);
  assert.equal(card.metrics.routing_coverage, 1);
  assert.equal(card.metrics.median_lead_time_days, 4);
});
