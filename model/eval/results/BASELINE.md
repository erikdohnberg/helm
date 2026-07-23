# v0 inactivity baseline — the bar to beat

The v0 baseline (spec §8.4) flags any charter with **zero mapped signals for N consecutive days**, using the simplest possible relevance mapping: a signal maps to a charter if its content contains the charter title, an alias, or the metric name (case-insensitive substring). Run for N ∈ {5, 7, 10, 14}; scorecards are in the sibling `2026-07-23-v0-inactivity-n*-1.0.0/` directories.

## The finding that reframes everything below: the mapping matches nothing

Across all 10 scenarios, **0 signals map to their charter**. The seed charters' titles and metric names are formal (`"Double self-serve activation"`, `"Reports migrated (of 34)"`); the signals are colloquial (`"Activation flat at 18%"`, `"tracker says 14"`). A substring rule never fires.

Consequence: v0 never observes the *outcome's* activity, so it never sees genuine inactivity. Its clock starts at each scenario's first signal day and, with no mapped signal ever resetting it, **every charter is flagged exactly N days later — on elapsed time, not silence.** v0 is not really an inactivity detector here; it is an "elapsed-time-since-first-signal ≥ N" detector. Whether a scenario flags at all is decided by one thing: **is its timeline longer than N days?** Drift timelines span 21–50 days; the two controls span 7–8. That length gap — not any drift signal — is the entire basis of v0's drift-vs-control discrimination.

This is exactly spec §2's thesis made concrete: *relevance mapping precision/recall bounds everything downstream.* With mapping at zero, every headline number below is spurious.

## Scorecard across N

| N | recall | precision proxy | median lead (d) | control FP | hard fail | type acc | premature / on-time / late / missed |
|---|---|---|---|---|---|---|---|
| 5 | 100% | 60% | 13.5 | 2 | 1 | 12.5% | 2 / 5 / 1 / 0 |
| 7 | 100% | 60% | 13.5 | 2 | 1 | 12.5% | 2 / 5 / 1 / 0 |
| **10** | **100%** | **75%** | **13.5** | **0** | **0** | **12.5%** | **2 / 3 / 3 / 0** |
| 14 | 100% | 75% | 1 | 0 | 0 | 12.5% | 2 / 2 / 4 / 0 |

Routing coverage is 100% at every N — but that is a gimme: v0 routes to the charter owners, which is exactly the (owner-based) proxy the scorer measures against. It says nothing about closing the information gap.

## Best operating point: N = 10

N=10 dominates the others:

- **vs N=5/7** — same recall and same median lead (13.5d), but **precision 75% vs 60% and control FPs drop from 2 to 0** (with the scn-008 hard failure eliminated). At N=5/7 the controls' 7–8 day timelines still exceed the threshold, so both get false-flagged; at N≥10 they fall below it and go clean.
- **vs N=14** — same recall, precision, and clean controls, but **median lead 13.5d vs 1d** and fewer late flags (3 vs 4). A larger N pushes every flag later, converting on-time flags into late ones.

So N=10 is the sweet spot **for this dataset**: clean controls like N=14, early flags like N=5/7. But note *why* — it clears the controls only because their timelines happen to be shorter than 10 days. A control scenario with a 3-week timeline would be false-flagged at N=10. The operating point is tuned to an artifact, not to a drift signal.

## Per scenario at N = 10

| Scenario | Expected type | v0 result | Flag date | Why |
|---|---|---|---|---|
| scn-001 | priority_displacement | late (lead −14) | 2026-08-04 | flagged on elapsed time, after human realization (07-21) |
| scn-002 | priority_displacement | on-time (lead 0) | 2026-07-31 | ties human realization exactly — zero real warning |
| scn-003 | capacity_withdrawal | late (lead −13) | 2026-08-06 | realization was day-2 (07-24); v0 can't fire that fast |
| scn-004 | priority_displacement | premature (lead 35) | 2026-07-23 | fired before the earliest reasonable signal (08-05) |
| scn-005 | commitment_overrun | on-time (lead 36) | 2026-07-27 | coincides with earliest signal; long window flatters it |
| scn-006 | attention_decay | on-time (lead 27) | 2026-08-18 | **the only real type match** — v0 always emits attention_decay |
| scn-007 | capacity_withdrawal | late (lead −13) | 2026-08-11 | realization was day-2 (07-29); v0 far too slow |
| scn-008 | control (deliberate) | clean | — | timeline (7d) < N; clean by luck of length, not judgment |
| scn-009 | control (uncommitted) | clean | — | timeline (8d) < N; same |
| scn-010 | priority_displacement | premature (lead 27) | 2026-10-22 | fired before the earliest reasonable signal (11-05) |

v0 emits `attention_decay` for **every** flag, so it is "right" on type only for scn-006 (1/8 = 12.5%) — and even there by luck, not by detecting decay. On the seven non-decay drift scenarios its type is simply wrong.

## Predictions vs. reality — stated plainly

The predictions going in were: catch scn-006 **late**, **miss** the injection/displacement cases entirely, and note control false-positive behavior. Two of three do **not** hold.

1. **"Catch scn-006 late" — DIVERGES.** scn-006 is caught **on-time** at every N (lead +14 to +27), not late. Reason: v0 doesn't detect scn-006's silence (nothing maps); it flags scn-006 on the same elapsed-time rule as everything else, and that timeline places the flag before human realization (09-14). Right classification, wrong mechanism.
2. **"Miss injection/displacement entirely" — DIVERGES sharply.** v0 **flags all of them** (scn-001/002/004 displacement, scn-005 overrun) — as on-time, premature, or late depending on N. It cannot miss them, because with zero mapping an "injected" charter looks exactly as inactive as any other; v0 isn't discriminating on drift at all. The prediction assumed the mapping would keep busy charters active. It doesn't.
3. **"Control false-positive behavior worth noting" — HOLDS.** At N=5/7 both controls are false-flagged and **scn-008 is a hard failure** (flagged 2026-10-20, after the 2026-10-17 recorded decision). At N≥10 both controls go clean. As predicted, this is a finding about the *detector*, not the controls: v0 FPs on them purely because at small N their short timelines still exceed the threshold. The controls are correct.

## The numbers any future detector must beat

At the N=10 operating point, v0 posts: **recall 100%, precision proxy 75%, median lead 13.5d, control FPs 0, hard failures 0, drift-type accuracy 12.5%, routing coverage 100%** (timing: 2 premature / 3 on-time / 3 late / 0 missed). The NullDetector floor is recall 0% / 0 FPs (`2026-07-23-null-detector-1.0.0/`).

But "beat v0" cannot mean beat those inflated top-line numbers naively — they are artifacts of zero mapping plus a dataset where drift timelines are long and control timelines short. A real detector must beat v0 **where the quality actually lives**:

- **Drift-type accuracy > 12.5%** — the number that exposes v0's emptiness; it labels everything `attention_decay`. This is the single easiest *meaningful* thing to beat.
- **Control-cleanliness that survives long-timeline controls** — v0 passes controls only because they are short. A real detector must stay clean on a control regardless of its length.
- **Lead time from detection, not arithmetic** — v0's positive leads (scn-004/005/010) come from firing before the earliest reasonable signal (premature) or from long windows, not from reading the drift. Beating v0 means positive lead that is *on-time*, not premature.
- **Fewer premature and late flags** — v0 lands only 3 of 8 on-time at N=10; 2 premature and 3 late.
- **Recall that means detection** — v0's 100% is "flagged something eventually," not "detected the drift." Hold recall at 100% while every flag is a real, correctly-typed, on-time detection.

## Root cause and next step

The bottleneck is the relevance mapping, precisely as spec §2 warns. The immediate lever is the charters' `aliases`: the loader currently seeds `aliases = [title]` only, and the titles don't appear in the signals. A v1 detector needs real relevance mapping (embeddings + LLM judgment, spec Stage 2), or at minimum a richer alias/keyword set learned from confirmed mappings. Until mapping fires on drift signals, no inactivity rule can distinguish a starving outcome from a busy one — it can only count days.
