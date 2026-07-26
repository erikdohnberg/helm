# Stage 2–3 component eval — 13 scenarios

- **Run date:** 2026-07-26
- **Model:** `claude-opus-4-8` (pinned), all calls via the content-addressed cache
- **Batching:** one day of signals per call (spec §6) — including the hard negatives
- **Spend:** $1.4253 of the $5.00 cap · 128 billed calls · 0 cache hits

## Headline

| Component metric | Value |
| --- | --- |
| Stage 2 — scenarios mapping ≥1 own signal | 11/11 |
| Stage 2 — **flag-signal recall** | 11/11 (100.0%) |
| Stage 2 — hard-negative over-mapping | 4/19 (78.9% clean) |
| Stage 3 — **span faithfulness** | 113/113 (100.0%) |
| Stage 3 — flag-signal substantive coverage | 11/11 (100.0%) |

## Per scenario

| Scenario | Expected type | Relevant | Flag signal | Mapped | Substantive | Extractions | Spans | $ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| scn-001 | priority_displacement | 5/5 | s3 | yes | yes | 11 | 11/11 | 0.1183 |
| scn-002 | priority_displacement | 5/5 | s3 | yes | yes | 8 | 8/8 | 0.1074 |
| scn-003 | capacity_withdrawal | 4/4 | s2 | yes | yes | 8 | 8/8 | 0.0875 |
| scn-004 | priority_displacement | 4/4 | s3 | yes | yes | 10 | 10/10 | 0.0966 |
| scn-005 | commitment_overrun | 4/4 | s2 | yes | yes | 7 | 7/7 | 0.0848 |
| scn-006 | attention_decay | 4/4 | s2 | yes | yes | 8 | 8/8 | 0.0872 |
| scn-007 | capacity_withdrawal | 4/4 | s1 | yes | yes | 8 | 8/8 | 0.0870 |
| scn-008 | control | 3/4 | — | — | — | 8 | 8/8 | 0.0796 |
| scn-009 | control | 2/3 | — | — | — | 3 | 3/3 | 0.0510 |
| scn-010 | priority_displacement | 3/4 | s3 | yes | yes | 6 | 6/6 | 0.0761 |
| scn-011 | reasoning_contradiction | 5/5 | s3 | yes | yes | 12 | 12/12 | 0.1271 |
| scn-012 | scope_mutation | 5/5 | s2 | yes | yes | 13 | 13/13 | 0.1337 |
| scn-013 | metric_detachment | 5/5 | s3 | yes | yes | 11 | 11/11 | 0.1118 |

## Hard-negative stress test (adversarial cross-org pairing)

| Signals from | Scored against charter of | Over-mapped |
| --- | --- | --- |
| scn-007 | scn-001 | 1/4 |
| scn-001 | scn-011 | 3/5 |
| scn-012 | scn-006 | 0/5 |
| scn-013 | scn-003 | 0/5 |

**Read this number as a stress test, not as production precision.** In production, Stage 2 scopes to a single org's charters via `org_id`: a signal is never offered a charter from a different company. These pairs deliberately violate that scoping, so what they measure is **over-mapping under adversarial pairing** — how readily the mapper reaches for a charter it should have no business matching. Keep the check: it is a good canary for a future **same-org, multi-charter** corpus, where the mapper really will have to choose between several live charters and this failure mode becomes a production one.

Over-mapped instances:

- `scn-007×scn-001` — s4 [metric] The exchange about a flat trajectory, missing the target, and lost engineering capacity concerns progress and committed resources for the activation outcome, though the '13 days'/'target 8' units don't clearly match the 24h activation metric.
- `scn-001×scn-011` — s2 [outcome] The onboarding pod's tech lead and Marco are spending capacity on SAML scoping requested by the CRO, which diverts effort from the pod's committed guided-onboarding work (r3) that drives the first-90-day churn outcome.
- `scn-001×scn-011` — s4 [reasoning] The pod owns onboarding (r3), but 40% of its capacity is diverted to SSO with onboarding A/B tests deferred, displacing the guided-onboarding lever central to the churn outcome.
- `scn-001×scn-011` — s5 [reasoning] Flat activation and reduced activation/onboarding work bears on r2/r3's premise that guided onboarding is the lever against early churn.

## Controls

- **scn-008** — 3/4 relevant, 8 substantive extractions.
- **scn-009** — 2/3 relevant, 2 substantive extractions.

**Substantive extractions on a control are correct-by-design, not a defect.** Stage 3's job is to surface latent competing-priority evidence *faithfully*; scn-009 genuinely contains a lively, charter-excluded integration thread, and refusing to extract it would be Stage 3 hiding evidence from the stages that need it. Telling committed drift from uncommitted discussion on that evidence is **Stage 5's** discrimination job (spec §3: the distinction is commitment, not topic) — and it is scored there, as a control false positive. So this eval reports the count and does not mark a control for review on it.

## Failure cases (0)

- none
