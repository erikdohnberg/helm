"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  getOutcomeById,
  getOutcomesByQuarter,
  getQuarterById,
} from "@/lib/mock/mockData";
import type { Outcome, OutcomeStatus } from "@/lib/types";
import { Chip } from "@/components/ui/chip";

/** Quarter order on outcomes page: FY26 Q2, then FY26 Q1, then older. */
const OUTCOMES_QUARTER_ORDER = ["q-fy26-q2", "q-fy26-q1", "q-fy25-q4"];

function formatStatus(status: OutcomeStatus): string {
  switch (status) {
    case "AwaitingAlignment":
      return "Awaiting alignment";
    case "InDevelopment":
      return "In development";
    default:
      return status;
  }
}

function formatLastActivity(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso + "Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function OutcomeCard({
  outcome,
  quarterLabel,
  onMoveAdrift,
  onReactivate,
}: {
  outcome: Outcome;
  quarterLabel: string;
  onMoveAdrift: (outcomeId: string, outcomeTitle: string) => void;
  onReactivate: (outcomeId: string) => void;
}) {
  const replacedOutcome =
    outcome.entryMode === "Replace" && outcome.replacedOutcomeId
      ? getOutcomeById(outcome.replacedOutcomeId)
      : undefined;
  const showAdditiveFocusWarning =
    outcome.entryMode === "Additive" && outcome.focusWarning;
  const canMoveAdrift = outcome.status !== "Inactive";
  const canReactivate = outcome.status === "Inactive";

  return (
    <li className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-foreground">{outcome.title}</h3>
        <span className="text-sm text-muted-foreground">{quarterLabel}</span>
        <Chip label={formatStatus(outcome.status)} />
      </div>
      {replacedOutcome && (
        <p className="mt-2 text-sm text-muted-foreground">
          Replaces: {replacedOutcome.title}
        </p>
      )}
      {showAdditiveFocusWarning && (
        <p className="mt-2 text-sm text-muted-foreground">
          Focus warning: this outcome entered without displacing another
          priority.
        </p>
      )}
      <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-foreground after:content-[':'] after:mr-1">
            Outcome owner
          </dt>
          <dd className="inline text-muted-foreground">{outcome.outcomeOwner}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground after:content-[':'] after:mr-1">
            Decision owner
          </dt>
          <dd className="inline text-muted-foreground">{outcome.decisionOwner}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="inline font-medium text-foreground after:content-[':'] after:mr-1">
            Last activity
          </dt>
          <dd className="inline text-muted-foreground">
            {formatLastActivity(outcome.lastActivityDate)}
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-3">
        {outcome.googleDocUrl && (
          <a
            href={outcome.googleDocUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
          >
            Google Doc
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          </a>
        )}
        {outcome.slackThreadUrl && (
          <a
            href={outcome.slackThreadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
          >
            Slack thread
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          </a>
        )}
        {canMoveAdrift && (
          <button
            type="button"
            onClick={() => onMoveAdrift(outcome.id, outcome.title)}
            className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Move Adrift
          </button>
        )}
        {canReactivate && (
          <button
            type="button"
            onClick={() => onReactivate(outcome.id)}
            className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Reactivate
          </button>
        )}
      </div>
    </li>
  );
}

export default function OutcomesPage() {
  const [adriftRationaleByOutcomeId, setAdriftRationaleByOutcomeId] = useState<
    Record<string, string>
  >({});
  const [reactivatedOutcomeIds, setReactivatedOutcomeIds] = useState<Set<string>>(
    new Set()
  );
  const [moveAdriftModal, setMoveAdriftModal] = useState<{
    outcomeId: string;
    outcomeTitle: string;
  } | null>(null);
  const [rationaleDraft, setRationaleDraft] = useState("");
  const [newOutcomeModalOpen, setNewOutcomeModalOpen] = useState(false);

  const quartersInOrder = OUTCOMES_QUARTER_ORDER.map((id) => getQuarterById(id)).filter(
    (q): q is NonNullable<typeof q> => q != null
  );

  function openMoveAdriftModal(outcomeId: string, outcomeTitle: string) {
    setMoveAdriftModal({ outcomeId, outcomeTitle });
    setRationaleDraft("");
  }

  function closeMoveAdriftModal() {
    setMoveAdriftModal(null);
    setRationaleDraft("");
  }

  function confirmMoveAdrift() {
    if (!moveAdriftModal || !rationaleDraft.trim()) return;
    setAdriftRationaleByOutcomeId((prev) => ({
      ...prev,
      [moveAdriftModal.outcomeId]: rationaleDraft.trim(),
    }));
    setReactivatedOutcomeIds((prev) => {
      const next = new Set(prev);
      next.delete(moveAdriftModal.outcomeId);
      return next;
    });
    closeMoveAdriftModal();
  }

  function getEffectiveOutcome(outcome: Outcome): Outcome {
    if (reactivatedOutcomeIds.has(outcome.id)) {
      return { ...outcome, status: "AwaitingAlignment" };
    }
    if (outcome.id in adriftRationaleByOutcomeId) {
      return { ...outcome, status: "Inactive" };
    }
    return outcome;
  }

  function handleReactivate(outcomeId: string) {
    setReactivatedOutcomeIds((prev) => new Set(prev).add(outcomeId));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">Outcomes</h1>
        <button
          type="button"
          onClick={() => setNewOutcomeModalOpen(true)}
          className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Outcome
        </button>
      </div>
      {quartersInOrder.map((quarter) => {
        const outcomes = getOutcomesByQuarter(quarter.id).map(getEffectiveOutcome);
        if (outcomes.length === 0) return null;
        return (
          <section key={quarter.id} className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">{quarter.label}</h2>
            <ul className="space-y-3">
              {outcomes.map((outcome) => (
                <OutcomeCard
                  key={outcome.id}
                  outcome={outcome}
                  quarterLabel={quarter.label}
                  onMoveAdrift={openMoveAdriftModal}
                  onReactivate={handleReactivate}
                />
              ))}
            </ul>
          </section>
        );
      })}

      {newOutcomeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-outcome-modal-title"
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-4 shadow-lg">
            <h2
              id="new-outcome-modal-title"
              className="text-sm font-medium text-foreground"
            >
              New Outcome
            </h2>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setNewOutcomeModalOpen(false)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {moveAdriftModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="move-adrift-modal-title"
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-4 shadow-lg">
            <h2
              id="move-adrift-modal-title"
              className="text-sm font-medium text-foreground"
            >
              Move Adrift
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {moveAdriftModal.outcomeTitle}
            </p>
            <label htmlFor="move-adrift-rationale" className="mt-4 block text-sm font-medium text-foreground">
              Rationale (required)
            </label>
            <textarea
              id="move-adrift-rationale"
              value={rationaleDraft}
              onChange={(e) => setRationaleDraft(e.target.value)}
              className="mt-1.5 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
              placeholder="Why is this outcome no longer a priority?"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeMoveAdriftModal}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMoveAdrift}
                disabled={!rationaleDraft.trim()}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
