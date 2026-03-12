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
}: {
  outcome: Outcome;
  quarterLabel: string;
}) {
  const replacedOutcome =
    outcome.entryMode === "Replace" && outcome.replacedOutcomeId
      ? getOutcomeById(outcome.replacedOutcomeId)
      : undefined;
  const showAdditiveFocusWarning =
    outcome.entryMode === "Additive" && outcome.focusWarning;

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
      </div>
    </li>
  );
}

export default function OutcomesPage() {
  const quartersInOrder = OUTCOMES_QUARTER_ORDER.map((id) => getQuarterById(id)).filter(
    (q): q is NonNullable<typeof q> => q != null
  );

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-foreground">Outcomes</h1>
      {quartersInOrder.map((quarter) => {
        const outcomes = getOutcomesByQuarter(quarter.id);
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
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
