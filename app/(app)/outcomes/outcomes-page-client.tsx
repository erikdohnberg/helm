"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Eyebrow, RecordTitle } from "@/components/ui/card";
import { Chip, Observed } from "@/components/ui/chip";
import {
  ExternalLink,
  Input,
  RadioOption,
  Select,
  Textarea,
} from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/table";
import { OutcomeCard } from "@/components/outcomes/outcome-card";
import {
  formatOutcomeStatus,
  formatRecordDate,
  outcomeStateOf,
} from "@/lib/design/outcome-state";
import { useDemoData } from "@/lib/demo-data-context";
import {
  getOutcomeById,
  getOutcomesByQuarter,
  getQuarterById,
} from "@/lib/mock/mockData";
import type {
  EntryMode,
  Outcome,
  Quarter,
  SourceType,
} from "@/lib/types";

/** Quarter order on outcomes page: FY26 Q2, then FY26 Q1, then older. */
const OUTCOMES_QUARTER_ORDER = ["q-fy26-q2", "q-fy26-q1", "q-fy25-q4"];

function OutcomeEntry({
  outcome,
  quarterLabel,
  chatThreadLinkLabel,
  onRetire,
  onReturn,
}: {
  outcome: Outcome;
  quarterLabel: string;
  chatThreadLinkLabel: string;
  onRetire: (outcomeId: string, outcomeTitle: string) => void;
  onReturn: (outcomeId: string) => void;
}) {
  const replacedOutcome =
    outcome.entryMode === "Replace" && outcome.replacedOutcomeId
      ? getOutcomeById(outcome.replacedOutcomeId)
      : undefined;
  const retired = outcome.status === "Inactive";
  const lastActivity = formatRecordDate(outcome.lastActivityDate);

  const facts = [
    { label: "Outcome owner", value: outcome.outcomeOwner || "—" },
    { label: "Decision owner", value: outcome.decisionOwner || "—" },
  ];

  return (
    <OutcomeCard
      state={outcomeStateOf(outcome)}
      title={outcome.title}
      quarter={outcome.status === "Anchored" ? quarterLabel : undefined}
      replaces={replacedOutcome?.title}
      facts={facts}
      observed={
        lastActivity ? `Last activity ${lastActivity}` : "No activity observed"
      }
      actions={
        outcome.status !== "Anchored" && !retired ? (
          <Chip variant="outline" label={formatOutcomeStatus(outcome.status)} />
        ) : null
      }
      links={
        <>
          {outcome.googleDocUrl && (
            <ExternalLink href={outcome.googleDocUrl}>
              Open the charter
            </ExternalLink>
          )}
          {outcome.slackThreadUrl && (
            <ExternalLink href={outcome.slackThreadUrl}>
              {chatThreadLinkLabel}
            </ExternalLink>
          )}
          {retired ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReturn(outcome.id)}
            >
              Return it to the quarter
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRetire(outcome.id, outcome.title)}
            >
              Retire this outcome
            </Button>
          )}
        </>
      }
    >
      {outcome.entryMode === "Additive" && outcome.focusWarning && (
        <p className="max-w-prose text-help text-muted-foreground">
          Nothing stopped when this entered {quarterLabel}. The partial rule
          marks it as additive for the rest of the quarter.
        </p>
      )}
    </OutcomeCard>
  );
}

export default function OutcomesPageClient({
  workspaceQuarter,
  chatThreadLinkLabel,
}: {
  workspaceQuarter: Quarter | null;
  chatThreadLinkLabel: string;
}) {
  const { resetVersion, demoModeEnabled } = useDemoData();
  const [retireReasonByOutcomeId, setRetireReasonByOutcomeId] = useState<
    Record<string, string>
  >({});
  const [returnedOutcomeIds, setReturnedOutcomeIds] = useState<Set<string>>(
    new Set()
  );
  const [retireModal, setRetireModal] = useState<{
    outcomeId: string;
    outcomeTitle: string;
  } | null>(null);
  const [reasonDraft, setReasonDraft] = useState("");
  const [newOutcomeModalOpen, setNewOutcomeModalOpen] = useState(false);
  const [newOutcomeStep1, setNewOutcomeStep1] = useState({
    workingTitle: "",
    quarterId: "",
    shortIntent: "",
    outcomeOwner: "",
    decisionOwner: "",
    sourceType: "" as SourceType | "",
  });
  const [newOutcomeStep, setNewOutcomeStep] = useState<1 | 2>(1);
  const [newOutcomeStep2, setNewOutcomeStep2] = useState<{
    entryMode: "" | EntryMode;
    replacedOutcomeId: string;
  }>({ entryMode: "", replacedOutcomeId: "" });
  const [localOutcomes, setLocalOutcomes] = useState<Outcome[]>([]);

  useEffect(() => {
    setRetireReasonByOutcomeId({});
    setReturnedOutcomeIds(new Set());
    setRetireModal(null);
    setReasonDraft("");
    setNewOutcomeModalOpen(false);
    setNewOutcomeStep(1);
    setNewOutcomeStep1({
      workingTitle: "",
      quarterId: "",
      shortIntent: "",
      outcomeOwner: "",
      decisionOwner: "",
      sourceType: "",
    });
    setNewOutcomeStep2({ entryMode: "", replacedOutcomeId: "" });
    setLocalOutcomes([]);
  }, [resetVersion]);

  const quartersInOrder = useMemo(() => {
    if (demoModeEnabled) {
      return OUTCOMES_QUARTER_ORDER.map((id) => getQuarterById(id)).filter(
        (q): q is NonNullable<typeof q> => q != null
      );
    }
    if (workspaceQuarter) {
      return [workspaceQuarter];
    }
    return [];
  }, [demoModeEnabled, resetVersion, workspaceQuarter]);

  const sections = useMemo(
    () =>
      demoModeEnabled
        ? quartersInOrder.map((q) => ({ id: q.id, label: q.label }))
        : workspaceQuarter
          ? [{ id: workspaceQuarter.id, label: workspaceQuarter.label }]
          : Array.from(new Set(localOutcomes.map((o) => o.quarterId))).map(
              (id) => ({
                id,
                label: getQuarterById(id)?.label ?? id,
              })
            ),
    [demoModeEnabled, quartersInOrder, localOutcomes, workspaceQuarter]
  );

  const showGlobalEmpty =
    !demoModeEnabled && !workspaceQuarter && localOutcomes.length === 0;

  const canCreateOutcome =
    demoModeEnabled || !!workspaceQuarter || localOutcomes.length > 0;

  const openNewOutcomeModal = useCallback(
    (presetQuarterId?: string) => {
      setNewOutcomeStep(1);
      setNewOutcomeStep2({ entryMode: "", replacedOutcomeId: "" });
      const defaultQuarterId =
        presetQuarterId ?? quartersInOrder[0]?.id ?? sections[0]?.id ?? "";
      setNewOutcomeStep1({
        workingTitle: "",
        quarterId: defaultQuarterId,
        shortIntent: "",
        outcomeOwner: "",
        decisionOwner: "",
        sourceType: "",
      });
      setNewOutcomeModalOpen(true);
    },
    [quartersInOrder, sections]
  );

  function openRetireModal(outcomeId: string, outcomeTitle: string) {
    setRetireModal({ outcomeId, outcomeTitle });
    setReasonDraft("");
  }

  function closeRetireModal() {
    setRetireModal(null);
    setReasonDraft("");
  }

  function recordRetirement() {
    if (!retireModal || !reasonDraft.trim()) return;
    setRetireReasonByOutcomeId((prev) => ({
      ...prev,
      [retireModal.outcomeId]: reasonDraft.trim(),
    }));
    setReturnedOutcomeIds((prev) => {
      const next = new Set(prev);
      next.delete(retireModal.outcomeId);
      return next;
    });
    closeRetireModal();
  }

  function getEffectiveOutcome(outcome: Outcome): Outcome {
    if (returnedOutcomeIds.has(outcome.id)) {
      return { ...outcome, status: "AwaitingAlignment" };
    }
    if (outcome.id in retireReasonByOutcomeId) {
      return { ...outcome, status: "Inactive" };
    }
    return outcome;
  }

  function handleReturn(outcomeId: string) {
    setReturnedOutcomeIds((prev) => new Set(prev).add(outcomeId));
  }

  function closeNewOutcomeModalAndReset() {
    setNewOutcomeModalOpen(false);
    setNewOutcomeStep(1);
    setNewOutcomeStep1({
      workingTitle: "",
      quarterId: "",
      shortIntent: "",
      outcomeOwner: "",
      decisionOwner: "",
      sourceType: "",
    });
    setNewOutcomeStep2({ entryMode: "", replacedOutcomeId: "" });
  }

  const anchoredInSelectedQuarter = newOutcomeStep1.quarterId
    ? getOutcomesByQuarter(newOutcomeStep1.quarterId)
        .map(getEffectiveOutcome)
        .filter((o) => o.status === "Anchored")
    : [];

  function recordNewOutcome() {
    const entryMode = newOutcomeStep2.entryMode;
    if (!entryMode) return;
    if (entryMode === "Replace" && !newOutcomeStep2.replacedOutcomeId) return;

    const quarterId = newOutcomeStep1.quarterId;
    const anchoredCount = getOutcomesByQuarter(quarterId)
      .map(getEffectiveOutcome)
      .filter((o) => o.status === "Anchored").length;
    const focusWarning =
      entryMode === "Additive" && anchoredCount > 5
        ? "Nothing stopped when this entered the quarter."
        : null;

    const outcome: Outcome = {
      id: `local-${Date.now()}`,
      title: newOutcomeStep1.workingTitle.trim() || "Untitled outcome",
      quarterId,
      context: newOutcomeStep1.shortIntent.trim(),
      metric: "",
      target: "",
      timeframe: "",
      decisionBullets: [],
      googleDocUrl: null,
      slackThreadUrl: null,
      status: "Draft",
      outcomeOwner: newOutcomeStep1.outcomeOwner.trim(),
      decisionOwner: newOutcomeStep1.decisionOwner.trim(),
      entryMode,
      sourceType: newOutcomeStep1.sourceType || "Discussion",
      reprioritizedFromQuarterLabel: null,
      replacedOutcomeId:
        entryMode === "Replace" ? newOutcomeStep2.replacedOutcomeId : null,
      replacedByOutcomeId: null,
      attachedToOutcomeId: null,
      focusWarning,
      noLongerPrioritizedReasonBullets: [],
      originallyAnchoredLabel: null,
      lastActivityDate: null,
    };

    setLocalOutcomes((prev) => [...prev, outcome]);
    closeNewOutcomeModalAndReset();
  }

  const step2Incomplete =
    !newOutcomeStep2.entryMode ||
    (newOutcomeStep2.entryMode === "Replace" &&
      !newOutcomeStep2.replacedOutcomeId);

  return (
    <div className="flex flex-col gap-section">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>Every commitment on the record</Eyebrow>
          <RecordTitle as="h1" level="page">
            Outcomes
          </RecordTitle>
        </div>
        <Button
          onClick={() => openNewOutcomeModal()}
          disabled={!canCreateOutcome}
          title={
            canCreateOutcome
              ? undefined
              : "No quarter is defined yet — set the fiscal year in organization setup."
          }
        >
          Anchor an outcome
        </Button>
      </header>

      {showGlobalEmpty && (
        <EmptyState
          title="Nothing anchored yet"
          action={
            <Link href="/onboarding/org-setup">
              <Button>Set the fiscal year</Button>
            </Link>
          }
        >
          A quarter with no anchored outcome has no direction to drift from.
          Helm needs a fiscal quarter before an outcome can enter one.
        </EmptyState>
      )}

      {!showGlobalEmpty &&
        sections.map((section) => {
          const mockOutcomes = demoModeEnabled
            ? getOutcomesByQuarter(section.id).map(getEffectiveOutcome)
            : [];
          const localForQuarter = localOutcomes.filter(
            (o) => o.quarterId === section.id
          );
          const outcomes = [...mockOutcomes, ...localForQuarter].sort((a, b) =>
            a.title.localeCompare(b.title)
          );

          if (outcomes.length === 0) {
            if (!demoModeEnabled && !workspaceQuarter) return null;
            return (
              <section key={section.id} className="flex flex-col gap-4">
                <Eyebrow>{section.label}</Eyebrow>
                <EmptyState
                  title="Nothing anchored in this quarter"
                  action={
                    <Button onClick={() => openNewOutcomeModal(section.id)}>
                      Anchor an outcome
                    </Button>
                  }
                >
                  A quarter with no anchored outcome has no direction to drift
                  from.
                </EmptyState>
              </section>
            );
          }

          return (
            <section key={section.id} className="flex flex-col gap-4">
              <Eyebrow>{section.label}</Eyebrow>
              <ul className="flex flex-col gap-3">
                {outcomes.map((outcome) => (
                  <OutcomeEntry
                    key={outcome.id}
                    outcome={outcome}
                    quarterLabel={section.label}
                    chatThreadLinkLabel={chatThreadLinkLabel}
                    onRetire={openRetireModal}
                    onReturn={handleReturn}
                  />
                ))}
              </ul>
            </section>
          );
        })}

      {/* ── Entry-mode decision · e3 ───────────────────────────────────────
        * Nothing enters the quarter silently. Every option is recorded, and
        * each states its consequence in the same breath. */}
      <Modal
        open={newOutcomeModalOpen}
        onClose={closeNewOutcomeModalAndReset}
        width="560px"
        title={
          newOutcomeStep === 1
            ? "A new outcome"
            : newOutcomeStep1.workingTitle.trim() || "This outcome"
        }
        description={
          newOutcomeStep === 1
            ? "What the team would be committing to, and who decides it."
            : "Nothing enters the quarter silently. Every option below is recorded."
        }
        footer={
          newOutcomeStep === 1 ? (
            <>
              <Button variant="outline" onClick={closeNewOutcomeModalAndReset}>
                Discard this draft
              </Button>
              <Button onClick={() => setNewOutcomeStep(2)}>
                How it enters the quarter
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setNewOutcomeStep(1)}>
                Back to the charter
              </Button>
              <Button onClick={recordNewOutcome} disabled={step2Incomplete}>
                Record this decision
              </Button>
            </>
          )
        }
      >
        {newOutcomeStep === 1 ? (
          <div className="flex flex-col gap-field">
            <Input
              id="new-outcome-working-title"
              label="Working title"
              value={newOutcomeStep1.workingTitle}
              onChange={(e) =>
                setNewOutcomeStep1((s) => ({
                  ...s,
                  workingTitle: e.target.value,
                }))
              }
              placeholder="Two named design partners live on the co-sell motion"
              help="Shown on the outcome charter."
            />
            <Select
              id="new-outcome-quarter"
              label="Quarter"
              value={newOutcomeStep1.quarterId}
              onChange={(e) =>
                setNewOutcomeStep1((s) => ({ ...s, quarterId: e.target.value }))
              }
              placeholder="Which quarter"
              options={quartersInOrder.map((q) => ({
                value: q.id,
                label: q.label,
              }))}
            />
            <Textarea
              id="new-outcome-short-intent"
              label="Context"
              value={newOutcomeStep1.shortIntent}
              onChange={(e) =>
                setNewOutcomeStep1((s) => ({
                  ...s,
                  shortIntent: e.target.value,
                }))
              }
              rows={3}
              placeholder="Why this outcome, and what it trades off…"
            />
            <Input
              id="new-outcome-owner"
              label="Outcome owner"
              value={newOutcomeStep1.outcomeOwner}
              onChange={(e) =>
                setNewOutcomeStep1((s) => ({
                  ...s,
                  outcomeOwner: e.target.value,
                }))
              }
              placeholder="Ada Lovelace"
              help="The person accountable for the outcome."
            />
            <Input
              id="new-outcome-decision-owner"
              label="Decision owner"
              value={newOutcomeStep1.decisionOwner}
              onChange={(e) =>
                setNewOutcomeStep1((s) => ({
                  ...s,
                  decisionOwner: e.target.value,
                }))
              }
              placeholder="Grace Hopper"
              help="The person who can trade this outcome for another."
            />
            <Select
              id="new-outcome-source-type"
              label="Where this came from"
              value={newOutcomeStep1.sourceType}
              onChange={(e) =>
                setNewOutcomeStep1((s) => ({
                  ...s,
                  sourceType: e.target.value as SourceType | "",
                }))
              }
              placeholder="Where this came from"
              options={[
                { value: "Meeting", label: "Meeting" },
                { value: "Discussion", label: "Discussion" },
                { value: "LeadershipInput", label: "Leadership input" },
              ]}
            />
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-label="How this enters the quarter"
            className="flex flex-col divide-y divide-border border-y border-border"
          >
            <RadioOption
              id="entry-mode-attach"
              name="new-outcome-entry-mode"
              value="Attach"
              checked={newOutcomeStep2.entryMode === "Attach"}
              onChange={() =>
                setNewOutcomeStep2((s) => ({
                  ...s,
                  entryMode: "Attach",
                  replacedOutcomeId: "",
                }))
              }
              hint="No new commitment enters the quarter. The work is recorded as serving something already anchored."
              className="py-3"
            >
              Attach to an existing outcome
            </RadioOption>

            <RadioOption
              id="entry-mode-replace"
              name="new-outcome-entry-mode"
              value="Replace"
              checked={newOutcomeStep2.entryMode === "Replace"}
              onChange={() =>
                setNewOutcomeStep2((s) => ({ ...s, entryMode: "Replace" }))
              }
              hint="The replaced outcome stays visible in the record, with this one named as its successor."
              className="py-3"
            >
              Replace an anchored outcome
            </RadioOption>
            {newOutcomeStep2.entryMode === "Replace" &&
              newOutcomeStep1.quarterId && (
                <div className="ml-7 py-3">
                  <Select
                    id="new-outcome-replace"
                    label="What stops?"
                    value={newOutcomeStep2.replacedOutcomeId}
                    onChange={(e) =>
                      setNewOutcomeStep2((s) => ({
                        ...s,
                        replacedOutcomeId: e.target.value,
                      }))
                    }
                    placeholder="The outcome this takes the place of"
                    options={anchoredInSelectedQuarter.map((o) => ({
                      value: o.id,
                      label: o.title,
                    }))}
                    help={
                      anchoredInSelectedQuarter.length === 0
                        ? "Nothing is anchored in this quarter, so there is nothing to replace."
                        : undefined
                    }
                  />
                </div>
              )}

            <RadioOption
              id="entry-mode-additive"
              name="new-outcome-entry-mode"
              value="Additive"
              checked={newOutcomeStep2.entryMode === "Additive"}
              onChange={() =>
                setNewOutcomeStep2((s) => ({
                  ...s,
                  entryMode: "Additive",
                  replacedOutcomeId: "",
                }))
              }
              hint={`The quarter goes from ${anchoredInSelectedQuarter.length} to ${
                anchoredInSelectedQuarter.length + 1
              } anchored outcomes. The partial rule marks this outcome as additive for the rest of the quarter.`}
              className="py-3"
            >
              Add alongside — nothing stops
            </RadioOption>
          </div>
        )}
      </Modal>

      {/* ── Retire · irreversible for the quarter, so it states the alternative ── */}
      <Modal
        open={retireModal != null}
        onClose={closeRetireModal}
        title="Retiring removes this outcome from the record"
        description="Nothing will stand in its place. Replacing keeps it in the record with a named successor."
        footer={
          <>
            <Button variant="outline" onClick={closeRetireModal}>
              Keep it anchored
            </Button>
            <Button
              variant="destructive"
              onClick={recordRetirement}
              disabled={!reasonDraft.trim()}
            >
              Retire and record
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-field">
          {retireModal && (
            <p className="max-w-prose font-serif text-outcome text-foreground">
              {retireModal.outcomeTitle}
            </p>
          )}
          <Textarea
            id="retire-reason"
            label="Why it ends here"
            value={reasonDraft}
            onChange={(e) => setReasonDraft(e.target.value)}
            rows={4}
            placeholder="What changed, and what the team is doing instead…"
            help="The reasoning stays fully legible in the record after the outcome is retired."
          />
          <Observed className="text-help">
            Retiring is recorded against your name and today&rsquo;s date.
          </Observed>
        </div>
      </Modal>
    </div>
  );
}
