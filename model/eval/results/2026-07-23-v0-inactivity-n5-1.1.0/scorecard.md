# Eval scorecard — v0-inactivity-n5 v1.1.0

- **Run date:** 2026-07-23
- **Contracts version:** 1.0.0
- **Scenarios:** 10 (8 drift, 2 control)

## Scorecard

| Metric | Value |
| --- | --- |
| Detection recall | 75.0% |
| Precision proxy (on-time+late / all flags) | 57.1% |
| Median lead time (days) | 13.5 |
| Control false positives | 1 |
| Control hard failures | 0 |
| Drift-type accuracy | 16.7% |
| Routing coverage | 100.0% |

**Timing:** premature 2 · on-time 3 · late 1 · missed 2

## Per scenario

| Scenario | Expected | Classification | Lead (d) | Type | Routing | Flag |
| --- | --- | --- | --- | --- | --- | --- |
| scn-001 | priority_displacement | missed | n/a | — | — |  |
| scn-002 | priority_displacement | missed | n/a | — | — |  |
| scn-003 | capacity_withdrawal | on_time | 0 | NO | 100.0% |  |
| scn-004 | priority_displacement | premature | 35 | NO | 100.0% |  |
| scn-005 | commitment_overrun | on_time | 36 | NO | 100.0% |  |
| scn-006 | attention_decay | on_time | 0 | yes | 100.0% |  |
| scn-007 | capacity_withdrawal | late | -13 | NO | 100.0% |  |
| scn-008 | control | control_clean | n/a | — | — |  |
| scn-009 | control | control_false_positive | n/a | — | — |  |
| scn-010 | priority_displacement | premature | 27 | NO | 100.0% |  |
