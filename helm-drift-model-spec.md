# Helm Drift Model – Product Specification

**Status:** Draft v0.1
**Scope:** The drift-detection model only. Integrations, UI, and delivery surfaces are out of scope except where they constrain model inputs and outputs.

---

## Changelog

- **2026-07-23 — Eval set canonicalized.** The monolithic root `drift-eval-scenarios.json` moved into `model/scenarios/` as one file per scenario plus `_meta.json`, each scenario gaining a `ground_truth.drift_type` from the v1.1 taxonomy (controls use `none` + `control_kind`). Added `model/scenarios/validate.ts` (schema + §3-coverage-agreement checks) and `model/scenarios/generate-doc.ts` (renders `drift-eval-scenarios.md`). §3's coverage-table reference updated to the new location; the JSON is now the source of truth and the markdown is generated.
- **2026-07-23 — Drift taxonomy → v1.1**, reconciled against the eval set (`drift-eval-scenarios.json`). Net: seven drift types (was six). Changes to §3:
  - **Added `Capacity withdrawal`** — a documented removal of a charter's committed people (reorg, incident-remediation plan) that is incompatible with the target on its face; fires point-in-time from the change-document × charter, not as a trend. Covers scn-003, scn-007, which the six-type space forced into Priority displacement.
  - **Added `Commitment overrun`** — an approved, bounded exception (loan, spike, timeboxed favor) that outlives its stated bound with no re-approval; evidence is stated duration vs. elapsed time, and a correct flag cites the original approval terms. Covers scn-005.
  - **Rewrote `Priority displacement`** to discriminate on *evidence basis* (behavioral, inferred from effort shifting with no authorizing artifact) rather than tempo — because fast pivots (scn-001 commits in ~3 days, scn-002 in one meeting) are still displacement. The behavioral-vs-declared line separates it from Capacity withdrawal.
  - **Merged `Silent abandonment` into `Attention decay`** as its terminal severity (sustained zero-signal after baseline). Rationale: identical detection signature — absence of activity against baseline — at greater depth; scn-006, the purest starvation case, maps to decay. Abandonment is now a point on the decay severity scale, not a separate type. This drops the count from eight back to seven.
  - **Extended the explicit non-drift list** with *uncommitted discussion* — charter-excluded work discussed but never staffed/scheduled/documented (reference case: scn-009).
  - Added a boundary paragraph (behavioral vs. declared vs. bounded-then-breached) and a coverage table mapping every type to its scenarios, with Scope mutation, Reasoning contradiction, and Metric detachment shown as explicit primary-coverage gaps.
  - **Reconciled §7 (cold start) and §10 (Phase 1) with the seven-type space.** §7 now excludes the four document-relative types (contradiction, scope mutation, capacity withdrawal, commitment overrun) from baseline-relativity and lets them fire during calibration; its calibration-suppression list is the three baseline-relative types (attention decay, priority displacement, metric detachment) — metric detachment added to that list, since metric-mention-rate against a not-yet-built baseline is noise (a pre-existing omission, fixed here). §10 Phase 1 corpus target updated six → seven drift types.

---

## 1. Reframing

Helm's prior framing treated the product as an agent with integrations, where the intelligence was an implementation detail. This spec inverts that. Helm is a model that answers one question daily:

> Given everything that happened in this organization yesterday, how aligned is each Anchored Outcome with actual behavior – and is that alignment degrading?

Everything else (Slack delivery, charter documents in Drive, alignment threads) is a presentation layer on top of the model's output. If the model is accurate, thin integrations are enough. If it isn't, no amount of integration polish saves the product.

A note on the word "model": at v1 this is not a single trained network. It is a pipeline – deterministic normalization, LLM-based extraction and classification stages, and a temporal scoring layer over per-charter state. It should still be specced, versioned, and evaluated as one model: fixed input contract, fixed output contract, one accuracy story. Trained components can replace pipeline stages later without changing the contract.

---

## 2. What the model must do

Three capabilities, in order of difficulty:

1. **Signal-to-charter mapping.** For each unit of organizational activity, determine which Anchored Outcome(s) it relates to, or that it relates to none.
2. **Evidence extraction.** For mapped signals, characterize what the signal says about the outcome: progress, blockage, deprioritization, contradiction of the charter's reasoning, or a competing priority emerging.
3. **Drift scoring.** Maintain per-charter state over time and decide when accumulated evidence crosses from noise into drift – with the evidence trail that justifies the call.

Capability 3 is the product. Capabilities 1 and 2 exist to feed it, and each needs its own eval.

---

## 3. Drift taxonomy

"Drift" is currently underspecified in Helm (the prototype detects inactivity only). The model needs a label space before anything else, because the taxonomy defines the training targets, the eval labels, and the output schema. Taxonomy **v1.1** (reconciled against the eval set; see the changelog):

| Type | Definition | Primary evidence |
|---|---|---|
| **Attention decay** | Discussion, decisions, and work referencing the outcome decline below its baseline. Its terminal severity is *silent abandonment* — sustained zero-signal after the baseline period, with no recorded decision to stop | Mention frequency, meeting agenda presence, thread activity; depth of decline against baseline, up to and including zero |
| **Priority displacement** | Effort is drifting from the outcome to a competing initiative, inferred from *behavior* — the same actors now working both workstreams, charter-mapped activity falling as the competing topic rises — with no authorizing artifact that prices the trade-off. This is the behavioral counterpart to Capacity withdrawal: displacement is *observed* in what people do; withdrawal is *declared* in a document | Same actors on both workstreams; charter-mapped activity falling while a competing topic cluster rises; absence of any artifact that authorizes the shift or records its cost |
| **Capacity withdrawal** | A documented removal of the owners or committed capacity a charter depends on — a reorg, an incident-remediation plan, a headcount change — that reassigns those people to other work and is incompatible with the anchored target on its face, with the charter left unrevised | Change-document × charter: a published artifact that reassigns named charter owners/capacity, reconciled against the charter's staffing assumptions and target; fires point-in-time on that incompatibility, not as a trend, and needs no decline window |
| **Commitment overrun** | An approved, explicitly bounded exception against the charter's capacity — a loan, a spike, a timeboxed favor — that outlives its stated bound with no recorded re-approval | Stated duration/scope of the approved exception vs. elapsed time and current scope; fires when reality exceeds the bound. A correct flag cites the original approval terms (who approved what, for how long) |
| **Scope mutation** | The outcome is still discussed, but what people mean by it has changed from the charter definition | Semantic distance between charter text and current discussion of the "same" outcome |
| **Reasoning contradiction** | Decisions are made that conflict with the charter's stated reasoning or trade-offs | Extracted decisions vs. charter rationale |
| **Metric detachment** | The success metric stops appearing in discussion; progress claims become unquantified | Metric mention rate, presence of numbers in status signals |

The three capacity-related types are deliberately distinct by *evidence signature*, not by outcome — a detector keyed on one signature misses the other two. **Priority displacement** is *behavioral*: it is inferred from what people are observably doing (effort shifting, same actors on both sides, charter activity falling) when no artifact authorizes the shift. **Capacity withdrawal** is *declared*: an artifact exists that reassigns the people and is incompatible with the target on its face, so it can fire point-in-time from the document alone. **Commitment overrun** is *bounded-then-breached*: the reallocation was approved and time-boxed, and the drift is precisely that the bound lapsed without re-approval. Behavioral-vs-declared, not tempo, is the discriminator: displacement can commit within days (a competing priority absorbing capacity fast is still displacement), and withdrawal is recognizable the moment its document lands.

Each drift event the model emits carries exactly one primary type (secondary types allowed), a severity, a confidence, and citations to the underlying signals. Severity now carries real weight for attention decay, whose deepest point (sustained zero-signal) is silent abandonment rather than a separate type. The taxonomy is versioned; changing it is a breaking change to the output contract.

Explicit non-drift, so the model doesn't cry wolf: seasonal quiet periods (holidays, launch weeks focused elsewhere), an outcome that is simply done, deliberate recorded re-prioritization, and uncommitted discussion — charter-excluded work that is discussed, even enthusiastically, but never staffed, scheduled, or documented as work. Two of these carry the most weight. Recorded re-prioritization: if leadership explicitly decided to stop, that is Helm's "strategic memory" feature working, not drift. Uncommitted discussion (reference case: scn-009, a lively integration thread that dies in a week with no staffing, tickets, or calendar time): discussion of charter-excluded work is healthy; only execution of it is drift — the distinction is commitment, not topic.

### Coverage against the eval set

Every v1.1 type mapped to the canonical scenarios in `model/scenarios/` (`scn-*.json`) that exercise it as the *primary* label — via each scenario's `ground_truth.drift_type`. `model/scenarios/validate.ts` fails if this table and the scenario files disagree. Types with no scenario are shown as explicit gaps to fill, not as candidates to cut.

| Type | Scenarios (primary) | Status |
|---|---|---|
| Priority displacement | 001, 002, 004, 010 | covered |
| Capacity withdrawal | 003, 007 | covered |
| Commitment overrun | 005 | covered |
| Attention decay | 006 | covered (006 is the purest starvation case; its terminal severity is silent abandonment) |
| Scope mutation | — | **gap** — no primary scenario; add one |
| Reasoning contradiction | — | **gap** — appears only as a secondary signal (001, 002, 004); add a primary scenario |
| Metric detachment | — | **gap** — appears only as a secondary signal (006, 007); add a primary scenario |
| *non-drift control* | 008 (deliberate replacement), 009 (uncommitted discussion) | covered |

This mapping matches the expectation set for these decisions exactly; no scenario is disputed.

---

## 4. Reference state: the charter as a structured object

The model compares observed behavior against charters, so charters must be machine-comparable, not just documents. Charter schema the model consumes:

```
Charter {
  id, org_id, quarter
  outcome_statement        // what is being pursued
  success_metric           // name, target value, current value if known
  reasoning[]              // discrete claims, not one blob – each independently contradictable
  trade_offs[]             // what was explicitly stopped or declined
  owners[]                 // people accountable (actor IDs)
  aliases[]                // names/phrases the org uses for this outcome, learned over time
  anchored_at, status      // Anchored | Adrift | Retired
  baseline                 // expected signal profile, learned in first N weeks (see §7)
}
```

Two schema decisions carry most of the weight:

- **`reasoning` as discrete claims.** "We're doing X because churn is driven by onboarding, not pricing" is contradictable by a signal ("data shows pricing is the churn driver"). A paragraph of prose isn't. Charter drafting (a separate model concern, out of scope here) must produce claims at this granularity.
- **`aliases` as a living list.** Orgs rename things constantly ("the retention work", "Project Compass", "the Q3 thing"). Mapping accuracy depends on the model updating this list from confirmed mappings.

---

## 5. Canonical input schema

The model never sees "Slack" or "Drive". Connectors (later) normalize everything into one record type:

```
Signal {
  id, org_id, occurred_at, ingested_at
  source_type      // enum below
  actors[]         // stable person IDs (identity resolution is a connector concern)
  audience         // channel/meeting/doc membership size + owner-overlap with charters
  content          // text payload
  thread_ref       // conversation grouping key, if any
  parent_ref       // reply-to / revision-of
  metadata         // source-type-specific, schema'd per type
}
```

### Source types (v1)

| source_type | What it is | Why the model needs it |
|---|---|---|
| `chat_message` | A message in a threaded, multi-party conversation | Where priority shifts surface first; highest volume, lowest signal density |
| `meeting_transcript` | Diarized transcript segment with attendees | Where decisions actually happen; highest signal density |
| `document_revision` | A diff or new version of a persistent document | Scope mutation shows up here – plans quietly rewritten |
| `work_item_event` | Create/update/close/reassign on a task or ticket, metadata only | Ground truth on where effort goes, independent of what people say |
| `calendar_event` | Meeting scheduled/cancelled with title + attendees | Cheap attention proxy; recurring-meeting cancellation is a strong decay signal |

Deliberately excluded from v1: email (consent and coverage problems), code activity (org-specific, work_item_event covers most of the value), and any audio/video (transcripts only).

### Ingestion contract

- **Cadence:** one batch per org per day, covering the prior calendar day in the org's timezone. Late-arriving signals (up to 72h) are accepted and trigger recomputation of affected days.
- **Idempotency:** batches are replayable; `id` is stable per source record. Reprocessing a day must produce identical output given identical model version.
- **Volume assumption for design:** a 200-person org produces on the order of [estimated daily signal volume – validate with a real dataset] signals/day, dominated by `chat_message`.
- **Privacy floor:** the model consumes only sources the org has connected; per-channel/space exclusions are honored at ingestion, before the model sees anything. DMs are excluded in v1 unconditionally.

---

## 6. Pipeline architecture (the daily run)

Five stages. Each stage has its own eval (§8) so failures are attributable.

**Stage 1 – Normalize and filter.** Dedupe, strip boilerplate (joins/leaves, bot noise), collapse trivial messages into thread-level units. Deterministic. Target: discard the majority of raw volume without touching an LLM.

**Stage 2 – Relevance mapping.** For each surviving unit: which charters does it relate to (0..n), with confidence. Embedding retrieval against charter text + aliases for candidates, LLM judgment for the mapping decision. This stage's precision/recall bounds everything downstream.

**Stage 3 – Evidence extraction.** For each mapped unit, extract typed evidence: `progress`, `blocker`, `decision`, `deprioritization_cue`, `contradiction` (which reasoning claim, and how), `competing_priority` (what topic), `metric_reference`. Output is structured, with a quote span for every extraction – no extraction without a citable span.

**Stage 4 – State update.** Fold the day's evidence into per-charter state: rolling activity levels vs. baseline, evidence ledger, unresolved contradictions, competing-topic tracker. This is where "yesterday was quiet" becomes distinguishable from "this has been dying for three weeks". Mostly deterministic aggregation.

**Stage 5 – Drift scoring.** Per charter, per day: evaluate state against the taxonomy. Emit drift events only when type-specific thresholds are met over the type's time window (attention decay needs sustained decline; reasoning contradiction can fire same-day). Every event carries type, severity, confidence, and the evidence ledger entries that justify it.

Two properties are load-bearing:

- **Drift is a trend judgment, not a daily judgment.** Stages 1–3 run on one day of data; stages 4–5 run on rolling state. A single quiet day must never fire an event.
- **Full auditability.** Every emitted event traces to specific quoted signals. If the model can't cite it, it can't claim it. This is both a trust requirement and what makes human eval labeling feasible.

---

## 7. Baselines and cold start

Every drift type except contradiction, scope mutation, capacity withdrawal, and commitment overrun is relative to what "normal" looks like for that charter in that org. First [2–4 weeks – to be validated] after anchoring is a calibration window: the model builds the charter's baseline signal profile (activity level, active actors, typical sources) and emits no attention-decay, priority-displacement, or metric-detachment events. Contradiction, scope mutation, capacity withdrawal, and commitment overrun can fire during calibration since they're evaluated against the charter text or an authorizing document, not a baseline.

---

## 8. Eval framework

The eval harness gets built before the pipeline, and it is the actual definition of "done" for the model. Three layers.

### 8.1 Component evals (per stage, automated, run on every model change)

| Stage | Metric | Method |
|---|---|---|
| Relevance mapping | Precision / recall per charter | Golden set of labeled signal→charter pairs |
| Evidence extraction | Extraction accuracy; span faithfulness (does the quote support the label?) | Labeled extractions + an LLM-judge faithfulness check, spot-audited by humans |
| Drift scoring | Event-level precision / recall by drift type; severity agreement | Labeled corpus (below) |

### 8.2 End-to-end evals (the product-level scorecard)

Run against full labeled corpora, reported per drift type:

- **Detection recall:** of drift episodes in the corpus, what fraction did the model flag before the episode's resolution point?
- **Precision at operating threshold:** of emitted events, what fraction do human adjudicators agree are real? This is the alert-fatigue number and the one that kills adoption if it's bad. Working target: [target precision, e.g. ≥0.8] before any real org sees output.
- **Lead time:** median days between the model's first event and the moment drift became human-obvious in the corpus (a leadership discussion, a retro admission, an explicit kill decision). If lead time isn't meaningfully positive, Helm tells people what they already know.
- **Calibration:** do 0.9-confidence events verify more often than 0.6-confidence events? Required for severity to mean anything.
- **Stability:** rerunning the same corpus with the same model version produces the same events (tolerance near zero); adjacent model versions produce explainable diffs.

### 8.3 Labeled corpora (the hard part)

Ground truth for drift barely exists in the wild, so the corpus strategy is the critical path of the whole project:

1. **Synthetic org corpora.** Generated multi-week histories for fictional orgs – charters plus daily chat/transcript/doc/ticket streams – with drift episodes injected by construction (type, start date, severity are known exactly). Cheap, perfectly labeled, and the only way to get coverage of every drift type early. Risk: distribution gap vs. real org communication; mitigated by seeding generation with real-corpus style statistics and by never trusting synthetic-only results for release decisions.
2. **Replayed real history.** For design partners (and my own available archives): connect read-only, replay the past two quarters day-by-day as if live, and have people who lived that quarter label what actually drifted and roughly when. Small, expensive, and the highest-value data that exists for this problem.
3. **Live adjudication.** Once running with partners: every emitted event gets a human verdict (real / not real / real-but-known), and monthly "what did we miss" reviews add false negatives. This becomes the regression set that grows forever.

Release rule: a model version ships only if it beats the incumbent on the end-to-end scorecard across both synthetic and real corpora, with no drift-type regressing beyond a set tolerance.

### 8.4 The baseline to beat

The current prototype's inactivity detector is the v0 baseline, formalized: flag any charter with zero mapped signals for N days. Every pipeline version must justify its complexity against this on the scorecard. If stages 2–5 can't beat a dumb inactivity timer on lead time and precision, the pipeline isn't earning its cost.

---

## 9. Output contract

Daily, per org:

```
DriftReport {
  org_id, run_date, model_version
  charter_states[]     // per charter: alignment score trend, activity vs baseline, open items
  drift_events[]       // type, severity, confidence, charter_id, evidence[] (quoted, sourced)
  competing_topics[]   // unanchored topic clusters gaining sustained activity
  coverage             // sources ingested, signal counts, gaps (missed batches, excluded spaces)
}
```

`coverage` is not optional telemetry – consumers must be able to distinguish "no drift" from "no data". A quiet report caused by a broken connector must be identifiable as such.

Consumers of this contract (nudge delivery, alignment threads, memory records) are downstream products. None of them are in this spec, and the contract is the only interface they get.

---

## 10. Development plan

Phases gate on eval results, not on calendar.

**Phase 0 – Contracts and taxonomy.**
Finalize drift taxonomy, Signal schema, Charter schema, DriftReport contract. Exit: schemas versioned and frozen for v1; taxonomy reviewed against [2–3 real drift stories from orgs you know – to collect].

**Phase 1 – Eval harness and corpora.**
Build the harness (corpus loader, replay runner, scorecards, adjudication tooling). Generate first synthetic corpora covering all seven drift types plus non-drift controls. Implement the v0 inactivity baseline and score it – this produces the first scorecard and validates the harness itself. Exit: harness runs end-to-end; baseline numbers on the board.

**Phase 2 – Pipeline v1.**
Stages 1–5 as specced, on synthetic corpora. Iterate stage-by-stage using component evals to localize failures. Exit: beats the v0 baseline on the end-to-end scorecard on synthetic data, precision above the working target.

**Phase 3 – Real-data validation.**
One or two replayed real histories (design partner or own archives). Expect the synthetic-to-real gap to be humbling; this phase is where the aliases mechanism, baseline calibration, and Stage 1 filtering get real tuning. Exit: beats baseline on a real replayed quarter; precision holds.

**Phase 4 – Live shadow mode.**
Daily runs on a live org, output visible only to me/adjudicators, every event adjudicated. Grows the regression set, measures stability and calibration in the wild. Exit: [N weeks] of live precision above target → the model is ready to have products built on it, and integration work re-enters the roadmap.

---

## 11. Risks and open questions

- **Ground-truth subjectivity.** Reasonable people disagree on whether something "drifted". Mitigation: adjudication with multiple raters on a sample, measure inter-rater agreement, and treat drift types with low agreement (likely scope mutation) as reduced-confidence outputs rather than pretending precision numbers there are solid.
- **Synthetic distribution gap.** Generated org chatter will be too clean. The real-replay corpora exist to catch this; no release decision on synthetic evidence alone.
- **Charter quality dependency.** The model can only be as good as the charters it compares against. Vague outcome statements and blob-reasoning degrade mapping and make contradiction undetectable. This couples the drift model to the charter-drafting experience more tightly than the current architecture admits – flagging as a dependency, not solving it here.
- **Observer effects.** Once teams know Helm listens, discussion may migrate or perform. Not a v1 problem, but the audience field and DM exclusion are partly designed with this in mind.
- **Cost envelope.** Stage 2–3 LLM calls on every signal for a mid-size org daily needs a cost model before Phase 2 design hardens. Aggressive Stage 1 filtering and thread-level batching are the levers. Open: [per-org daily cost target].
- **Open question – displacement vs. legitimate emergence.** Distinguishing "a competing priority is eating this outcome" from "a genuinely new priority emerged and leadership just hasn't recorded the trade-off yet" may be undecidable from signals alone. The honest v1 answer is that the model surfaces the pattern and the trade-off question, and the human answers it. The output framing should reflect that.
