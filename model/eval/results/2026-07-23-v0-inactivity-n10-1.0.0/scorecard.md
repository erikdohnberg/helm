# Eval scorecard — v0-inactivity-n10 v1.0.0

- **Run date:** 2026-07-23
- **Contracts version:** 1.0.0
- **Scenarios:** 10 (8 drift, 2 control)

## Scorecard

| Metric | Value |
| --- | --- |
| Detection recall | 100.0% |
| Precision proxy (on-time+late / all flags) | 75.0% |
| Median lead time (days) | 13.5 |
| Control false positives | 0 |
| Control hard failures | 0 |
| Drift-type accuracy | 12.5% |
| Routing coverage | 100.0% |

**Timing:** premature 2 · on-time 3 · late 3 · missed 0

## Per scenario

| Scenario | Expected | Classification | Lead (d) | Type | Routing | Flag |
| --- | --- | --- | --- | --- | --- | --- |
| scn-001 | priority_displacement | late | -14 | NO | 100.0% |  |
| scn-002 | priority_displacement | on_time | 0 | NO | 100.0% |  |
| scn-003 | capacity_withdrawal | late | -13 | NO | 100.0% |  |
| scn-004 | priority_displacement | premature | 35 | NO | 100.0% |  |
| scn-005 | commitment_overrun | on_time | 36 | NO | 100.0% |  |
| scn-006 | attention_decay | on_time | 27 | yes | 100.0% |  |
| scn-007 | capacity_withdrawal | late | -13 | NO | 100.0% |  |
| scn-008 | control | control_clean | n/a | — | — |  |
| scn-009 | control | control_clean | n/a | — | — |  |
| scn-010 | priority_displacement | premature | 27 | NO | 100.0% |  |
