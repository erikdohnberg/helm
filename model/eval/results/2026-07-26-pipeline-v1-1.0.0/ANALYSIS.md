# pipeline-v1.0 — comparison and failure analysis

Run date 2026-07-26 · 13 scenarios (11 drift, 2 control) · contracts v1 · model `claude-opus-4-8` (pinned).

Stage 2/3 evidence came entirely from the cache written by the component eval
(`2026-07-26-pipeline-stage23-component/`): **109 hits, 0 misses, $0.00** for this run.
Component spend was $1.4253 of a $5.00 cap.

---

## 1. Verdict first: v1.0 does **not** clear the shipping bar

Hard rule #2 requires a pipeline version to beat the v0 baseline **on the end-to-end
scorecard, on lead time and precision.** v1.0 beats it on three of four headline
numbers and **loses decisively on precision.**

| Detector | Recall | Precision proxy | Median lead (d) | Control FP | Hard fail | Type acc | Routing | prem / on-time / late / missed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **pipeline-v1 1.0.0** | **100.0%** | **45.5%** | **13** | 0 | 0 | **36.4%** | 68.2% | **6 / 5 / 0 / 0** |
| v0-inactivity-n10 1.1.0 | 72.7% | 75.0% | 5.5 | 0 | 0 | 12.5% | 68.8% | 2 / 4 / 2 / 3 |
| null-detector 1.0.0 | 0.0% | n/a | n/a | 0 | 0 | n/a | n/a | 0 / 0 / 0 / 11 |

Read plainly: **v1.0 flags every drift scenario, never flags a control, never flags
late — and is wrong about the type on 7 of 11, and fires too early on 6 of 11.**
Precision falls from 75% to 45.5% and that is the gate. v1.0 is not shippable as it
stands, and the reason is one branch, identified in §3.

**Baselines were re-scored, not quoted.** The v0.1 numbers in `BASELINE.md` were
measured on **10** scenarios against the charter-owner routing proxy. This set is 13
and the scorer now routes against `ground_truth.expected_recipients`. So v0.1 and
NullDetector were re-run here on the same 13 scenarios with the same scorer; the old
directories are untouched. For reference, v0.1's numbers move under the new set and
scorer from 75% / 67% / 13.5d / 16.7% / 100% routing to **72.7% / 75.0% / 5.5d /
12.5% / 68.8%** — most of the routing drop is the retirement of the owner proxy, which
was always a gimme.

---

## 2. What genuinely improved

- **Recall 100% (11/11), zero missed, zero late.** v0.1 misses scn-001, scn-002 and
  scn-012 outright and is late on scn-003 and scn-007. Real relevance mapping is why:
  Stage 2 mapped **≥1 own signal on 11/11 scenarios and the ground-truth flag signal on
  11/11** — against v0.1's three permanent zero-mappers (scn-004/005/007). The
  bottleneck spec §2 named, and `BASELINE.md` measured, is closed at the component level.
- **Drift-type accuracy 12.5% → 36.4%.** Still bad in absolute terms, but v0.1 emits
  `attention_decay` for literally everything; v1.0 gets scn-003, scn-005, scn-007 and
  scn-011 right by evidence signature.
- **Median lead 5.5d → 13d, with no late flags at all.**
- **Controls clean without the length confound.** `BASELINE.md`'s central caveat was
  that v0.1 clears the controls only because their timelines are 7–8 days, shorter than
  N=10 — "a control scenario with a 3-week timeline would be false-flagged." v1.0 clears
  them on judgment instead: scn-008 is suppressed by the recorded re-anchor rule (an
  artifact that both declares the outcome replaced and names what stops), and scn-009 by
  the commitment requirement (a competing topic with no capacity commitment, latest
  evidence "Parking this"). Both are spec §3's explicit non-drift cases, implemented as
  rules rather than left to timeline arithmetic. Unit tests pin both
  (`pipeline/stage45.test.ts`).
- **Every event cites a verbatim span.** Stage 3 span faithfulness was 113/113, and
  Stage 5 refuses to emit rather than produce an uncitable claim (hard rule #3).

---

## 3. The dominant failure: `reasoning_contradiction` is a zero-threshold catch-all

**8 of 11 drift flags came out as `reasoning_contradiction`, and 5 of the 6 premature
flags are that branch firing on the scenario's first substantive signal.**

| Scenario | Expected | Emitted | Flagged | Earliest reasonable | The span it fired on |
| --- | --- | --- | --- | --- | --- |
| scn-001 | priority_displacement | reasoning_contradiction | 07-14 | 07-17 | "SSO is a hard requirement for their security review" |
| scn-002 | priority_displacement | reasoning_contradiction | 07-20 | 07-31 | "Platform group should own it since it touches the data layer." |
| scn-004 | priority_displacement | reasoning_contradiction | 07-09 | 08-05 | "Sure, squeezing it in." |
| scn-006 | attention_decay | reasoning_contradiction | 08-31 | 08-18 | "Covering PM reports 'data platform: on track' upward" |
| scn-012 | scope_mutation | reasoning_contradiction | 07-13 | 07-21 | "Self-serve onboarding should really include an interactive API explorer" |
| scn-013 | metric_detachment | reasoning_contradiction | 08-20 | 08-07 | "The metric section is a paragraph of adjectives; no number" |
| scn-011 | reasoning_contradiction | reasoning_contradiction | 07-15 | 07-23 | "44% of sub-90-day cancels cite 'price / value mismatch'" |

Two independent causes compound:

1. **Stage 3 types tension as `contradiction` generously.** Asked to relate a signal to
   the charter's reasoning, it will attach a `contradicts_claim` to a status report
   ("on track"), a metric-free update, or a scope suggestion. Each extraction is
   *faithful* — the spans are verbatim and the reasoning is defensible — but
   "in tension with claim r2" is not the same judgment as spec §3's
   "**decisions are made that conflict** with the charter's stated reasoning."
2. **Stage 5's branch #1 has no threshold and runs first.** One contradiction entry,
   on any day, from any source, emits immediately at confidence 0.85. Every other
   branch carries a real bar (≥2 distinct days, a published artifact, a commitment
   token, an approval, a 14/21-day gap). Contradiction carries none, so it pre-empts
   all of them — including on scn-011, where the *right* type fires 8 days early off
   the analytics doc rather than the sprint decision that actually contradicts the
   charter.

Note what this is **not**: it is not Stage 2 over-mapping (mapping was 11/11 correct on
flag signals) and it is not hallucination (113/113 spans verbatim). It is a
**scoring-threshold defect in the one branch that has no threshold**, and it accounts
for the entire precision regression. Fixing it is a Stage 5 change; it does not require
touching the frozen prompts or re-billing Stage 2/3.

**The v1.1 fix, stated so it can be measured as a delta:** require the contradiction
branch to (a) sit on evidence that is itself a `decision` or a published artifact —
spec §3 says *decisions*, not remarks — and (b) clear the same ≥2-distinct-day or
declared-artifact bar every other branch clears; and demote it below the
declared-artifact branches so scope mutation and capacity withdrawal win when both
match. That is a prediction, not a result, and it must be scored, not asserted.

## 4. The other two misses

- **scn-010 → `attention_decay`, premature (10-22 vs earliest 11-05).** The competing
  topic was extracted, but no `COMMITMENT_TOKEN` matched in time, so the displacement
  branch stayed shut while the activity clock ran out first. The evidence is present;
  the lexical commitment test is too narrow. This is the same class of problem as §3
  — a hand-written regex standing in for a judgment the LLM stages already made.
- **Routing 68.2%, essentially level with v0.1's 68.8%.** Stage 5 routes to
  `charter.owners` and nothing else, so it covers the owner half of every scenario's
  `expected_recipients` and misses the non-owner half (`actor-cro`, `actor-growth-team`,
  `actor-hardening-plan-owner`, …). This is the information-asymmetry gap the product
  exists to close, and v1.0 does not close it. The pipeline *has* the material to do
  better — Stage 3 already names the competing topic and the contradicted claim — it
  simply doesn't use it for routing yet. Not a regression, but not progress either, and
  it should not be read as "routing works."

## 5. Calibration split — honest status

The eval-mode calibration split is implemented and unit-tested, but on this corpus it
is **nearly inert**, and that should be recorded rather than presented as a working
feature. Every scenario's signals begin 2–7 weeks after `anchored_at`, so a
production-mode window (`[anchored_at, +14d)`) has already expired on day one of every
scenario and gates nothing. Eval mode substitutes the within-scenario reference spec §7
calls for — `[first_observed_day, +14d)` — which does bind, and is *stricter* than
production here rather than looser. It changed no scenario's outcome in this run. Its
value will only be measurable on a corpus that starts at anchoring.

## 6. Spend and reproducibility

| | |
| --- | --- |
| Component eval (Stage 2+3, 13 scenarios + 4 hard-negative pairs) | 128 billed calls, $1.4253 |
| This end-to-end run | 109 cache hits, 0 billed calls, $0.0000 |
| Cap for both | $5.00 |

The pre-pass and the component eval issue byte-identical requests through
`computeDailyEvidence`, so the harness run replays them for free — which is also the
reproducibility guarantee: re-running this scorecard costs nothing and cannot drift,
because the pinned model's replies are committed audit entries.
