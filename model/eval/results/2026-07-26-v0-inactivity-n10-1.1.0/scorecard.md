# Eval scorecard — v0-inactivity-n10 v1.1.0

- **Run date:** 2026-07-26
- **Contracts version:** 1.0.0
- **Scenarios:** 13 (11 drift, 2 control)

## Scorecard

| Metric | Value |
| --- | --- |
| Detection recall | 72.7% |
| Precision proxy (on-time+late / all flags) | 75.0% |
| Median lead time (days) | 5.5 |
| Control false positives | 0 |
| Control hard failures | 0 |
| Drift-type accuracy | 12.5% |
| Routing coverage | 68.8% |

**Timing:** premature 2 · on-time 4 · late 2 · missed 3

## Per scenario

| Scenario | Expected | Classification | Lead (d) | Type | Routing | Flag |
| --- | --- | --- | --- | --- | --- | --- |
| scn-001 | priority_displacement | missed | n/a | — | — |  |
| scn-002 | priority_displacement | missed | n/a | — | — |  |
| scn-003 | capacity_withdrawal | late | -26 | NO | 50.0% |  |
| scn-004 | priority_displacement | premature | 35 | NO | 50.0% |  |
| scn-005 | commitment_overrun | on_time | 36 | NO | 100.0% |  |
| scn-006 | attention_decay | on_time | 0 | yes | 50.0% |  |
| scn-007 | capacity_withdrawal | late | -13 | NO | 100.0% |  |
| scn-008 | control | control_clean | n/a | — | — |  |
| scn-009 | control | control_clean | n/a | — | — |  |
| scn-010 | priority_displacement | premature | 27 | NO | 50.0% |  |
| scn-011 | reasoning_contradiction | on_time | 0 | NO | 50.0% |  |
| scn-012 | scope_mutation | missed | n/a | — | — |  |
| scn-013 | metric_detachment | on_time | 11 | NO | 100.0% |  |
