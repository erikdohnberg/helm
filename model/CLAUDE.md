# Helm Drift Model — Working Context

Working context for sessions building the drift-detection model. Read this file and the spec (`../helm-drift-model-spec.md`) before making any changes here. The labeled seed scenarios are in `../drift-eval-scenarios.json`.

## What this is

The drift model is Helm's core: a model that runs daily and answers one question — given everything that happened in an organization yesterday, how aligned is each Anchored Outcome with actual behavior, and is that alignment degrading? At v1 it is not a single trained network but a **pipeline** — deterministic normalization, LLM-based relevance mapping and evidence extraction, and a temporal scoring layer over per-charter state — specced, versioned, and evaluated as **one model** with a fixed input contract (`Signal`) and a fixed output contract (`DriftReport`). It compares observed organizational signals against the quarter's Anchored Outcome Charters and emits drift events, each classified against a versioned drift taxonomy, when accumulated evidence crosses from noise into drift. It runs as a sibling system to the Next.js prototype, with its own package and build; downstream products (nudges, alignment threads, strategic memory) consume its output contract and nothing else.

## Hard rules

These are non-negotiable. They keep the model honest and shippable.

1. **The eval harness defines "done."** The harness is built before the pipeline and is the actual definition of "done" for the model. A capability is complete when it passes the eval — not when it looks right by inspection. If a behavior matters, it has a scenario.
2. **No pipeline stage ships without beating the v0 baseline on the scorecard.** The v0 baseline is the prototype's dumb inactivity detector (flag any charter with zero mapped signals for N days), formalized. Every pipeline version must justify its complexity against v0 on the end-to-end scorecard — on lead time and precision. If it does not beat the baseline, it does not ship.
3. **Every emitted drift event must cite specific signals.** Full auditability is load-bearing: every event traces to specific quoted signal spans and the anchored intent it conflicts with. If the model can't cite it, it can't claim it. No extraction without a citable span; no unsourced claims.
4. **Schemas in `contracts/` are the only interface between stages.** The pipeline's stages communicate exclusively through the versioned schemas in `model/contracts/`. No stage reaches into another's internals; if two stages need to exchange data, that data goes through a contract. The taxonomy and output contract are versioned — changing them is a breaking change.

## Session rules

Operational rules for every working session in this directory. Equal in force to the hard rules above.

1. **Never edit ground-truth labels in `model/scenarios/` to make a scorecard look better.** Label changes are human decisions, not tuning knobs, and each requires a changelog entry.
2. **Never overwrite a directory under `model/eval/results/`.** Scorecards are append-only history; past results stay as they were recorded.
3. **Any change to a contract in `model/contracts/` edits the corresponding spec section in the same commit,** with a changelog line in the spec. The contract and its spec never drift apart.
4. **If a step's output contradicts the spec's predictions or my instructions, report the contradiction explicitly.** Do not reconcile it silently or smooth it over.

## Current phase

**Phase 0 — contracts and taxonomy.** Finalize the drift taxonomy and the `Signal`, `Charter`, and `DriftReport` schemas that the pipeline exchanges. Exit criteria (per spec §10): schemas versioned and frozen for v1, and the taxonomy reviewed against real drift stories. No model logic, schemas, or eval code has been written yet. **Update this section as phases advance** (next: Phase 1 — eval harness and corpora, including the v0 baseline).

## File map

- `README.md` — what this directory is and its current phase
- `CLAUDE.md` — this file; working context and the hard rules above
- `contracts/` — versioned schemas (`Signal`, `Charter`, `DriftReport`, drift taxonomy) that are the only interface between pipeline stages (empty for now)
- `eval/` — eval harness and scorecard; defines "done" (empty for now)
- `scenarios/` — labeled drift scenarios the eval harness runs against (empty for now)
- `package.json` — standalone package manifest, independent of the Next.js app
- `tsconfig.json` — standalone TypeScript config for this directory
- `../helm-drift-model-spec.md` — the product spec (source of truth)
- `../drift-eval-scenarios.json` — labeled seed scenarios for the eval set
