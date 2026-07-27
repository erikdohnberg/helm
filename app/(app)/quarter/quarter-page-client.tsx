"use client";

import { useState, useEffect, useMemo } from "react";

import Link from "next/link";

import { OutcomeCard } from "@/components/outcomes/outcome-card";
import { Button, IconButton } from "@/components/ui/button";
import { Eyebrow, RecordTitle } from "@/components/ui/card";
import { Observed } from "@/components/ui/chip";
import { ExternalLink, Textarea } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/table";
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

/** Dates are `21 Feb` — day, short month, no year within the current fiscal year. */
function formatRecordDate(iso: string): string {
  return new Date(iso + "Z").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function AnchoredOutcome({ outcome }: { outcome: Outcome }) {
  const replacedOutcome = outcome.replacedOutcomeId
    ? getOutcomeById(outcome.replacedOutcomeId)
    : undefined;

  const facts = [
    outcome.metric && { label: "Metric", value: outcome.metric },
    outcome.target && { label: "Target", value: outcome.target },
    outcome.timeframe && { label: "Timeframe", value: outcome.timeframe },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <OutcomeCard
      state="anchored"
      title={outcome.title}
      replaces={replacedOutcome?.title}
      facts={facts}
      reasons={outcome.decisionBullets}
      links={
        outcome.googleDocUrl ? (
          <ExternalLink href={outcome.googleDocUrl}>
            Open the full charter
          </ExternalLink>
        ) : null
      }
    >
      {outcome.context && (
        <p className="max-w-prose text-help text-muted-foreground">
          {outcome.context}
        </p>
      )}
    </OutcomeCard>
  );
}

function TradedAwayOutcome({ outcome }: { outcome: Outcome }) {
  return (
    <OutcomeCard
      state="replaced"
      title={outcome.title}
      reasons={outcome.noLongerPrioritizedReasonBullets}
      links={
        outcome.googleDocUrl ? (
          <ExternalLink href={outcome.googleDocUrl}>
            Open the decision note
          </ExternalLink>
        ) : null
      }
    >
      {outcome.originallyAnchoredLabel && (
        <p className="text-help text-muted-foreground">
          Anchored in {outcome.originallyAnchoredLabel}. It stays in the record.
        </p>
      )}
    </OutcomeCard>
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
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Eyebrow>The quarter</Eyebrow>
          <RecordTitle as="h1" level="page">
            No quarter is defined
          </RecordTitle>
        </header>
        <EmptyState
          title="There is no quarter to record against"
          action={
            <Link href="/onboarding/org-setup">
              <Button>Set the fiscal year</Button>
            </Link>
          }
        >
          Helm needs to know when your fiscal year runs before an outcome can be
          anchored to a quarter. An owner sets it in organization setup.
        </EmptyState>
      </div>
    );
  }

  if (demoModeEnabled && orderedQuarters.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Eyebrow>The quarter</Eyebrow>
          <RecordTitle as="h1" level="page">
            No quarter is defined
          </RecordTitle>
        </header>
        <EmptyState title="No sample quarters are loaded">
          Turn on demo mode in system settings to read a quarter that already
          has a record.
        </EmptyState>
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
  const tradedAwayOutcomes: Outcome[] = getOutcomesByQuarter(quarter.id).filter(
    (o) =>
      o.noLongerPrioritizedReasonBullets &&
      o.noLongerPrioritizedReasonBullets.length > 0
  );

  const currentIndex = orderedQuarters.findIndex(
    (q) => q.id === currentQuarterId
  );
  const prevQuarter =
    currentIndex > 0 ? orderedQuarters[currentIndex - 1] : null;
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

  function recordNarrative() {
    setNarrativeByQuarterId((prev) => ({ ...prev, [quarter.id]: editDraft }));
    closeModal();
  }

  function selectQuarter(q: Quarter) {
    setSelectedQuarterId(q.id);
  }

  return (
    <div className="flex flex-col gap-section">
      <header className="flex flex-col gap-3">
        <Eyebrow>{quarter.label}</Eyebrow>
        <RecordTitle as="h1" level="page">
          The quarter as recorded
        </RecordTitle>
        <p className="max-w-prose text-muted-foreground">
          {anchoredOutcomes.length === 1
            ? "One outcome stands."
            : `${anchoredOutcomes.length} outcomes stand.`}{" "}
          {tradedAwayOutcomes.length > 0 &&
            (tradedAwayOutcomes.length === 1
              ? "One was traded away and stays in the record."
              : `${tradedAwayOutcomes.length} were traded away and stay in the record.`)}
        </p>
        {demoModeEnabled && selectedQuarterId === currentQuarterId && (
          <Observed className="text-help">
            Last written to {formatRecordDate(mockCurrentQuarterUpdatedDate)}
          </Observed>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-1">
          <Eyebrow>What this quarter committed to</Eyebrow>
          {canEdit && (
            <IconButton
              label="Edit the quarter narrative"
              onClick={openEditModal}
              className="-my-3"
            >
              <Icon name="heading" size={16} />
            </IconButton>
          )}
        </div>
        {narrativeSummary ? (
          <p className="max-w-prose font-serif text-lede text-foreground">
            {narrativeSummary}
          </p>
        ) : (
          <p className="max-w-prose text-muted-foreground">
            Nothing has been written about this quarter yet.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <Eyebrow>Anchored</Eyebrow>
        {anchoredOutcomes.length === 0 ? (
          <EmptyState
            title="Nothing anchored yet"
            observed="Nothing observed to contradict"
          >
            A quarter with no anchored outcome has no direction to drift from.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {anchoredOutcomes.map((outcome) => (
              <AnchoredOutcome key={outcome.id} outcome={outcome} />
            ))}
          </ul>
        )}
      </section>

      {tradedAwayOutcomes.length > 0 && (
        <section className="flex flex-col gap-4">
          <Eyebrow>Traded away</Eyebrow>
          <ul className="flex flex-col gap-3">
            {tradedAwayOutcomes.map((outcome) => (
              <TradedAwayOutcome key={outcome.id} outcome={outcome} />
            ))}
          </ul>
        </section>
      )}

      {orderedQuarters.length > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-6 border-t border-border pt-7"
          aria-label="Quarters in the record"
        >
          {prevQuarter && (
            <button
              type="button"
              onClick={() => selectQuarter(prevQuarter)}
              aria-current={
                selectedQuarterId === prevQuarter.id ? "true" : undefined
              }
              className={`inline-flex items-center gap-1.5 text-control font-medium ${
                selectedQuarterId === prevQuarter.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name="chevron" size={14} className="rotate-180" />
              {prevQuarter.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => selectQuarter(currentQuarter)}
            aria-current={
              selectedQuarterId === currentQuarterId ? "true" : undefined
            }
            className={`text-control font-medium ${
              selectedQuarterId === currentQuarterId
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {currentQuarter.label} · current
          </button>
          {nextQuarter && (
            <button
              type="button"
              onClick={() => selectQuarter(nextQuarter)}
              aria-current={
                selectedQuarterId === nextQuarter.id ? "true" : undefined
              }
              className={`inline-flex items-center gap-1.5 text-control font-medium ${
                selectedQuarterId === nextQuarter.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {nextQuarter.label}
              <Icon name="chevron" size={14} />
            </button>
          )}
        </nav>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="What this quarter committed to"
        description={`Written to the record for ${quarter.label}. It is read by everyone who missed the meeting.`}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Discard this draft
            </Button>
            <Button onClick={recordNarrative}>Record this decision</Button>
          </>
        }
      >
        <Textarea
          id="quarter-narrative"
          label="The quarter, in a paragraph"
          value={editDraft}
          onChange={(e) => setEditDraft(e.target.value)}
          rows={5}
          placeholder="What this quarter committed to, and what it traded away…"
          help="One sentence earns its second by adding a fact."
        />
      </Modal>
    </div>
  );
}
