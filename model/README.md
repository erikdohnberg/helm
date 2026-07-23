# Helm — Drift Model

This directory is the drift-detection model for Helm, built as a sibling system to the Next.js prototype in the repo root. The model answers one question daily: given everything that happened in an organization yesterday, how aligned is each Anchored Outcome with actual behavior — and is that alignment degrading? Everything else in Helm (Slack delivery, charter docs, alignment threads) is a presentation layer on top of this model's output. It has its own package and TypeScript setup and is deliberately independent of the Next.js app's build.

The model's design, drift taxonomy, schemas, and eval framework live in the spec at the repo root: [`helm-drift-model-spec.md`](../helm-drift-model-spec.md). The labeled seed scenarios it will be evaluated against are in [`drift-eval-scenarios.json`](../drift-eval-scenarios.json). Read the spec before working here.

For the current phase, see the Current phase section of [`CLAUDE.md`](./CLAUDE.md) — it is the single source of truth for phase state.

## Layout

- `contracts/` — the versioned schemas that are the only interface between pipeline stages (empty for now)
- `eval/` — the eval harness and scorecard that define "done" (empty for now)
- `scenarios/` — labeled drift scenarios the eval harness runs against (empty for now)
- `CLAUDE.md` — working context for future sessions
