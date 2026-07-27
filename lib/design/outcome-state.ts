import type { OutcomeState } from "@/components/outcomes/outcome-card";
import type { Outcome, OutcomeStatus } from "@/lib/types";

/**
 * The design system has five states and no more: anchored, additive, replaced,
 * attached, plus drift. If a feature seems to need a sixth, it is almost
 * certainly one of these five seen from a new angle — say which, in the PR.
 *
 * Helm's data model carries two orthogonal axes, and only one of them is a
 * state in the design-system sense:
 *
 * - `entryMode` — how the outcome entered the quarter. This IS the state, and
 *   it belongs at the card's left edge.
 * - `status` — where the charter is in its own life. This is a fact about the
 *   artifact, not the outcome's standing in the quarter, so it stays in the
 *   content column as a plain outline chip.
 *
 * `Inactive` is the one place the two meet: an outcome that was retired or
 * traded away reads as `replaced` — dotted rule, content dimmed, reasoning
 * fully legible. Traded away, never deleted.
 */
export function outcomeStateOf(outcome: Outcome): OutcomeState {
  if (outcome.status === "Inactive") return "replaced";
  if (outcome.entryMode === "Attach") return "attached";
  if (outcome.entryMode === "Additive") return "additive";
  return "anchored";
}

/**
 * Sentence case everywhere except the 11px eyebrow labels, which are the only
 * uppercase in the system.
 */
export function formatOutcomeStatus(status: OutcomeStatus): string {
  switch (status) {
    case "AwaitingAlignment":
      return "Awaiting alignment";
    case "InDevelopment":
      return "In development";
    default:
      return status;
  }
}

/**
 * Dates are `21 Feb` — day, short month, no year within the current fiscal
 * year. Numbers are numerals from one upward in data.
 */
export function formatRecordDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso + "Z").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}
