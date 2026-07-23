/**
 * Version of the contracts in this directory — the interface between pipeline
 * stages and downstream consumers. Bump on any breaking change to a schema
 * here (and record it in the spec changelog per model/CLAUDE.md session rules).
 *
 * Distinct from DriftReport.model_version, which versions the model that
 * produced a given report, not the shape of the report.
 */
export const CONTRACTS_VERSION = "1.0.0";
