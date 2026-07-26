# Eval scorecard — pipeline-v1 v1.0.0

- **Run date:** 2026-07-26
- **Contracts version:** 1.0.0
- **Scenarios:** 13 (11 drift, 2 control)

## Scorecard

| Metric | Value |
| --- | --- |
| Detection recall | 100.0% |
| Precision proxy (on-time+late / all flags) | 45.5% |
| Median lead time (days) | 13 |
| Control false positives | 0 |
| Control hard failures | 0 |
| Drift-type accuracy | 36.4% |
| Routing coverage | 68.2% |

**Timing:** premature 6 · on-time 5 · late 0 · missed 0

## Per scenario

| Scenario | Expected | Classification | Lead (d) | Type | Routing | Flag |
| --- | --- | --- | --- | --- | --- | --- |
| scn-001 | priority_displacement | premature | 7 | NO | 50.0% |  |
| scn-002 | priority_displacement | premature | 11 | NO | 50.0% |  |
| scn-003 | capacity_withdrawal | on_time | 0 | yes | 50.0% |  |
| scn-004 | priority_displacement | premature | 49 | NO | 50.0% |  |
| scn-005 | commitment_overrun | on_time | 36 | yes | 100.0% |  |
| scn-006 | attention_decay | on_time | 14 | NO | 50.0% |  |
| scn-007 | capacity_withdrawal | on_time | 1 | yes | 100.0% |  |
| scn-008 | control | control_clean | n/a | — | — |  |
| scn-009 | control | control_clean | n/a | — | — |  |
| scn-010 | priority_displacement | premature | 27 | NO | 50.0% |  |
| scn-011 | reasoning_contradiction | premature | 13 | yes | 50.0% |  |
| scn-012 | scope_mutation | premature | 44 | NO | 100.0% |  |
| scn-013 | metric_detachment | on_time | 11 | NO | 100.0% |  |
