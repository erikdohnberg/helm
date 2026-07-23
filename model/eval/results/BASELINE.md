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

---

# v0.1 — same detector, charters now carry aliases

v0.1 is the **same detector logic** (`v0-inactivity`, now version **1.1.0**); the only change is that the ten charters now carry an `aliases` list, each alias derived strictly from that charter's own text (title/outcome/metric/trade-offs) and never from the signals (spec §4; `_meta.json` changelog). The v0 zero-mapping result above is kept as history. Scorecards: `2026-07-23-v0-inactivity-n*-1.1.0/`.

## What the mapping now matches

7 of 10 charters now map ≥1 signal; **3 still map zero: scn-004, scn-005, scn-007.**

| Scenario | Maps | On which needle |
|---|---|---|
| scn-001 | s4, s5 | "activation" |
| scn-002 | s3, s4, s5 | "sync" |
| scn-003 | s3 | "pilot networks" |
| scn-004 | — | **zero** |
| scn-005 | — | **zero** |
| scn-006 | s2, s3 | "migration" |
| scn-007 | — | **zero** |
| scn-008 (control) | s2, s3, s4 | "eu" |
| scn-009 (control) | s2 | "self-serve" |
| scn-010 | s1, s3, s4 | "recovery" |

**Why the three still map zero — the preview of Stage 2's real difficulty:**
- **scn-004 & scn-007** — the drift is discussed *entirely* in the vocabulary of the displacing/structural event (promo/bundle/merchandising; reorg/Shipper AI/"8 days"), never in the outcome's own words. Outcome vocabulary is simply absent from the chatter.
- **scn-005** — the outcome *is* named once, as "**Scheduled-delivery**" (hyphen), which the alias "scheduled delivery" (space) doesn't substring-match. Named and still missed, defeated by punctuation.

These three are the honest measure of how hard real relevance mapping is: on nearly a third of the set, even the outcome's own vocabulary never appears verbatim in colloquial chatter.

**Three mapping behaviors worth naming** (two preview later pipeline stages):
- **scn-006 — topical relevance ≠ evidence type (the Stage 3 preview).** "migration" matches on s2/s3, but those signals *describe migration's absence* ("last message containing 'migration' was Aug 8", "standups mention migration zero times"). A substring mapper counts discussion *about* the outcome — including discussion of its stagnation — as activity on it, resetting the inactivity clock. Topical relevance and evidence type are different judgments: "last migration message was Aug 8" is topically relevant while being evidence of *absence*. Separating the two is exactly Stage 3's job (evidence extraction), which v0/v0.1 has no notion of.
- **scn-009 — a true positive, not a false map.** "self-serve" matches on s2's "Salesforce self-serve flow." That is not off-topic: scn-009's charter *is* "make the top 5 integrations self-serve," and the Salesforce self-serve flow is that charter's own work in progress — the engineer is sequencing the Traxion spike *after* it. A crude substring correctly picked up genuine charter activity; activity like that resetting the clock is part of what should keep a live-but-uncommitted outcome clean.
- **scn-008 — clean via a 2-character alias.** "eu" legitimately hits the EU re-anchor discussion, but a 2-char substring is exactly the over-eager match ("queue", "feud") a real mapper must not lean on.

## Scorecard across N (v0.1)

| N | recall | precision proxy | median lead (d) | control FP | hard fail | type acc | premature / on-time / late / missed |
|---|---|---|---|---|---|---|---|
| 5 | 75% | 57% | 13.5 | 1 | 0 | 16.7% | 2 / 3 / 1 / 2 |
| 7 | 75% | 57% | 13.5 | 1 | 0 | 16.7% | 2 / 3 / 1 / 2 |
| **10** | **75%** | **67%** | **13.5** | **0** | **0** | **16.7%** | **2 / 2 / 2 / 2** |
| 14 | 63% | 60% | 27 | 0 | 0 | 20% | 2 / 2 / 1 / 3 |

## What changed from v0, and why it's mostly the aliases working

- **Recall dropped from a spurious 100% to 75%** — and the drop is the point. **scn-001 and scn-002 (displacement) now go `missed`**: the outcome is still discussed ("activation", "sync"), so mapped mentions keep the charter "active" and inactivity never trips. That is exactly what an inactivity detector *should* do on displacement, and it **partially restores the original prediction** ("miss injection/displacement") — for the two cases where the outcome vocabulary appears. scn-004/005/007 are still flagged only because their outcome vocabulary never maps (zero) — an honest limitation traceable to the mapping, not the rule.
- **scn-006 is now caught on-time with lead 0** — it ties human realization exactly (the "migration"-as-absence mentions reset the clock until the final gap trips right at 09-14). No early warning delivered — a live instance of the scorer's on-time/lead-0 caveat, and closer to the "no real warning" spirit of the original "catch it late" prediction than v0's flattering +27.
- **The scn-008 hard failure is eliminated.** With aliases, the recorded re-anchor discussion ("EU payments") maps as activity, so the deliberate-replacement control stays clean at **every** N (it was a hard failure at N=5/7 under v0). This is v0.1's clearest genuine improvement. scn-009 still false-positives at N=5/7 (clean at N≥10).

## Revised operating point and bar to beat

**Best operating point: N=10** — highest recall tier (75%) with zero control false positives and the best precision at that recall (67%), median lead 13.5d. N=14 buys lead time (27d) but drops scn-003 to `missed` (recall 63%).

**The revised bar any future detector must beat (v0.1 @ N=10):** recall **75%**, precision proxy **67%**, median lead **13.5d**, control FPs **0**, hard failures **0**, drift-type accuracy **16.7%**, routing coverage 100% (still a proxy gimme). Timing: 2 on-time / 2 late / 2 premature / 2 missed. As before, the meaningful targets are **type accuracy (16.7% — v0.1 still labels everything `attention_decay`)**, control-cleanliness that survives long-timeline controls, and lead time earned by detection rather than by elapsed-time arithmetic on the zero-mappers.

## Known confound: timeline-length leakage

Both v0 and v0.1 still partly discriminate on **timeline length rather than drift signal**. The zero-mapping scenarios (scn-004/005/007) flag purely because their timelines run ≥ N days; the controls stay clean partly because their timelines are short (7–8 days). A control with a 6-week timeline would still be false-flagged; a fast drift with a short timeline would be missed. This is structural to any elapsed-time inactivity rule and **cannot be tuned away with N or with aliases** — every operating-point choice above is contaminated by it.

The structural fix is the **noise-embedding step** — Stage 2's embedding-based relevance mapping (spec §6). Measuring per-outcome activity by semantic similarity (so "Scheduled-delivery" ≈ "scheduled delivery", and "8 days"/"reorg" can attach to the onboarding charter) turns "inactivity" into "no *relevant* activity" instead of "no calendar signals for N days." Only then does the elapsed-time confound disappear, because the clock is driven by outcome-relevant signal, not by the mere passage of dated events.

## Note on alias generosity

v0.1's numbers are sensitive to how generous the alias list is — a hand-tuned knob, not a learned one. This list used **outcome vocabulary only** and deliberately excluded trade-off/displacer terms (SSO, AI features, merchandising, US checkout). A more generous list (including displacer terms) would map more signals, reset more clocks, and push more scenarios to `missed`; a stingier list would leave more zero-mappers flagging on elapsed time. So the operating point moves with alias curation — one more reason the baseline is a floor, not a target, and why learned relevance mapping (not hand-picked substrings) is the real Stage 2 job.
