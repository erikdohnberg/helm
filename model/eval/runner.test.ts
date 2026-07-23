/**
 * Runner tests: prove the replay runner cannot leak future signals, feeds days
 * in order, persists state across days, and drops nothing. Plus a loader smoke
 * test that a real scenario maps to valid contract data.
 *
 *   node --experimental-strip-types --test model/eval/runner.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";

import { replayScenario } from "./runner.ts";
import { loadScenarioFile, mapSourceType, SCENARIOS_DIR } from "./loader.ts";
import type { Detector } from "./detector.ts";

const loaded = loadScenarioFile(join(SCENARIOS_DIR, "scn-001.json"));

/** Records what each observe() call saw, and threads a counter as state. */
interface Seen {
  date: string;
  stateIn: number;
  signalDays: string[];
  signalIds: string[];
}
function recordingDetector(): { detector: Detector<number>; seen: Seen[] } {
  const seen: Seen[] = [];
  const detector: Detector<number> = {
    name: "recording",
    version: "0",
    initialState: () => 0,
    observe: ({ date, daySignals, state }) => {
      seen.push({
        date,
        stateIn: state,
        signalDays: daySignals.map((s) => s.occurred_at.slice(0, 10)),
        signalIds: daySignals.map((s) => s.id),
      });
      // daySignals must be immutable to the detector.
      assert.equal(Object.isFrozen(daySignals), true, "daySignals array should be frozen");
      return { events: [], state: state + 1 };
    },
  };
  return { detector, seen };
}

test("runner never leaks future signals: every call sees only that day's signals", () => {
  const { detector, seen } = recordingDetector();
  replayScenario(loaded, detector);

  for (const call of seen) {
    // Every signal handed to a call is dated exactly on that call's day — so a
    // signal from any later (or earlier) day is structurally unreachable.
    for (const d of call.signalDays) {
      assert.equal(d, call.date, `call on ${call.date} received an off-day signal dated ${d}`);
      assert.ok(d <= call.date, `future signal ${d} leaked into call on ${call.date}`);
    }
  }
});

test("runner feeds days in ascending date order", () => {
  const { detector, seen } = recordingDetector();
  replayScenario(loaded, detector);
  const dates = seen.map((s) => s.date);
  assert.deepEqual(dates, [...dates].sort());
  assert.equal(new Set(dates).size, dates.length, "each day processed exactly once");
});

test("runner persists state across days within a run", () => {
  const { detector, seen } = recordingDetector();
  replayScenario(loaded, detector);
  // initialState is 0 and each day returns state+1, so the state received on
  // day i must be exactly i — proving the runner threads state day to day.
  seen.forEach((call, i) => assert.equal(call.stateIn, i));
});

test("runner drops no signals: union of delivered signals equals the full timeline", () => {
  const { detector, seen } = recordingDetector();
  const replay = replayScenario(loaded, detector);
  const delivered = seen.flatMap((s) => s.signalIds);
  assert.equal(delivered.length, replay.signals_total);
  assert.equal(new Set(delivered).size, loaded.signals.length);
  assert.deepEqual(new Set(delivered), new Set(loaded.signals.map((s) => s.id)));
});

test("loader maps a scenario to valid contract data", () => {
  // If loadScenarioFile returned, the zod contracts already validated it.
  assert.equal(loaded.charter.id, "scn-001-charter");
  assert.ok(loaded.charter.owners.includes("actor-priya-nair"));
  assert.ok(loaded.charter.owners.includes("actor-dana-okafor"));
  assert.equal(loaded.signals.length, loaded.scenario.signal_timeline.length);
  assert.equal(loaded.signals[0].source_type, "chat_message"); // s1 is slack:#sales-eng
  assert.equal(loaded.signals[0].metadata.original_source, "slack:#sales-eng");
});

test("mapSourceType: known prefixes map, unknown prefix throws", () => {
  assert.equal(mapSourceType("slack:#growth-pod"), "chat_message");
  assert.equal(mapSourceType("doc:google"), "document_revision");
  assert.equal(mapSourceType("meeting:sprint-planning"), "meeting_transcript");
  assert.throws(() => mapSourceType("email:inbox"), /unknown source prefix/);
});
