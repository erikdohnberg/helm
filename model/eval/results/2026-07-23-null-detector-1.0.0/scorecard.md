# Eval scorecard — null-detector v1.0.0

- **Run date:** 2026-07-23
- **Contracts version:** 1.0.0
- **Scenarios:** 10 (8 drift, 2 control)

## Scorecard

| Metric | Value |
| --- | --- |
| Detection recall | 0.0% |
| Precision proxy (on-time+late / all flags) | n/a |
| Median lead time (days) | n/a |
| Control false positives | 0 |
| Control hard failures | 0 |
| Drift-type accuracy | n/a |
| Routing coverage | n/a |

**Timing:** premature 0 · on-time 0 · late 0 · missed 8

## Per scenario

| Scenario | Expected | Classification | Lead (d) | Type | Routing | Flag |
| --- | --- | --- | --- | --- | --- | --- |
| scn-001 | priority_displacement | missed | n/a | — | — |  |
| scn-002 | priority_displacement | missed | n/a | — | — |  |
| scn-003 | capacity_withdrawal | missed | n/a | — | — |  |
| scn-004 | priority_displacement | missed | n/a | — | — |  |
| scn-005 | commitment_overrun | missed | n/a | — | — |  |
| scn-006 | attention_decay | missed | n/a | — | — |  |
| scn-007 | capacity_withdrawal | missed | n/a | — | — |  |
| scn-008 | control | control_clean | n/a | — | — |  |
| scn-009 | control | control_clean | n/a | — | — |  |
| scn-010 | priority_displacement | missed | n/a | — | — |  |
