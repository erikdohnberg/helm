# Eval scorecard — pipeline-v1 v1.1.1

- **Run date:** 2026-07-26
- **Contracts version:** 1.0.0
- **Scenarios:** 13 (11 drift, 2 control)

## Scorecard

| Metric | Value |
| --- | --- |
| Detection recall | 90.9% |
| Precision proxy (on-time+late / all flags) | 80.0% |
| Median lead time (days) | 9.5 |
| Control false positives | 0 |
| Control hard failures | 0 |
| Drift-type accuracy | 60.0% |
| Routing coverage | 65.0% |

**Timing:** premature 2 · on-time 7 · late 1 · missed 1

## Per scenario

| Scenario | Expected | Classification | Lead (d) | Type | Routing | Flag |
| --- | --- | --- | --- | --- | --- | --- |
| scn-001 | priority_displacement | on_time | 4 | NO | 50.0% |  |
| scn-002 | priority_displacement | late | -12 | NO | 50.0% |  |
| scn-003 | capacity_withdrawal | on_time | 0 | yes | 50.0% |  |
| scn-004 | priority_displacement | premature | 35 | NO | 50.0% |  |
| scn-005 | commitment_overrun | on_time | 36 | yes | 100.0% |  |
| scn-006 | attention_decay | on_time | 14 | yes | 50.0% |  |
| scn-007 | capacity_withdrawal | on_time | 1 | yes | 100.0% |  |
| scn-008 | control | control_clean | n/a | — | — |  |
| scn-009 | control | control_clean | n/a | — | — |  |
| scn-010 | priority_displacement | premature | 27 | NO | 50.0% |  |
| scn-011 | reasoning_contradiction | on_time | 5 | yes | 50.0% |  |
| scn-012 | scope_mutation | on_time | 36 | yes | 100.0% |  |
| scn-013 | metric_detachment | missed | n/a | — | — |  |
