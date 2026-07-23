# Helm — Drift Model

This directory is the drift-detection model for Helm, built as a sibling system to the Next.js prototype in the repo root. The model answers one question daily: given everything that happened in an organization yesterday, how aligned is each Anchored Outcome with actual behavior — and is that alignment degrading? Everything else in Helm (Slack delivery, charter docs, alignment threads) is a presentation layer on top of this model's output. It has its own package and TypeScript setup and is deliberately independent of the Next.js app's build.

The model's design, drift taxonomy, schemas, and eval framework live in the spec at the repo root: [`helm-drift-model-spec.md`](../helm-drift-model-spec.md). The labeled seed scenarios it will be evaluated against are the canonical JSON in [`scenarios/`](./scenarios/) (one file per scenario plus `_meta.json`), rendered for reading in [`scenarios/drift-eval-scenarios.md`](./scenarios/drift-eval-scenarios.md). Read the spec before working here.

For the current phase, see the Current phase section of [`CLAUDE.md`](./CLAUDE.md) — it is the single source of truth for phase state.

## Layout

- `contracts/` — versioned zod schemas (`Charter`, `Signal`, `DriftReport`/`DriftEvent`, taxonomy) with inferred TS types, `CONTRACTS_VERSION`, and round-trip tests — the only interface between pipeline stages
- `eval/` — the eval harness and scorecard that define "done" (empty for now)
- `scenarios/` — canonical labeled drift scenarios (`scn-*.json` + `_meta.json`), a `validate.ts` checker, a `generate-doc.ts` renderer, and the generated `drift-eval-scenarios.md`
- `CLAUDE.md` — working context for future sessions
