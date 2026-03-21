"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, Pencil } from "lucide-react";

import { Chip } from "@/components/ui/chip";
import { useDemoData } from "@/lib/demo-data-context";
import {
  getCurrentQuarter,
  getOutcomeById,
  getOutcomesByQuarter,
  getQuarterById,
  getQuartersOrdered,
  mockCurrentQuarterUpdatedDate,
} from "@/lib/mock/mockData";
import type { Outcome, Quarter } from "@/lib/types";

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

function quarterById(ordered: Quarter[], id: string): Quarter | undefined {
  return ordered.find((q) => q.id === id);
}

export default function QuarterPageClient({
  workspaceQuarter,
}: {
  workspaceQuarter: Quarter | null;
}) {
  const { resetVersion, demoModeEnabled } = useDemoData();

  const orderedQuarters = useMemo(() => {
    if (demoModeEnabled) {
      return getQuartersOrdered();
    }
    if (workspaceQuarter) {
      return [workspaceQuarter];
    }
    return [];
  }, [demoModeEnabled, resetVersion, workspaceQuarter]);

  const [selectedQuarterId, setSelectedQuarterId] = useState("");
  const [narrativeByQuarterId, setNarrativeByQuarterId] = useState<
    Record<string, string>
  >({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    setNarrativeByQuarterId({});
  }, [resetVersion]);

  useEffect(() => {
    if (demoModeEnabled && orderedQuarters.length > 0) {
      const defaultId = getCurrentQuarter().id;
      setSelectedQuarterId((prev) =>
        prev && orderedQuarters.some((q) => q.id === prev) ? prev : defaultId
      );
    } else if (!demoModeEnabled && workspaceQuarter) {
      setSelectedQuarterId(workspaceQuarter.id);
    } else {
      setSelectedQuarterId("");
    }
  }, [demoModeEnabled, resetVersion, orderedQuarters, workspaceQuarter]);

  if (!demoModeEnabled && !workspaceQuarter) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Quarter</h1>
          <p className="text-sm text-muted-foreground">
            Your organization has not set its upcoming fiscal quarter yet.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Complete setup to define when your fiscal year runs and which quarter
            you are in. An owner can do this from organization onboarding.
          </p>
          <Link
            href="/onboarding/org-setup"
            className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Continue setup
          </Link>
        </div>
      </div>
    );
  }

  if (demoModeEnabled && orderedQuarters.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Quarter</h1>
          <p className="text-sm text-muted-foreground">
            No sample quarters loaded. Turn on Demo Mode in System settings to
            explore the Quarter experience with mock data.
          </p>
        </div>
      </div>
    );
  }

  const currentQuarter = demoModeEnabled
    ? getCurrentQuarter()
    : workspaceQuarter!;
  const currentQuarterId = currentQuarter.id;

  const quarter =
    quarterById(orderedQuarters, selectedQuarterId) ??
    (demoModeEnabled ? getQuarterById(selectedQuarterId) : undefined) ??
    currentQuarter;
  const narrativeSummary =
    narrativeByQuarterId[quarter.id] ?? quarter.narrativeSummary ?? "";
  const canEdit = !quarter.hasStarted;
  const anchoredOutcomes: Outcome[] = getOutcomesByQuarter(quarter.id).filter(
    (o) => o.status === "Anchored"
  );
  const adriftOutcomes: Outcome[] = getOutcomesByQuarter(quarter.id).filter(
    (o) =>
      o.noLongerPrioritizedReasonBullets &&
      o.noLongerPrioritizedReasonBullets.length > 0
  );

  const currentIndex = orderedQuarters.findIndex(
    (q) => q.id === currentQuarterId
  );
  const prevQuarter = currentIndex > 0 ? orderedQuarters[currentIndex - 1] : null;
  const nextQuarter =
    currentIndex >= 0 && currentIndex < orderedQuarters.length - 1
      ? orderedQuarters[currentIndex + 1]
      : null;

  function openEditModal() {
    if (!canEdit) return;
    setEditDraft(narrativeSummary);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function saveNarrative() {
    setNarrativeByQuarterId((prev) => ({ ...prev, [quarter.id]: editDraft }));
    closeModal();
  }

  function selectQuarter(q: Quarter) {
    setSelectedQuarterId(q.id);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">Quarter</h1>
        <p className="text-muted-foreground">{quarter.label}</p>
        {demoModeEnabled && selectedQuarterId === currentQuarterId && (
          <p className="text-sm text-muted-foreground">
            Updated {formatUpdatedDate(mockCurrentQuarterUpdatedDate)}
          </p>
        )}
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

      {orderedQuarters.length > 1 && (
        <nav
          className="flex items-center justify-center gap-6 border-t border-border pt-6"
          aria-label="Quarter timeline"
        >
          {prevQuarter && (
            <button
              type="button"
              onClick={() => selectQuarter(prevQuarter)}
              className={`inline-flex items-center gap-1 text-sm font-medium ${
                selectedQuarterId === prevQuarter.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              {prevQuarter.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => selectQuarter(currentQuarter)}
            className={`text-sm font-medium ${
              selectedQuarterId === currentQuarterId
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {currentQuarter.label} (Current)
          </button>
          {nextQuarter && (
            <button
              type="button"
              onClick={() => selectQuarter(nextQuarter)}
              className={`inline-flex items-center gap-1 text-sm font-medium ${
                selectedQuarterId === nextQuarter.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {nextQuarter.label}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </nav>
      )}

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
