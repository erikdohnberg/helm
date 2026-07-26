# pipeline-v1.1 — contradiction gating: delta vs v1.0

Run date 2026-07-26 · 13 scenarios (11 drift, 2 control) · contracts v1 · model `claude-opus-4-8` (pinned).

**One change, Stage 5 only.** No prompt edits, no contract edits, no scenario edits.
Stages 1–4 are byte-identical to v1.0.0, so the whole run replayed from the v1.0
cache: **109 hits, 0 misses, $0.0000.** Nothing re-billed, which is the check that
the change stayed inside the scorer.

---

## 1. Verdict: v1.1 clears the shipping bar that v1.0 failed

Hard rule #2 is "beat the v0 baseline on the end-to-end scorecard, on lead time
and precision."

| Detector | Recall | Precision proxy | Median lead (d) | Control FP | Hard fail | Type acc | Routing | prem / on-time / late / missed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **pipeline-v1 1.1.1** | 90.9% | **80.0%** | **9.5** | 0 | 0 | **60.0%** | 65.0% | 2 / 7 / 1 / 1 |
| pipeline-v1 1.0.0 | 100.0% | 45.5% | 13 | 0 | 0 | 36.4% | 68.2% | 6 / 5 / 0 / 0 |
| v0-inactivity-n10 1.1.0 | 72.7% | 75.0% | 5.5 | 0 | 0 | 12.5% | 68.8% | 2 / 4 / 2 / 3 |
| null-detector 1.0.0 | 0.0% | n/a | n/a | 0 | 0 | n/a | n/a | 0 / 0 / 0 / 11 |

Precision **80.0% > 75.0%** and median lead **9.5 > 5.5**, with zero control false
positives and drift-type accuracy roughly 5× the baseline's. On the stated gate,
v1.1 ships where v1.0 did not.

Two honest qualifications on that verdict:

- **Recall fell 100% → 90.9%** (scn-013 is now missed). Hard rule #2 does not gate
  on recall, but a version that trades a true positive for precision should say so
  in the same breath, not bury it. §4 explains why that scenario was never really
  detected in the first place.
- **Median lead fell 13 → 9.5 days.** That is the *arithmetic of not flagging
  early*: v1.0's six premature flags carried large positive leads (scn-004 at 49
  days, scn-012 at 44) that inflated the median while being wrong. A shorter lead
  bought with on-time flags is the trade the scorecard is asking for; it is still
  well above the baseline.

## 2. What changed, precisely

`reasoning_contradiction` in `pipeline/stage5-score.ts`:

1. **Gated on a committing decision.** Spec §3 is "*decisions are made that
   conflict* with the charter's stated reasoning." A Stage 3 `contradiction`
   extraction now only counts if the signal carrying it is either (a) also typed
   `decision` by Stage 3, or (b) a published artifact that commits people or
   capacity to the conflicting work (`COMMITTING_ARTIFACT`). An analysis that
   reverses a premise is new information; a plan that staffs work on the reversed
   premise is the drift.
2. **Given the same bar as every other branch** — doc-backed, or sustained across
   ≥2 distinct days. It was the only branch with no threshold at all.
3. **Stripped of its first-position pre-emption.** Every branch now produces a
   *candidate* only if its own bar is met, and an explicit `PRECEDENCE` over
   evidence signature picks among the qualifiers. In v1.0 evaluation order doubled
   as authority: contradiction ran first, so it won against branches that had real
   evidence behind them.

Two unit tests pin the new behaviour (`pipeline/stage45.test.ts`): an analysis doc
does not fire and does not ripen with time, while the plan that staffs the work
does; and a qualifying `capacity_withdrawal` beats a qualifying contradiction on
the same day. 15/15 pipeline tests, 44/44 overall, `tsc --noEmit` clean.

**Disclosure — two runs are on disk for v1.1.** `1.1.0` was the first cut of the
same single change; its gate reused the displacement branch's `COMMITMENT_TOKEN`
vocabulary, whose bare `\d+% of` (written for "40% of pod capacity") matched a
statistic in scn-011's analysis doc — "**44% of** sub-90-day cancels" — so scn-011
still fired on the analysis (s1) instead of the plan (s3). `1.1.1` replaces that
with a purpose-built `COMMITTING_ARTIFACT` vocabulary and is the version scored
above. The `1.1.0` directory is kept rather than overwritten (session rule #2);
its scorecard reads precision 70.0%, 3 premature.

## 3. Per-scenario delta, v1.0.0 → v1.1.1

| Scenario | Expected | v1.0.0 | v1.1.1 | Verdict |
| --- | --- | --- | --- | --- |
| scn-001 | priority_displacement | premature 07-14 · reasoning_contradiction | **on_time 07-17** · reasoning_contradiction | timing fixed, type still wrong |
| scn-002 | priority_displacement | premature 07-20 · reasoning_contradiction | **late 08-12** · attention_decay | premature → late; see §4 |
| scn-003 | capacity_withdrawal | on_time 07-24 · capacity_withdrawal ✓ | unchanged | — |
| scn-004 | priority_displacement | premature 07-09 · reasoning_contradiction | premature 07-23 · attention_decay | 14 days less early, still premature |
| scn-005 | commitment_overrun | on_time 07-27 · commitment_overrun ✓ | unchanged | — |
| scn-006 | attention_decay | on_time 08-31 · reasoning_contradiction | on_time 08-31 · **attention_decay ✓** | type fixed |
| scn-007 | capacity_withdrawal | on_time 07-28 · capacity_withdrawal ✓ | unchanged | — |
| scn-008 | control | control_clean | unchanged | — |
| scn-009 | control | control_clean | unchanged | — |
| scn-010 | priority_displacement | premature 10-22 · attention_decay | unchanged | untouched by this change (v1.2 target) |
| scn-011 | reasoning_contradiction ✓ | premature 07-15 · on the analytics doc | **on_time 07-23** · on the save-offer doc ✓ | the predicted landing, exactly |
| scn-012 | scope_mutation | premature 07-13 · reasoning_contradiction | **on_time 07-21** · **scope_mutation ✓** | timing and type both fixed |
| scn-013 | metric_detachment | on_time 08-20 · reasoning_contradiction | **missed** | lost a flag; see §4 |

Six of the eight scenarios that carried a contradiction flag moved, and the
prediction written into the v1.0 analysis held: **the premature flags were the
thing that moved (6 → 2), and scn-011 landed at s3 on the decision doc** — the
2026-07-23 "At-Risk Save Offer … two retention-pod engineers tagged to build"
artifact, which is the earliest reasonable flag date in the scenario's own ground
truth. Nothing regressed on the controls, and no scenario that was already correct
changed.

## 4. What is still wrong (and what this run newly exposed)

- **scn-013 is now missed — and was never actually detected.** v1.0 scored it
  on-time only by flagging the *wrong* type off a contradiction. With that gone,
  `metric_detachment` should have fired and does not, for a reason this run
  exposed: Stage 3 types the *absence* of the metric as a `metric_reference`
  ("WAC **not shown** for the third review running"), which resets Stage 5's
  metric clock on 08-07 — the exact day detachment becomes provable. The branch
  then needs ≥2 progress days after that reset and only ever gets one. So the
  metric-detachment rule is mis-tuned against its own evidence type. Naming it,
  not fixing it here: one change per version.
- **scn-002 slipped premature → late.** Removing the contradiction flag leaves
  `attention_decay`, whose clock only gets evaluated on days that carry signals;
  the first such day past the 14-day gap is 08-12, twelve days after the humans
  noticed. Not a false flag, but no lead — and it is the same displacement
  scenario that should have been caught behaviorally.
- **scn-004 and scn-010 stay premature, both via `attention_decay`.** When a
  scenario carries no `progress`/`decision`/`metric_reference` evidence at all,
  the decay clock falls back to `first_observed_day`, so it fires 14 days into a
  scenario that is busy with competing-priority traffic. Decay is measuring "no
  activity evidence extracted" rather than "the outcome went quiet."
- **The four wrong types are all one miss: `priority_displacement` never fires.**
  scn-001, 002, 004, 010 are all displacement, and none of them reach the branch,
  because it groups competing evidence by *exact topic string* and Stage 3 names
  the same topic differently each day ("Enterprise SSO for a large deal", "SAML/SSO
  enterprise scoping", "SAML SSO technical design", "SSO stories"). That is the
  single highest-value remaining fix and it is the v1.2/v1.3 territory already
  queued.
- **Claim-level citation diverges on scn-011, unscored.** The flag cites `r3`
  ("the lever is a guided onboarding flow, not discounting") where ground truth
  records `r2` ("the driver is onboarding friction, not price"). A 20% intro
  credit arguably contradicts r3 more directly than r2, but the scorer checks
  drift *type* and never checks `contradicted_claim_ids`, so this metric is not
  being measured at all. scn-011's grader notes explicitly ask for claim-level
  correctness — the scorer should score it.
- **Routing 68.2% → 65.0%, mechanism unchanged.** Stage 5 still routes to
  `charter.owners` only; the average moved solely because scn-013 (which happened
  to score 100%) dropped out of the flag set. The information-asymmetry gap is
  untouched, as expected — that is v1.3.

## 5. Spend

| | |
| --- | --- |
| This run (pre-pass Stages 2–3) | 109 cache hits, 0 billed calls, **$0.0000** |
| Cumulative ledger | $1.7314 |
| Cap | $5.00 |

Zero misses is the evidence that v1.1 touched only Stage 5: any change to a
prompt, to a request payload, or to the pinned model would have re-keyed the
cache and re-billed.
