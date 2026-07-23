<!-- GENERATED FILE — do not edit by hand.
     Source of truth: model/scenarios/_meta.json + scn-*.json
     Regenerate: node --experimental-strip-types model/scenarios/generate-doc.ts -->

# Drift Eval Scenarios

**Schema version:** 0.1

Seed scenarios for Helm's drift-detection eval set. Each scenario pairs an anchored Outcome Charter with a signal timeline, the moment drift became visible to people involved, and ground-truth labels for what Helm should have done and when.

## Coverage (v1.1 taxonomy)

| Drift type | Scenarios |
| --- | --- |
| Attention decay | scn-006 |
| Priority displacement | scn-001, scn-002, scn-004, scn-010 |
| Capacity withdrawal | scn-003, scn-007 |
| Commitment overrun | scn-005 |
| Scope mutation | — (gap) |
| Reasoning contradiction | — (gap) |
| Metric detachment | — (gap) |
| _non-drift control_ | scn-008 (deliberate_replacement), scn-009 (uncommitted_discussion) |

## Design notes

**Severity definitions**

- **major** — Drift materially changes what the quarter is about: staffing moved, an anchored outcome effectively replaced or abandoned, or the charter metric can no longer be hit as planned.
- **minor** — Drift bleeds capacity or attention from an anchored outcome without formally displacing it. The outcome survives but degraded.
- **none** — Control cases. Either a deliberate, recorded change of intent (not drift) or noise that resembles drift but never materializes.

**observability_field** — Each timeline signal is tagged 'explicit' (the drift is stated in the artifact itself) or 'implicit' (drift is only inferable by comparing the artifact against the charter). Implicit-heavy scenarios are the harder detection cases.

**ground_truth_usage** — earliest_reasonable_flag_signal points at the signal id after which a well-calibrated Helm has enough evidence to flag. Flagging earlier is a precision risk; flagging later than human_realization is a recall failure. Evals should also score routing: a flag that reaches only the side that already holds that half of the picture has not closed the gap described in information_asymmetry.

**known_gaps** — All scenarios are single-outcome. Real quarters have interacting outcomes (drift on one funds another); add multi-outcome scenarios in a later version.

**failure_model** — Drift in these scenarios is never concealment. Every actor operates in good faith on a locally coherent picture; the misalignment lives in the gaps between pictures. Typical gap shapes: leadership changes a priority without seeing the trade-off it forces downstream; a team absorbs a change without knowing leadership's intent shifted; two leaders each assume the other reconciled a request against the plan. The information_asymmetry block on each scenario names who held which picture and what each side wrongly assumed the other knew. Helm's job is to close these gaps by testing assumptions against the record of intent — not to catch people hiding things.

---

## scn-001 — Enterprise deal injects SSO work into an activation quarter

**Drift type:** Priority displacement  ·  **is_drift:** true  ·  **severity:** major  ·  **should_flag:** true

**Company:** Ledgerline — Series B B2B SaaS, ~120 people, product-led with an emerging enterprise sales motion  ·  **Team:** Growth pod: 1 PM, 5 engineers, 1 designer

### Charter

- **Double self-serve activation** — New workspaces reach their first shared ledger within 24 hours of signup
- **Metric:** Percentage of new workspaces activated within 24h (17% → 34%, FY26 Q3)
- **Reasoning:** Paid acquisition is efficient but activation is the leak. Board agreed the quarter is about converting signups we already get, not adding channels or segments.
- **Trade-offs:** Enterprise feature requests deferred to Q4, including SSO and audit logs; No new onboarding experiments for the EU segment this quarter
- **Owners:** outcome — Priya Nair (PM); decision — Dana Okafor (CPO)  ·  **Anchored:** 2026-06-28

### Drift

- **Mechanism (sales_injection, major):** A $480k ARR prospect makes SAML SSO a condition of signature. The AE escalates to the CRO, who asks the growth pod's tech lead directly whether SSO is 'a couple weeks of work.' Two engineers start on it without the charter being revisited. The trade-off recorded at anchoring (SSO deferred to Q4) is never mentioned in any of the threads.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-07-14 | slack:#sales-eng | implicit | AE: 'Meridian Capital is verbal at 480k but SSO is a hard requirement for their security review. Who owns that?' |
| s2 | 2026-07-15 | slack:#growth-pod | implicit | Tech lead: 'Taking a look at SAML scoping today, CRO asked. Marco is pairing with me. Should be quick.' |
| s3 | 2026-07-17 | doc:google | explicit | New doc 'SAML SSO – Technical Design (Meridian)' created and shared with the growth pod, 9 pages, two named engineers as authors. |
| s4 | 2026-07-21 | meeting:sprint-planning | explicit | Sprint 4 commits 40% of pod capacity to SSO stories. Activation experiment backlog untouched; two onboarding A/B tests pushed a sprint. |
| s5 | 2026-08-04 | meeting:metrics-review | implicit | Activation flat at 18% for three weeks. PM notes 'we shipped less activation work than planned in July.' |

### Human realization

- **First noticed by:** Priya Nair (PM, outcome owner) on 2026-07-21 (lag from first signal: 7 days)
- **Moment:** At sprint 4 planning (s4), Priya realizes two of five engineers are now on SSO and the activation experiment queue has been pushed twice. Until the board was in front of her, the SSO work read as a side investigation, not a reallocation.
- **Leadership aware:** 2026-08-11 — CPO learns at the mid-quarter review when Priya presents the flat activation number and names SSO as the cause. The CRO and CPO had never compared the SSO ask against the Q3 charter — each assumed the other had, and the pod assumed both had. Three good-faith pictures, none containing the collision. (lag: 28 days)

### Ground truth

- **earliest_reasonable_flag_signal:** s3
- **flag_rationale:** s1 and s2 alone could be a scoping exercise. A shared technical design doc with two named engineers (s3) is committed effort against a deliverable the charter explicitly deferred. Waiting for s4 still beats the humans but gives up a week.
- **expected_flag_summary:** Two growth-pod engineers are building SAML SSO for the Meridian deal. The Q3 record of intent explicitly deferred SSO to Q4 to protect self-serve activation. Re-align with the CPO and CRO before sprint planning, or record a deliberate change of intent and decide what stops.
- **grader_notes:** A flag at s1 or s2 should score as premature. The eval should reward citing the specific recorded trade-off, not just detecting new work.

### Information asymmetry

- **Team picture:** The pod's tech lead believed the CRO's ask carried implicit leadership approval — an exec asked, so the priority call had presumably been made. The SSO work felt sanctioned, not injected.
- **Leadership picture:** The CRO believed SSO was a small favor that wouldn't move the quarter; he never saw the Q3 charter's explicit deferral. The CPO didn't know the ask had been made at all until mid-quarter.
- **The gap:** Each of the two leaders assumed the other had reconciled the request against the plan; the pod assumed both had. Nobody was wrong within their own picture. The recorded trade-off (SSO deferred to Q4) was the one artifact that could have collided the pictures, and nobody in the thread knew to look at it.
- **Who needed to hear the flag:** CPO (owns the charter she doesn't know is being spent) and CRO (made an ask without seeing its price).

---

## scn-002 — Post-conference exec redirect displaces a reliability outcome

**Drift type:** Priority displacement  ·  **is_drift:** true  ·  **severity:** major  ·  **should_flag:** true

**Company:** Fieldnote — Series C field-service software, ~300 people  ·  **Team:** Platform group: 2 PMs, 11 engineers across two pods

### Charter

- **Cut sync failures for offline crews** — Field crews on poor connectivity stop losing work to failed syncs
- **Metric:** Sync failure rate on flaky-network sessions (6.1% → Under 1.5%, FY26 Q3)
- **Reasoning:** Sync failures are the top churn-tagged complaint for two consecutive quarters and the top support ticket category. Retention is the year's theme.
- **Trade-offs:** No net-new AI features from the platform group this quarter; Reporting engine refresh deferred
- **Owners:** outcome — Tomás Reyes (PM); decision — June Park (CEO)  ·  **Anchored:** 2026-06-30

### Drift

- **Mechanism (exec_redirect, major):** The CEO returns from an industry conference convinced a voice-driven job-notes assistant is existential. She asks the platform group to 'get a demo together for the September customer summit.' The demo becomes a workstream. Nobody frames it as replacing the sync outcome; it is framed as 'in addition,' but the same engineers are doing both, and sync work is what gives.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-07-20 | meeting:exec-staff | explicit | CEO: 'Every competitor at the show had a voice angle. I want us demoing voice notes at the summit. Platform group should own it since it touches the data layer.' |
| s2 | 2026-07-22 | slack:#platform | implicit | Eng manager: 'Spinning up a small voice-notes spike, June's ask. Keeping it timeboxed to a week.' |
| s3 | 2026-07-31 | slack:#platform | explicit | 'Spike went well, extending. Amara and Deep moving to voice full-time through the summit. Sync conflict-resolution work moves to the back half.' |
| s4 | 2026-08-12 | doc:google | explicit | 'Summit Demo Plan' doc lists 4 platform engineers, a designer, and weekly CEO reviews. No mention of the sync outcome anywhere in the doc. |
| s5 | 2026-08-25 | meeting:standup-transcripts | implicit | Fourteen consecutive platform standups with zero sync-related updates. |

### Human realization

- **First noticed by:** Tomás Reyes (PM, outcome owner) on 2026-07-31 (lag from first signal: 11 days)
- **Moment:** Tomás registers the shift at s3 — the moment 'timeboxed spike' becomes two engineers full-time — but his picture at that point is that a decision has been made above him: the CEO redirected the group, so the trade-off must have been weighed at her level. He plans around it as settled direction. The misalignment isn't that he withheld anything; it's that the one person who could see the cost assumed the one person with authority had already seen it.
- **Leadership aware:** 2026-09-30 — At the Q3 board meeting, a director asks about the sync failure metric (it moved from 6.1% to 5.4%, far off target). The CEO realizes the trade she made in July was never made explicitly, never priced, and never communicated to the board that had endorsed the retention theme. (lag: 72 days)

### Ground truth

- **earliest_reasonable_flag_signal:** s3
- **flag_rationale:** s1 is a legitimate exec exploration and s2 is a timeboxed spike, both compatible with the charter. s3 reassigns named engineers indefinitely and explicitly pushes sync work; that is the commitment point.
- **expected_flag_summary:** Two platform engineers moved full-time to the voice-notes summit demo and sync conflict-resolution work was pushed to late quarter. The Q3 record of intent commits this group to cutting sync failures below 1.5% and rules out net-new AI features. If voice replaces or reduces the sync outcome, record that decision and its cost.
- **grader_notes:** Hard social case: the drift source is the decision owner herself, and the authority gradient makes the gap self-sealing — the PM reasonably assumes an exec-initiated change was priced, the exec reasonably assumes an unpriced change would be challenged. Score whether the flag is addressed to both sides of that gap (CEO and PM) and whether it frames an unpriced trade-off as a decision to make, not an accusation. Helm's value here is that a neutral record can ask the question neither person's picture prompted them to ask.

### Information asymmetry

- **Team picture:** Tomás read the CEO's summit ask as a decision already made above him — when the decision owner herself redirects the group, a PM reasonably assumes the trade-off was weighed at her level. He planned around it as settled direction, not as something awaiting his challenge.
- **Leadership picture:** The CEO genuinely believed the demo was additive — a small, exciting side effort. She never connected 'platform group builds the demo' to 'the sync outcome loses its engineers,' because in her picture the sync work was a whole-group commitment with slack in it.
- **The gap:** A classic authority-gradient gap: the person with the trade-off knowledge (Tomás) assumed the person with the authority (June) already had it; the person with the authority assumed no trade-off existed to know. Both pictures were internally consistent for ten weeks.
- **Who needed to hear the flag:** The CEO, primarily — she is the decision owner who made a trade she couldn't see. Tomás secondarily, as confirmation that the trade-off was in fact never priced and that surfacing it is expected, not insubordinate.

---

## scn-003 — Security incident consumes the quarter; the mobile launch outcome silently slips

**Drift type:** Capacity withdrawal  ·  **is_drift:** true  ·  **severity:** major  ·  **should_flag:** true

**Company:** Brightmark Health — Healthcare scheduling platform, ~200 people, HIPAA-regulated  ·  **Team:** Mobile squad: 1 PM, 6 engineers

### Charter

- **Launch patient mobile app in two pilot networks** — Patients in two pilot hospital networks book and manage appointments from the app
- **Metric:** Pilot bookings made via mobile app (0 → 5,000 bookings across both networks, FY26 Q3, launch by Sep 8)
- **Reasoning:** Both pilot contracts have mobile availability written in for Q3. Slipping risks the renewal conversation for one network.
- **Trade-offs:** Web rebooking-flow improvements deferred; Android tablet support out of scope for the pilot
- **Owners:** outcome — Hannah Cho (PM); decision — Marcus Bell (VP Product)  ·  **Anchored:** 2026-06-25

### Drift

- **Mechanism (incident_reprioritization, major):** A credential-stuffing incident in mid-July triggers a mandatory hardening program. The mobile squad loses four of six engineers to incident response and remediation for six weeks. Everyone treats this as obviously correct — and it is — but nobody re-anchors the quarter. The squad assumes leadership has connected the staffing plan to the launch date (the plan is leadership's own document); leadership assumes the squad would escalate if the date were at risk. The Sep 8 date lives on in the charter, the pilot contracts, and marketing's plans while both sides believe the other is holding it.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-07-16 | slack:#incident-1207 | explicit | Incident declared. Mobile squad engineers pulled into response rotation 'until further notice.' |
| s2 | 2026-07-24 | doc:google | explicit | 'Post-Incident Hardening Plan' assigns 4 mobile-squad engineers to remediation workstreams through end of August. |
| s3 | 2026-08-06 | meeting:mobile-squad-sync | explicit | Hannah: 'Realistically Sep 8 is not happening — I assume Marcus knows, the hardening plan is his org's doc. I'll confirm with him once the incident calms down.' No update reaches the charter or the pilot networks. |
| s4 | 2026-08-19 | slack:#marketing | implicit | Marketing: 'Locking the pilot launch comms for Sep 8 — mobile team, anything blocking?' No reply for two days. |

### Human realization

- **First noticed by:** The mobile squad collectively on 2026-07-24 (lag from first signal: 8 days)
- **Moment:** The squad's picture contains the slip by s2 and Hannah names it at s3 — as an acknowledgment of what she assumes is already known upstream, since the staffing plan causing it is a leadership document. The organizational realization comes at s4: marketing's comms question exposes that the slip existed in nobody's picture outside the squad. Hannah tells Marcus on Aug 21 that the launch moves at least five weeks and one pilot contract's language becomes a legal question — the first moment the knowledge and the exposure sit in the same conversation.
- **Leadership aware:** 2026-08-21 — VP Product learns via the marketing thread escalation, 36 days after the hardening plan made the slip inevitable. His words in the retro: 'Nobody decided to slip the launch. It just became true.' — an accurate description: each side assumed the other held the consequence, so no one carried it across. (lag: 36 days)

### Ground truth

- **earliest_reasonable_flag_signal:** s2
- **flag_rationale:** The incident response itself is not drift and must not be flagged as a problem. The flaggable event is s2: a written plan removing two-thirds of the squad through August makes the anchored Sep 8 date unachievable, and the charter carries an external contractual commitment. The gap between operational reality and the record of intent opens at s2.
- **expected_flag_summary:** The hardening plan assigns 4 of 6 mobile-squad engineers to remediation through August. The anchored mobile pilot launch (Sep 8, contractual for both networks) cannot hold on remaining capacity. The incident work is not in question — but the launch outcome needs a deliberate re-plan and the pilot networks need a revised date.
- **grader_notes:** Tone matters most here. Penalize flags that read as questioning the incident response. Reward flags that separate 'this reprioritization is correct' from 'its consequence to an anchored, externally-committed outcome is unrecorded.'

### Information asymmetry

- **Team picture:** Hannah and the squad assumed leadership understood the launch consequence of the hardening plan — the incident was company-wide news, the remediation plan was a leadership document, so surely whoever wrote it had done the arithmetic on the mobile date. Saying 'Sep 8 is not happening' inside the squad felt like acknowledging the obvious, not disclosing something new.
- **Leadership picture:** Marcus assumed the opposite: the squad tracked its own launch risk and would escalate if the date was in danger. Silence read as 'still on track despite the incident.' The hardening plan's author optimized for security coverage and never looked at what the borrowed engineers had been committed to.
- **The gap:** A mutual-assumption gap: each side believed the other side already knew, so neither side said anything to the other. The knowledge existed fully formed inside the squad and the consequence existed fully formed in the contracts — no one carried it across.
- **Who needed to hear the flag:** Marcus (VP Product) — he holds the pilot-network relationships and the contractual exposure — plus the hardening plan's owner, so the remediation staffing decision could be made with its full cost visible.

---

## scn-004 — Merchandising asks bleed capacity from a checkout conversion outcome

**Drift type:** Priority displacement  ·  **is_drift:** true  ·  **severity:** minor  ·  **should_flag:** true

**Company:** Portobello — Marketplace for independent food producers, ~80 people  ·  **Team:** Checkout pod: 1 PM, 4 engineers

### Charter

- **Raise checkout completion** — Fewer carts abandoned between payment entry and confirmation
- **Metric:** Checkout completion rate (71% → 78%, FY26 Q3)
- **Reasoning:** Payment-step abandonment is the single largest recoverable revenue leak. One focused quarter beats spreading the pod across the funnel.
- **Trade-offs:** Merchandising and promo tooling requests routed to Q4 backlog; No checkout UI restyle; conversion changes only
- **Owners:** outcome — Leo Grant (PM); decision — Sofia Marsh (Head of Product)  ·  **Anchored:** 2026-06-29

### Drift

- **Mechanism (scope_creep, minor):** Growth marketing keeps bringing 'two-day' merchandising asks — a promo banner slot, a bundle-pricing tweak, a seasonal badge. Each is small, each is accepted to be a good partner, none is compared against the charter's explicit routing of merchandising work to Q4. By late August roughly 20% of pod capacity has gone to merchandising, and the two hardest conversion bets keep not starting.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-07-09 | slack:#checkout-pod | implicit | Growth: 'Tiny ask — can we get a promo banner slot on cart for the harvest campaign? Probably a day of work?' Eng: 'Sure, squeezing it in.' |
| s2 | 2026-07-23 | slack:#checkout-pod | implicit | Growth: 'Bundle pricing needs a small change for September.' Accepted in-thread, no ticket linked to any outcome. |
| s3 | 2026-08-05 | meeting:sprint-planning | explicit | Third consecutive sprint carries 'partner asks' as a labeled swimlane, now sized at ~1 engineer-week per sprint. The saved-payment-methods bet slips again. |
| s4 | 2026-08-27 | meeting:retro | explicit | EM in retro: 'We've done nine merchandising tickets this quarter. Did we ever decide that? I thought merchandising was a Q4 thing.' |

### Human realization

- **First noticed by:** Ana Duarte (EM) on 2026-08-27 (lag from first signal: 49 days)
- **Moment:** The retro (s4). No single ask felt like a decision, so nobody compared the accumulating total against the charter until the EM counted tickets. The PM had a vague sense of squeeze but attributed it to estimation, not injection.
- **Leadership aware:** 2026-09-03 — Leo raises it in his 1:1 with Sofia after the retro. Sofia's reaction: mild — 'good catch, cap it at half a day a sprint' — because the outcome is dented, not dead. Completion lands at 75% vs the 78% target. (lag: 56 days)

### Ground truth

- **earliest_reasonable_flag_signal:** s3
- **flag_rationale:** s1 and s2 individually are below any sane flagging threshold; flagging single small favors would make Helm insufferable. s3 is the pattern point: a recurring, sized swimlane of charter-excluded work displacing a named conversion bet for the second time.
- **expected_flag_summary:** Merchandising asks have become a recurring sprint swimlane (~1 engineer-week per sprint) and the saved-payment-methods bet has slipped twice. The Q3 record of intent routes merchandising work to Q4. Worth a deliberate call: cap it, accept the drag on the 78% target, or re-anchor.
- **grader_notes:** This is the accumulation case. Reward detectors that aggregate small signals over time; penalize both per-ask flags (noisy) and silence through s3 (the whole point is catching what no single moment reveals).

### Information asymmetry

- **Team picture:** Engineers accepted each merchandising ask as isolated neighborliness; the PM sensed schedule pressure but attributed it to estimation error. Nobody held the running total, so nobody's picture contained a decision to compare against the charter.
- **Leadership picture:** Sofia believed the Q3 routing of merchandising to Q4 was holding, because no one had asked her to change it — and no one had, because no single ask felt big enough to ask about.
- **The gap:** An aggregation gap rather than a party-to-party one: the drift existed only as a sum, and no individual's picture contained the sum until the EM counted tickets. The misalignment wasn't between people; it was between everyone's episodic view and the cumulative reality.
- **Who needed to hear the flag:** Leo (outcome owner, to make the cap-or-accept call) and the growth team (so asks route through a decision rather than a favor).

---

## scn-005 — Top-account escalation peels an engineer off 'for two weeks' that become eight

**Drift type:** Commitment overrun  ·  **is_drift:** true  ·  **severity:** minor  ·  **should_flag:** true

**Company:** Cartesian Data — Analytics platform, ~150 people, revenue concentrated in top 10 accounts  ·  **Team:** Reporting pod: 1 PM, 4 engineers

### Charter

- **Ship scheduled report delivery** — Customers schedule recurring report exports instead of manually re-running them
- **Metric:** Weekly active accounts using scheduled delivery (0 → 150 accounts by quarter end, FY26 Q3)
- **Reasoning:** Most-requested feature across all segments for a year; also the biggest driver of low-value support load.
- **Trade-offs:** Custom report-builder enhancements for individual accounts deferred; No PDF layout engine replacement this quarter
- **Owners:** outcome — Grace Obi (PM); decision — Daniel Voss (VP Product)  ·  **Anchored:** 2026-07-01

### Drift

- **Mechanism (customer_escalation, minor):** The largest account (11% of ARR) escalates about report-builder gaps during their renewal window. CS asks for 'someone for two weeks.' One engineer is loaned. The account keeps finding adjacent gaps; the loan renews informally by inaction, sprint after sprint, until it has run eight weeks — 25% of pod capacity for most of the quarter, against work the charter explicitly deferred.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-07-13 | slack:#cs-escalations | explicit | CS lead: 'Northgate renewal is shaky over report-builder gaps. Can reporting pod loan someone for two weeks? Daniel is fine with it.' |
| s2 | 2026-07-27 | slack:#reporting-pod | implicit | Engineer: 'Northgate found two more issues, staying on it another sprint.' No end date discussed. |
| s3 | 2026-08-10 | meeting:sprint-planning | implicit | Scheduled-delivery beta scope trimmed ('cut Slack delivery channel, email only for v1') to fit remaining capacity. Northgate work still on the board. |
| s4 | 2026-09-01 | meeting:pod-sync | explicit | Grace: 'We said two weeks in July. It's been seven. I'm pulling him back after this sprint unless someone tells me otherwise.' |

### Human realization

- **First noticed by:** Grace Obi (PM, outcome owner) on 2026-09-01 (lag from first signal: 50 days)
- **Moment:** Grace half-notices at s3 when she trims her own beta scope to absorb the loss, but the moment she names it (s4) comes only when she does the arithmetic on the original 'two weeks.' The informal renewal pattern hid the total: no single sprint extension was a decision worth escalating.
- **Leadership aware:** 2026-09-02 — Grace messages Daniel directly. Daniel approved 'two weeks' in July and had no idea it was still running; the approval had become permanent by default. (lag: 51 days)

### Ground truth

- **earliest_reasonable_flag_signal:** s2
- **flag_rationale:** s1 is an approved, bounded exception — flagging it second-guesses a reasonable call. s2 is where the bound quietly dissolves: the loan extends past its stated window with no end date and no re-approval. Time-bounded exceptions that outlive their bound are a distinct, highly detectable drift signature.
- **expected_flag_summary:** The Northgate loan was approved for two weeks on Jul 13 and is entering its third sprint with no end date. Scheduled delivery — the anchored Q3 outcome — has already had beta scope trimmed to absorb it. Re-approve the extension explicitly or set a return date.
- **grader_notes:** Reward detectors that track stated durations of exceptions and flag when reality outruns them. The eval should check the flag references the original approval terms, since that's what makes it actionable rather than nagging.

### Information asymmetry

- **Team picture:** The loaned engineer and Grace each treated every extension as the tail of the original approved exception — 'still on the Northgate thing Daniel okayed.' Each sprint's extension inherited legitimacy from July's approval.
- **Leadership picture:** Daniel's picture still contained the original terms: a two-week loan that ended in July. He was never wrong about what he approved; his picture just stopped updating when the informal renewals never reached him.
- **The gap:** A stale-approval gap: the exception's legitimacy persisted downstream long after its approved bounds expired, while upstream the approver believed it was over. Neither side withheld anything — the renewals simply had no channel back to the person whose approval they were trading on.
- **Who needed to hear the flag:** Daniel (his approval is being extended without him) and Grace (so the re-approve-or-return decision is hers to force, with the original terms in hand).

---

## scn-006 — Data migration outcome starves quietly — no injection, attention just fades

**Drift type:** Attention decay  ·  **is_drift:** true  ·  **severity:** major  ·  **should_flag:** true

**Company:** Ostrava Systems — Logistics SaaS, ~250 people  ·  **Team:** Data platform team: 1 PM, 7 engineers

### Charter

- **Migrate reporting to the new event pipeline** — All customer-facing reports read from the new event pipeline; legacy warehouse decommission unblocked
- **Metric:** Reports migrated (of 34) (0 of 34 → 34 of 34, FY26 Q3)
- **Reasoning:** The legacy warehouse contract renews in January at 3x cost. Migration this quarter is what makes declining the renewal possible.
- **Trade-offs:** New data-export API paused; Two engineers reassigned from the ingestion team for the quarter
- **Owners:** outcome — Sam Whitfield (PM); decision — Ingrid Halvorsen (CTO)  ·  **Anchored:** 2026-06-27

### Drift

- **Mechanism (quiet_starvation, major):** No competing priority arrives. The first 14 migrations are the easy ones and get done by early August; the remaining 20 involve gnarly legacy report logic nobody wants to touch. Engineers gravitate to interesting adjacent work (pipeline performance tuning, internal tooling) that feels related but isn't migration. The PM goes on parental leave for four weeks with a thin handoff. Migration count freezes at 14 for five weeks and nobody is lying, hiding anything, or deciding anything — attention simply left.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-08-07 | doc:migration-tracker | implicit | Tracker shows 14/34. Last row updated Aug 7. |
| s2 | 2026-08-18 | slack:#data-platform | implicit | Channel activity healthy but topic mix shifts: pipeline perf and tooling threads dominate; last message containing 'migration' was Aug 8. |
| s3 | 2026-08-31 | meeting:standup-transcripts | implicit | Three weeks of standups mention migration zero times. Covering PM reports 'data platform: on track' upward, based on general channel activity. |
| s4 | 2026-09-14 | meeting:pod-sync | explicit | Sam, back from leave: 'The tracker says 14. It said 14 when I left. What happened?' Silence, then: 'The remaining ones are all the horrible cross-tenant reports.' |

### Human realization

- **First noticed by:** Sam Whitfield (PM, outcome owner) on 2026-09-14 (lag from first signal: 38 days)
- **Moment:** Returning from leave (s4), Sam sees the frozen tracker in his first sync. Nobody in the room could name when work had stopped — there was no stopping moment, which is precisely why no one noticed. The covering PM had reported on-track for a month in good faith.
- **Leadership aware:** 2026-09-16 — Sam escalates to the CTO with the January renewal math: 20 hard migrations in 11 remaining weeks including holidays. The CTO has to open renewal negotiations she expected to skip. (lag: 40 days)

### Ground truth

- **earliest_reasonable_flag_signal:** s2
- **flag_rationale:** s1 alone is a pause, not a pattern. By s2 the tracker has been frozen ~10 days AND the team's conversational attention has measurably left the outcome — the two together are the starvation signature. This is the inactivity-based Adrift case from the product spec, and it's the case humans are structurally worst at catching because there is no event to notice.
- **expected_flag_summary:** Migration count has been frozen at 14/34 since Aug 7 and the outcome has disappeared from team discussion. The remaining 20 reports gate declining the January warehouse renewal. This outcome may be adrift — worth an explicit check-in before the on-track reporting compounds.
- **grader_notes:** The purest test of inactivity detection. There is no injection signal to key on; only absence. Also tests the 'reporting says on-track, evidence says frozen' contradiction (s3). Flag timing target: beat s4 by 3+ weeks.

### Information asymmetry

- **Team picture:** Each engineer believed their adjacent work (perf tuning, tooling) was reasonable while someone else carried the hard migrations forward. The covering PM's picture was built from channel activity, which looked healthy, so 'on track' was an honest read of the evidence available to him.
- **Leadership picture:** Ingrid's picture was the covering PM's reports: on track. Her January renewal plan rested on it.
- **The gap:** A proxy-signal gap: the covering PM was reporting on activity, leadership was consuming reports about progress, and the two measured different things. Nobody's picture was dishonest — the tracker that would have collided them sat unopened because nothing prompted anyone to open it.
- **Who needed to hear the flag:** The covering PM first (his good-faith 'on track' is the vector carrying the gap upward), then Ingrid, whose renewal timeline depends on the real count.

---

## scn-007 — Reorg moves 3 of 5 engineers; the charter target is never revised

**Drift type:** Capacity withdrawal  ·  **is_drift:** true  ·  **severity:** major  ·  **should_flag:** true

**Company:** Juniper Freight — Freight marketplace, ~400 people, mid-reorg after a flat quarter  ·  **Team:** Carrier experience pod: 1 PM, 5 engineers (pre-reorg)

### Charter

- **Halve carrier onboarding time** — New carriers go from signup to first accepted load in days, not weeks
- **Metric:** Median signup-to-first-load time (16 days → 8 days, FY26 Q3)
- **Reasoning:** Carrier supply is the marketplace constraint; onboarding friction is the cheapest supply lever available.
- **Trade-offs:** Carrier mobile app improvements deferred; Document-verification vendor migration pushed to Q4
- **Owners:** outcome — Ravi Menon (PM); decision — Claire Fontaine (COO)  ·  **Anchored:** 2026-06-26

### Drift

- **Mechanism (headcount_reallocation, major):** A July reorg moves three of the pod's five engineers to a new 'shipper AI' initiative. The reorg doc covers reporting lines and team names in detail; it says nothing about outcome commitments. The carrier charter — target, timeline, metric — carries forward untouched into a pod that now has 40% of the capacity it was scoped for. The team knows instantly; the record of intent doesn't.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-07-28 | doc:google | explicit | 'H2 Org Update' doc: three named carrier-pod engineers move to Shipper AI effective Aug 4. No outcomes or targets mentioned anywhere in the doc. |
| s2 | 2026-07-29 | slack:#carrier-pod | explicit | Engineer: 'so are we still doing 8 days with two of us? lol.' PM: 'Raising it. Assume yes for now.' |
| s3 | 2026-08-11 | meeting:ops-review | implicit | Q3 goals slide shown to COO still lists '8 days by EOQ' with no annotation. Ravi's spoken caveat ('with the reorg this is at risk') doesn't make it into the deck or notes. |
| s4 | 2026-09-08 | meeting:ops-review | explicit | Metric at 13 days, trajectory flat. COO: 'Why are we this far off?' Ravi: 'We lost three engineers in the reorg.' COO: 'Then why does the target still say 8?' |

### Human realization

- **First noticed by:** The carrier pod, immediately on 2026-07-29 (lag from first signal: 1 days)
- **Moment:** The team sees the mismatch the day the reorg doc lands (s2) and even jokes about it. The realization that matters is the COO's at s4: the reorg she signed off on had a cost to an anchored outcome that no one priced at decision time, because the reorg process and the outcome record were separate systems that never met.
- **Leadership aware:** 2026-09-08 — The COO connects reorg to target at the September ops review, six weeks after her own org update caused the gap. Ravi's verbal caveat in August never became part of any record. (lag: 42 days)

### Ground truth

- **earliest_reasonable_flag_signal:** s1
- **flag_rationale:** Unusually, the very first signal suffices: a published org change removing 60% of a pod's capacity is mechanically incompatible with the pod's anchored target. No pattern-accumulation needed. This is the case where structured records shine — a human COO missed it for six weeks; a system holding both documents should catch it same-day.
- **expected_flag_summary:** The H2 org update moves 3 of 5 carrier-pod engineers to Shipper AI on Aug 4. The pod's anchored Q3 outcome (halve onboarding time to 8 days) was scoped for full strength and hasn't been revised. Re-scope the target, restaff, or record the trade-off — before the goals slide goes to the next ops review unchanged.
- **grader_notes:** Tests cross-document reasoning: reorg doc × charter. Also note s2 as a secondary signal type worth studying — team sarcasm ('lol') as an honest drift indicator that formal channels suppress (Ravi's caveat at s3 evaporating).

### Information asymmetry

- **Team picture:** The pod saw the capacity-target mismatch on day one and assumed the reorg's authors had either accepted it or would revise the target — reorgs come from above, so surely the goals would be reconciled above. Ravi raised it verbally, believed it was now 'known,' and moved on.
- **Leadership picture:** Claire's reorg picture was organizational: reporting lines, team shapes, the new initiative's staffing. Outcome commitments lived in a different document she wasn't looking at while designing the org. Ravi's spoken caveat reached her ears in a meeting but never attached to anything she'd revisit.
- **The gap:** A systems gap: the reorg process and the outcome record were maintained in separate artifacts that no step required anyone to reconcile. The team's knowledge was even spoken aloud to the right person — and still evaporated, because a verbal caveat has no persistence and Claire's picture had nowhere to store it.
- **Who needed to hear the flag:** Claire (COO) at reorg publication, while restaffing or re-scoping was still cheap — with the caveat in durable, revisitable form rather than as a meeting remark.

---

## scn-008 — CONTROL — Competitor launch triggers a deliberate, recorded replacement (not drift)

**Drift type:** none (deliberate_replacement)  ·  **is_drift:** false  ·  **severity:** none  ·  **should_flag:** false

**Company:** Ledgerline — Same company as scn-001, following quarter  ·  **Team:** Growth pod: 1 PM, 5 engineers

### Charter

- **Expand EU payment methods** — EU customers pay with local payment methods instead of cards only
- **Metric:** EU checkout conversion (58% → 68%, FY26 Q4)
- **Reasoning:** EU is the fastest-growing segment and card-only checkout is the top cited friction in churn interviews.
- **Trade-offs:** US checkout experiments paused; Payment-provider consolidation deferred
- **Owners:** outcome — Priya Nair (PM); decision — Dana Okafor (CPO)  ·  **Anchored:** 2026-09-29

### Drift

- **Mechanism (none_deliberate_replacement, none):** A competitor launches free invoicing in October, directly attacking Ledgerline's wedge. Leadership convenes within a week, decides to replace the EU payments outcome with a defensive invoicing outcome, documents the reasoning and what stops, notifies the pod, and re-anchors. The strategy changed fast and dramatically — but every step was deliberate, recorded, and communicated. This is the process working, not drift.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-10-13 | slack:#competitive-intel | implicit | 'Quill just launched free invoicing. This is aimed straight at our SMB base.' Thread gets 40+ replies in a day. |
| s2 | 2026-10-16 | meeting:exec-staff | explicit | Decision meeting: replace EU payments outcome with 'Ship invoicing parity + differentiation by Dec 15.' Explicit discussion of what stops and what it costs (EU conversion target moves to Q1). |
| s3 | 2026-10-17 | doc:google | explicit | 'Q4 Re-anchor: Invoicing Response' doc — new outcome, metric, reasoning, and a 'What stops' section naming the EU payments deferral and its cost. Shared org-wide. |
| s4 | 2026-10-20 | slack:#growth-pod | explicit | Pod pivots sprint planning to invoicing. EU payments work closed out cleanly with a written handoff state. |

### Human realization

- **First noticed by:** n/a — change was deliberate and communicated before execution shifted (lag from first signal: — days)
- **Moment:** No drift-realization moment exists. The pod learned of the change from the decision, not the reverse.
- **Leadership aware:** 2026-10-16 — Leadership made the change; awareness precedes execution. (lag: 3 days)

### Ground truth

- **earliest_reasonable_flag_signal:** —
- **flag_rationale:** Between s1 and s2 there is a 3-day window where execution chatter precedes the recorded decision; a flag fired in that window is technically defensible but practically noise. After s3 exists, any drift flag is a false positive. The correct Helm behavior is to record the replacement relationship (invoicing replaces EU payments) and preserve the memory.
- **expected_behavior_instead:** Record replacement: 'Invoicing response' replaced 'Expand EU payment methods' on Oct 16; deferral cost noted; both visible in strategic memory.
- **grader_notes:** The key false-positive control. A detector that flags every fast pivot will flag this; it must not. Speed and drama of change are not drift — absence of deliberate record is. Score harshly any flag after s3.

### Information asymmetry

- **The gap:** None. The re-anchor process carried the full picture (decision, cost, what stops) to every party before execution shifted. This is the counterexample: same speed of change as the drift cases, zero asymmetry, because the record moved with the decision.

---

## scn-009 — CONTROL — A partner-integration idea gets a week of Slack energy, then dies (no drift)

**Drift type:** none (uncommitted_discussion)  ·  **is_drift:** false  ·  **severity:** none  ·  **should_flag:** false

**Company:** Fieldnote — Same company as scn-002  ·  **Team:** Integrations team: 1 PM, 4 engineers

### Charter

- **Make the top 5 integrations self-serve** — Customers connect the five most-used integrations without a support ticket
- **Metric:** Integration connections completed without support involvement (22% → 80%, FY26 Q3)
- **Reasoning:** Integration setup is 30% of support volume and the top onboarding stall point.
- **Trade-offs:** No new integration partners added this quarter; Legacy webhook system maintained but not improved
- **Owners:** outcome — Nadia Osei (PM); decision — Marcus Webb (VP Product)  ·  **Anchored:** 2026-06-30

### Drift

- **Mechanism (none_noise, none):** A BD manager floats a new equipment-manufacturer integration in Slack after a promising call. The thread gets genuinely excited — engineers sketch approaches, someone estimates effort, there's talk of 'maybe a spike.' Then the manufacturer goes quiet on BD, the thread dies within a week, and nothing was ever staffed, scheduled, or documented. Enthusiastic talk that never became work.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-08-03 | slack:#integrations | implicit | BD: 'Great call with Traxion (equipment telematics). If we integrated, their reps say they'd co-sell. Thoughts?' 25 replies, real energy. |
| s2 | 2026-08-04 | slack:#integrations | implicit | Engineer: 'Their API looks clean, maybe 3-4 weeks? Could be worth a spike after the Salesforce self-serve flow ships.' |
| s3 | 2026-08-11 | slack:#integrations | implicit | BD: 'Traxion went quiet, their champion is on leave. Parking this.' Thread ends. No doc, no tickets, no calendar events ever created. |

### Human realization

- **First noticed by:** n/a (lag from first signal: — days)
- **Moment:** Nothing to realize. Sprint contents, staffing, and the tracker never changed.
- **Leadership aware:** — — n/a (lag: — days)

### Ground truth

- **earliest_reasonable_flag_signal:** —
- **flag_rationale:** The charter says no new integration partners, and here is a lively thread about a new integration partner — a keyword-matching detector fires immediately and is wrong. The discriminating evidence is commitment: no staffing, no artifacts, no calendar time, and self-termination within a week. Discussion of charter-excluded work is healthy; execution of it is drift.
- **expected_behavior_instead:** At most, silently note the thread as a latent signal; surface it only if commitment evidence (doc, tickets, assignments) appears later.
- **grader_notes:** The key precision control against scn-001, which has near-identical surface signals (excited thread about charter-excluded work) but escalating commitment evidence. A detector that can't separate s1-s2 here from s1-s3 in scn-001 will be too noisy to deploy.

### Information asymmetry

- **The gap:** None materialized. The thread was visible to everyone including the PM; no commitment formed, so no picture diverged from any other.

---

## scn-010 — BORDERLINE — Instrumentation work attaches to an outcome, then grows into its own workstream

**Drift type:** Priority displacement  ·  **is_drift:** true  ·  **severity:** minor  ·  **should_flag:** true

**Company:** Portobello — Same company as scn-004, following quarter  ·  **Team:** Checkout pod: 1 PM, 4 engineers

### Charter

- **Recover abandoned carts** — Shoppers who abandon carts come back and complete the purchase
- **Metric:** Abandoned-cart recovery rate (4% → 12%, FY26 Q4)
- **Reasoning:** Q3's completion-rate work capped out; the next recoverable revenue is in the carts already lost.
- **Trade-offs:** Merchandising asks capped at 0.5 days/sprint (learned from Q3); No loyalty-program work this quarter
- **Owners:** outcome — Leo Grant (PM); decision — Sofia Marsh (Head of Product)  ·  **Anchored:** 2026-09-28

### Drift

- **Mechanism (attach_becomes_workstream, minor):** Recovery experiments need better event tracking, so the pod builds instrumentation — legitimately attached to the outcome. But the instrumentation work is satisfying and visibly useful to other teams, and it keeps growing: an internal events dashboard, then a self-serve query layer for the growth team, then a data-quality monitoring service. By November one engineer is effectively a full-time internal-platform engineer. Every step was justifiable as 'supporting the outcome'; the sum is a second workstream the charter never contemplated.

### Signal timeline

| id | date | source | obs. | content |
| --- | --- | --- | --- | --- |
| s1 | 2026-10-08 | meeting:sprint-planning | implicit | 'Cart-event instrumentation' sized at 1 sprint, framed as prerequisite for recovery experiments. Clearly attached to the outcome. |
| s2 | 2026-10-22 | slack:#checkout-pod | implicit | 'The events dashboard is getting love from growth team — adding a couple of their requested views this sprint.' |
| s3 | 2026-11-05 | doc:google | explicit | 'Checkout Events Platform — v2 proposal' doc: self-serve query layer, data-quality monitoring, a roadmap of its own. Author: the instrumentation engineer. Recovery experiments mentioned once, in the background section. |
| s4 | 2026-11-18 | meeting:sprint-planning | explicit | Recovery experiment #3 delayed for 'platform hardening.' First time outcome work yields to the platform rather than the reverse. |

### Human realization

- **First noticed by:** Leo Grant (PM, outcome owner) on 2026-11-18 (lag from first signal: 41 days)
- **Moment:** At s4, when the dependency inverts. Through s3 Leo genuinely believed the platform work served the outcome — and early on it did. The tell he later named: the v2 proposal doc read like a product roadmap, and the outcome had become the background section of its own supporting work.
- **Leadership aware:** 2026-11-24 — Leo brings it to Sofia with the framing 'we accidentally built an internal product.' Sofia's call: keep the platform but move it out of the pod's charter accounting, and backfill recovery-experiment capacity. (lag: 47 days)

### Ground truth

- **earliest_reasonable_flag_signal:** s3
- **flag_rationale:** s1 is correct attach-mode work; s2 is minor and arguably neighborly. s3 is the identity shift: a proposal doc with its own roadmap where the anchored outcome appears only as background is work that has stopped serving the outcome and started using it as justification. Flagging at s3 beats the human realization (s4) by two weeks. Reasonable graders may accept s4 as the flag point; s2 is too early.
- **expected_flag_summary:** The cart-event instrumentation attached to the recovery outcome now has its own v2 roadmap (query layer, monitoring service) and serves other teams' needs. The recovery outcome appears only as background context in the proposal. Worth deciding whether this is still attached work or a new outcome that should enter the quarter deliberately.
- **grader_notes:** Deliberately ambiguous — the hardest label in the set. Tests whether a detector can distinguish 'supporting work' from 'work wearing the outcome as cover' using document framing, not just topic keywords (topically it always matches the charter). Accept flags at s3 or s4; treat s1-s2 flags as false positives.

### Information asymmetry

- **Team picture:** The instrumentation engineer believed each increment served the outcome — early on it truly did, and the belief carried forward on momentum. Leo shared that picture through s3 because the work always matched the charter topically.
- **Leadership picture:** Sofia had no picture of the platform work at all; from her seat the pod was executing the recovery charter as anchored.
- **The gap:** A gradual-reframing gap: the work's relationship to the outcome inverted so smoothly that the people closest to it were the last positioned to see it — every local step was justified, and only the trajectory wasn't. No one's snapshot was wrong; the sequence was.
- **Who needed to hear the flag:** Leo and the instrumentation engineer together — the decision (attach, spin out, or stop) is theirs to frame before it reaches Sofia as a fait accompli.
