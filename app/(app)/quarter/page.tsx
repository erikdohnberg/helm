"use client";

import { useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import {
  getOutcomeById,
  getOutcomesByQuarter,
  mockCurrentQuarter,
  mockCurrentQuarterUpdatedDate,
} from "@/lib/mock/mockData";
import type { Outcome } from "@/lib/types";
import { Chip } from "@/components/ui/chip";

function formatUpdatedDate(iso: string): string {
  return new Date(iso + "Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function OutcomeCard({ outcome }: { outcome: Outcome }) {
  const replacedOutcome = outcome.replacedOutcomeId
    ? getOutcomeById(outcome.replacedOutcomeId)
    : undefined;

  return (
    <li className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="font-medium text-foreground">{outcome.title}</h3>
      {replacedOutcome && (
        <p className="mt-1 text-xs text-muted-foreground">
          Replaces: {replacedOutcome.title}
        </p>
      )}
      <p className="mt-2 text-sm text-muted-foreground">{outcome.context}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium">Metric:</span> {outcome.metric}
        {" · "}
        <span className="font-medium">Target:</span> {outcome.target}
        {" · "}
        <span className="font-medium">Timeframe:</span> {outcome.timeframe}
      </p>
      {outcome.decisionBullets.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
          {outcome.decisionBullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
      {outcome.googleDocUrl && (
        <a
          href={outcome.googleDocUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Open Full Charter in Google Docs
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
        </a>
      )}
    </li>
  );
}

function AdriftCard({ outcome }: { outcome: Outcome }) {
  return (
    <li className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-foreground">{outcome.title}</h3>
        <Chip label="No Longer Prioritized" />
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
        {outcome.noLongerPrioritizedReasonBullets.map((bullet, i) => (
          <li key={i}>{bullet}</li>
        ))}
      </ul>
      {outcome.originallyAnchoredLabel && (
        <p className="mt-2 text-xs text-muted-foreground">
          Originally anchored: {outcome.originallyAnchoredLabel}
        </p>
      )}
      {outcome.googleDocUrl && (
        <a
          href={outcome.googleDocUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
        >
          Google Doc
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
        </a>
      )}
    </li>
  );
}

export default function QuarterPage() {
  const quarter = mockCurrentQuarter;
  const [narrativeSummary, setNarrativeSummary] = useState<string>(
    quarter.narrativeSummary ?? ""
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editDraft, setEditDraft] = useState("");

  const canEdit = !quarter.hasStarted;
  const anchoredOutcomes: Outcome[] = getOutcomesByQuarter(quarter.id).filter(
    (o) => o.status === "Anchored"
  );
  const adriftOutcomes: Outcome[] = getOutcomesByQuarter(quarter.id).filter(
    (o) =>
      o.noLongerPrioritizedReasonBullets &&
      o.noLongerPrioritizedReasonBullets.length > 0
  );

  function openEditModal() {
    if (!canEdit) return;
    setEditDraft(narrativeSummary);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function saveNarrative() {
    setNarrativeSummary(editDraft);
    closeModal();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">Quarter</h1>
        <p className="text-muted-foreground">{quarter.label}</p>
        <p className="text-sm text-muted-foreground">
          Updated {formatUpdatedDate(mockCurrentQuarterUpdatedDate)}
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-foreground">
            Narrative Summary
          </h2>
          {canEdit && (
            <button
              type="button"
              onClick={openEditModal}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Edit narrative summary"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {narrativeSummary || "No narrative summary yet."}
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium text-foreground">
          Anchored outcomes
        </h2>
        <ul className="mt-3 space-y-4">
          {anchoredOutcomes.map((outcome) => (
            <OutcomeCard key={outcome.id} outcome={outcome} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium text-foreground">Adrift</h2>
        <ul className="mt-3 space-y-4">
          {adriftOutcomes.map((outcome) => (
            <AdriftCard key={outcome.id} outcome={outcome} />
          ))}
        </ul>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="narrative-modal-title"
        >
          <div className="w-full max-w-lg rounded-lg border border-border bg-background p-4 shadow-lg">
            <h3
              id="narrative-modal-title"
              className="text-sm font-medium text-foreground"
            >
              Edit narrative summary
            </h3>
            <textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              className="mt-3 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={5}
              placeholder="Quarter narrative summary…"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNarrative}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
