/**
 * Stage 5 — Drift scoring (spec §6). Deterministic, no LLM.
 *
 * Per charter, per day: read the Stage 4 state and decide whether accumulated
 * evidence has crossed from noise into drift, and of which taxonomy type. Emits
 * at most one event per charter (the first threshold crossing) — like the v0
 * baseline, so lead time and precision compare cleanly. Every event cites the
 * signal spans that justify it (hard rule; spec §3/§6).
 *
 * ── The eval-mode calibration split (spec §7) ───────────────────────────────
 * Spec §7 splits the taxonomy in two by what a type is evaluated against:
 *   • ABSOLUTE types — reasoning_contradiction, scope_mutation,
 *     capacity_withdrawal, commitment_overrun — are judged against the charter
 *     text or an authorizing document, so they may fire during the calibration
 *     window (they need no learned baseline).
 *   • BASELINE-RELATIVE types — attention_decay, priority_displacement,
 *     metric_detachment — need a "normal" to deviate from, so they are
 *     suppressed inside the calibration window.
 * In production the baseline is a signal profile learned over the first weeks
 * after anchoring, so the window is [anchored_at, +CALIB_DAYS) — that is
 * `calibration: "anchor"`.
 *
 * The seed scenarios begin 2–7 weeks AFTER anchoring and carry almost no
 * pre-drift data, so an anchor-dated window is already expired on day one of
 * every scenario and gates nothing. EVAL MODE (`calibration: "eval-observed"`,
 * the default here) therefore substitutes the within-scenario reference spec §7
 * calls for: the charter's own early observed activity. The window becomes
 * [first_observed_day, +CALIB_DAYS). That substitution is the only
 * eval-vs-production deviation in this stage, and it is deliberate and
 * disclosed — not a silent reconciliation. It makes the split *stricter* than
 * production on this corpus (it delays baseline-relative flags), never looser.
 *
 * ── How a type is chosen ───────────────────────────────────────────────────
 * Type assignment keys on the *evidence signature*, never on ground truth.
 * Spec §3's discriminators are declared-artifact vs behavioral vs
 * bounded-then-breached, and those are what the rules below test. Branches are
 * ordered strongest-signature-first; the first one to fire wins.
 *
 * ── Explicit non-drift (spec §3) ───────────────────────────────────────────
 * Two of the spec's non-drift cases are enforced here rather than left to luck:
 *   • RECORDED RE-ANCHOR — an artifact that declares the outcome replaced AND
 *     names what is being given up is strategic memory working, not drift. It
 *     suppresses the declared-artifact branches. (Reference case: scn-008.)
 *   • UNCOMMITTED DISCUSSION — charter-excluded work that is discussed but never
 *     staffed, scheduled, or documented. Displacement requires a capacity
 *     commitment token; overrun requires an approval; both drop a topic whose
 *     latest evidence is parked. (Reference case: scn-009, named in spec §3.)
 */
import {
  DriftEventSchema,
  type Charter,
  type DriftEvent,
  type DriftType,
} from "../contracts/index.ts";
import type { CharterState, LedgerEntry, SignalRef } from "./stage4-state.ts";

/** Calibration window length (spec §7 lower bound: 2 weeks). */
export const CALIB_DAYS = 14;
/** Silence gap (calendar days with no *activity* evidence) that reads as decay. */
export const DECAY_GAP_DAYS = 14;
/** Metric-mention gap that reads as detachment, given continued progress claims. */
export const METRIC_GAP_DAYS = 21;
/** Baseline-relative types, suppressed during the calibration window (spec §7). */
export const RELATIVE_TYPES = new Set<DriftType>([
  "attention_decay",
  "priority_displacement",
  "metric_detachment",
]);

/** Where the calibration window starts. See the eval-mode note above. */
export type CalibrationMode = "anchor" | "eval-observed";

const MS_PER_DAY = 86_400_000;
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / MS_PER_DAY);

/** Content signature of a *capacity-reassignment* artifact (declared withdrawal). */
const CAPACITY_REASSIGN =
  /\b(reorg|re-org|org update|headcount|reassign\w*|restaff|staffing|assigns? \d|assigned \d|moved? to|moving to|move to|engineers? (to|move)|pulled (off|into)|lost (three|two|\d+)|\d+ of \d+)\b/i;
/** Content signature of a bounded, time-boxed exception (commitment-overrun premise). */
const BOUND_EXCEPTION =
  /\b(spike|on loan|loan\w*|borrow|timebox\w*|temporar\w*|for (one|two|three|\d+) weeks?|through (end|eoq|the quarter)|until (end|eoq)|two-week|one-week|another sprint)\b/i;
/** The bounded exception was actually *authorized* — spec §3's "approved and time-boxed". */
const APPROVAL_TOKEN =
  /\b(fine with it|approved|sign-?off|signed off|greenlit|green-lit|ok(ay)?'?d|authoriz\w*|agreed)\b/i;
/** Explicit capacity-commitment language — separates displacement from mere talk. */
const COMMITMENT_TOKEN =
  /\b(\d+% of|% of (pod )?capacity|sprint \d* ?commits?|sprint commits|committ\w+|staffed|tagged to build|assigned|pairing on|design doc|technical design|slips a sprint)\b/i;
/** The competing work was dropped or never committed (uncommitted-discussion control). */
const PARKED =
  /\b(parking|parked|on hold|shelved|went quiet|dropped|dead|no longer|not pursuing)\b/i;
/** The outcome's *definition* is being rewritten while its name is kept (scope mutation). */
const SCOPE_REDEFINITION =
  /\b(in[- ]scope|now (we )?mean|when we say|what we mean by|spec is revised|re-?defin\w*|renamed|umbrella|epic spanning|portal epic|expanded to|also includes|one piece of|moved under|folded into|phase 2|phase two)\b/i;
/** An artifact declaring the anchored outcome replaced / re-anchored. */
const REANCHOR_DECL =
  /\b(re-?anchor\w*|new outcome|replace .{0,40}outcome|outcome .{0,20}replaced|charter .{0,20}(replaced|superseded)|supersed\w*)\b/i;
/** …and naming what is given up. Both are required: a replacement with its cost recorded. */
const STOP_COST_DECL =
  /\b(what stops|and (its|the) cost|its cost|moves to q[1-4]|deferral|written handoff|closed out cleanly|what it costs)\b/i;

function entryText(e: LedgerEntry): string {
  return `${e.quote} ${e.ref.content}`;
}

function ownersToRecipients(charter: Charter, reason: string) {
  return charter.owners.map((actor_id) => ({ actor_id, reason }));
}

function buildEvent(
  charter: Charter,
  today: string,
  type: DriftType,
  severity: "minor" | "major",
  confidence: number,
  cites: LedgerEntry[],
  recipientReason: string,
  fallback: SignalRef | null,
  contradictedClaimIds?: string[]
): DriftEvent {
  // De-dup evidence by (signal, quote); the contract needs ≥1.
  const seen = new Set<string>();
  const evidence = [];
  for (const c of cites) {
    const k = `${c.ref.signal_id}::${c.quote}`;
    if (seen.has(k)) continue;
    seen.add(k);
    evidence.push({
      signal_id: c.ref.signal_id,
      quote: c.quote,
      source: c.ref.source,
      occurred_at: c.ref.occurred_at,
    });
  }
  // Absence-based events can have an empty ledger. Cite the last signal actually
  // seen rather than emitting an uncitable claim (hard rule; spec §6). If even
  // that is missing there is nothing to stand behind, so refuse to emit.
  if (evidence.length === 0) {
    if (!fallback) {
      throw new Error(
        `stage5: refusing to emit ${type} for ${charter.id} with no citable span`
      );
    }
    evidence.push({
      signal_id: fallback.signal_id,
      quote: fallback.content.slice(0, 240),
      source: fallback.source,
      occurred_at: fallback.occurred_at,
    });
  }
  return DriftEventSchema.parse({
    id: `${charter.id}-pipeline-${type}-${today}`,
    charter_id: charter.id,
    drift_type: type,
    severity,
    confidence,
    evidence,
    suggested_recipients: ownersToRecipients(charter, recipientReason),
    ...(contradictedClaimIds && contradictedClaimIds.length
      ? { contradicted_claim_ids: contradictedClaimIds }
      : {}),
  });
}

export interface ScoreOptions {
  calibration?: CalibrationMode;
}

/**
 * Score one charter's state as of `today`. Returns a DriftEvent to emit, or null.
 * Assumes the caller has already folded `today` into `state`, and checks
 * `state.emitted` itself to enforce one flag per charter.
 */
export function scoreDrift(
  charter: Charter,
  state: CharterState,
  today: string,
  opts: ScoreOptions = {}
): DriftEvent | null {
  const mode: CalibrationMode = opts.calibration ?? "eval-observed";
  const calibStart = mode === "anchor" ? charter.anchored_at : state.first_observed_day;
  const inCalibration = calibStart !== null && daysBetween(calibStart, today) < CALIB_DAYS;
  const allow = (t: DriftType) => !(inCalibration && RELATIVE_TYPES.has(t));

  const upto = (e: LedgerEntry) => e.date <= today;
  const ledger = state.ledger.filter(upto);
  const fallback = state.last_seen_ref;

  // ── Non-drift gate: a recorded re-anchor (spec §3) ────────────────────────
  // An artifact that declares the outcome replaced AND names what is given up is
  // a deliberate, recorded change of intent. Suppresses the declared-artifact
  // branches — it does not suppress decay, which would be a genuinely separate
  // finding about the replacement's own follow-through.
  const declared = ledger.some((e) => REANCHOR_DECL.test(entryText(e)));
  const costed = ledger.some((e) => STOP_COST_DECL.test(entryText(e)));
  const recordedReanchor = declared && costed;

  // ── 1. Reasoning contradiction (absolute, fires the day it lands) ─────────
  // Signature: Stage 3 tied a decision/claim to a specific charter reasoning id.
  const contradictions = state.contradictions.filter(upto);
  if (allow("reasoning_contradiction") && contradictions.length > 0) {
    const claims = [...new Set(contradictions.map((c) => c.contradicts_claim!).filter(Boolean))];
    return buildEvent(
      charter,
      today,
      "reasoning_contradiction",
      "major",
      0.85,
      contradictions,
      "charter owner — a decision/claim collides with the charter's recorded reasoning",
      fallback,
      claims
    );
  }

  // ── 2. Capacity withdrawal (declared: a doc reassigns committed capacity) ──
  // Signature: a published-document signal whose content reads as a capacity
  // reassignment, carrying substantive competing/deprioritization evidence.
  const withdrawalCites = ledger.filter(
    (e) =>
      e.ref.is_doc &&
      CAPACITY_REASSIGN.test(entryText(e)) &&
      (e.type === "competing_priority" ||
        e.type === "deprioritization_cue" ||
        e.type === "decision" ||
        e.type === "blocker")
  );
  if (allow("capacity_withdrawal") && !recordedReanchor && withdrawalCites.length > 0) {
    return buildEvent(
      charter,
      today,
      "capacity_withdrawal",
      "major",
      0.8,
      withdrawalCites,
      "charter owner + decision owner — a published change removes committed capacity; re-scope or record the trade-off",
      fallback
    );
  }

  // ── 3. Scope mutation (declared: the name survives, the definition doesn't) ─
  // Signature: a published artifact re-defines what the outcome means (spec §3:
  // "the outcome is still discussed, but what people mean by it has changed"),
  // sustained across ≥2 days so a single loose remark isn't drift. Distinct from
  // withdrawal by having no capacity-reassignment language at all.
  const scopeCites = ledger.filter(
    (e) => SCOPE_REDEFINITION.test(entryText(e)) && !CAPACITY_REASSIGN.test(entryText(e))
  );
  const scopeOnDoc = scopeCites.some((e) => e.ref.is_doc);
  const scopeDays = new Set(scopeCites.map((e) => e.date)).size;
  if (allow("scope_mutation") && !recordedReanchor && scopeOnDoc && scopeDays >= 2) {
    return buildEvent(
      charter,
      today,
      "scope_mutation",
      "major",
      0.75,
      scopeCites,
      "charter owner + decision owner — the outcome's definition has widened past the charter; re-anchor it or restore the original scope",
      fallback
    );
  }

  // ── 4. Commitment overrun (bounded exception that outlived its bound) ──────
  // Spec §3: "the reallocation was approved and time-boxed, and the drift is
  // precisely that the bound lapsed without re-approval." So all three are
  // required: a bound, an approval, and evidence continuing past the bound.
  // An exception that was merely floated (no approval) or parked is not overrun.
  const boundEntries = ledger.filter((e) => BOUND_EXCEPTION.test(entryText(e)));
  const approved = boundEntries.some((e) => APPROVAL_TOKEN.test(entryText(e)));
  const boundParked = boundEntries.length > 0 && PARKED.test(entryText(latest(boundEntries)));
  if (allow("commitment_overrun") && boundEntries.length > 0 && approved && !boundParked) {
    const boundDays = [...new Set(boundEntries.map((e) => e.date))].sort();
    const persistsPastBound = boundDays.length >= 2 || ledger.some((e) => e.date > boundDays[0]);
    if (persistsPastBound) {
      return buildEvent(
        charter,
        today,
        "commitment_overrun",
        "minor",
        0.65,
        boundEntries,
        "charter owner — an approved, time-boxed exception has outlived its stated bound without re-approval",
        fallback
      );
    }
  }

  // ── 5. Priority displacement (behavioral: committed competing effort) ──────
  // Rising competing topic across ≥2 days with an explicit capacity-commitment
  // token, and NOT a parked/uncommitted topic (spec §3: the distinction is
  // commitment, not topic).
  const competingStats = [...state.competing.values()].filter((s) => s.first_seen <= today);
  for (const stat of competingStats) {
    const topicEntries = ledger.filter(
      (e) =>
        e.competing_topic &&
        e.competing_topic.trim().toLowerCase() === stat.topic.trim().toLowerCase()
    );
    if (topicEntries.length === 0) continue;
    const distinctDays = new Set(topicEntries.map((e) => e.date)).size;
    const committed = topicEntries.some((e) => COMMITMENT_TOKEN.test(entryText(e)));
    const parked = PARKED.test(entryText(latest(topicEntries)));
    if (allow("priority_displacement") && distinctDays >= 2 && committed && !parked) {
      return buildEvent(
        charter,
        today,
        "priority_displacement",
        "major",
        0.7,
        topicEntries,
        `charter owner + decision owner — committed effort is shifting to "${stat.topic}" with no authorizing trade-off`,
        fallback
      );
    }
  }

  // ── 6. Metric detachment (the metric stops appearing; progress claims don't) ─
  // Spec §3's discriminator is the *metric mention rate*, not its absence: the
  // number was there, then it wasn't, while status kept being reported. So the
  // clock runs from the last metric reference (or from first observation, if the
  // metric never appeared at all) and requires progress claims since.
  const metricRef = state.last_metric_day;
  const metricClockFrom = metricRef ?? state.first_observed_day;
  const progressSince = ledger.filter(
    (e) => (e.type === "progress" || e.type === "decision") && (!metricRef || e.date > metricRef)
  );
  const progressDays = new Set(progressSince.map((e) => e.date)).size;
  if (
    allow("metric_detachment") &&
    metricClockFrom &&
    daysBetween(metricClockFrom, today) >= METRIC_GAP_DAYS &&
    progressDays >= 2
  ) {
    return buildEvent(
      charter,
      today,
      "metric_detachment",
      "minor",
      0.6,
      progressSince,
      "charter owner — progress is being reported without the success metric; quantify or re-baseline",
      fallback
    );
  }

  // ── 7. Attention decay (sustained silence on the outcome) ─────────────────
  // The clock runs on ACTIVITY evidence, not topical relevance. A signal that
  // reports the outcome's stagnation ("last migration message was Aug 8") is
  // relevant but is not work on it, and must not reset the clock — the failure
  // BASELINE.md identified in v0.1 on scn-006.
  const decayFrom = state.last_active_day ?? state.first_observed_day;
  if (allow("attention_decay") && decayFrom) {
    const gap = daysBetween(decayFrom, today);
    if (gap >= DECAY_GAP_DAYS) {
      const fromLastActive = ledger.filter((e) => e.date === decayFrom);
      const cites = fromLastActive.length ? fromLastActive : ledger.slice(-1);
      return buildEvent(
        charter,
        today,
        "attention_decay",
        "major",
        0.6,
        cites,
        `charter owner — no activity on the outcome for ${gap}+ days; the outcome is going quiet`,
        fallback
      );
    }
  }

  return null;
}

/** The latest-dated entry in a non-empty list. */
function latest(entries: LedgerEntry[]): LedgerEntry {
  return entries.reduce((a, b) => (b.date >= a.date ? b : a));
}
