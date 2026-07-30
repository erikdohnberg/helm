import scn001 from "@/model/scenarios/scn-001.json";
import scn003 from "@/model/scenarios/scn-003.json";
import scn005 from "@/model/scenarios/scn-005.json";
import scn006 from "@/model/scenarios/scn-006.json";
import scn008 from "@/model/scenarios/scn-008.json";
import scn009 from "@/model/scenarios/scn-009.json";
import scn011 from "@/model/scenarios/scn-011.json";
import scn012 from "@/model/scenarios/scn-012.json";
import scn013 from "@/model/scenarios/scn-013.json";

/**
 * The eval cases, projected for the public record.
 *
 * Nothing here is transcribed. Every string below is read out of the scenario
 * JSON in `model/scenarios/`, which is the same file the eval harness replays,
 * so the page cannot drift from the cases it describes. To show a different
 * case, change the import and the id in SHOWN.
 *
 * One case per drift type, plus both controls — the traps are the point of the
 * "does it know when to say nothing" measure, so a reader should see one.
 */

/**
 * The taxonomy, condensed from §3 of `helm-drift-model-spec.md`. Keep these in
 * step with that table; it is the definition of record.
 */
const TYPE_COPY: Record<string, { name: string; definition: string }> = {
  priority_displacement: {
    name: "Priority displacement",
    definition:
      "Effort drifts to a competing initiative, inferred from behaviour, with no artifact that authorises the shift or prices it.",
  },
  capacity_withdrawal: {
    name: "Capacity withdrawal",
    definition:
      "A published document removes the people a charter depends on, and the charter is left unrevised.",
  },
  commitment_overrun: {
    name: "Commitment overrun",
    definition:
      "An approved, explicitly bounded exception outlives its stated bound with no recorded re-approval.",
  },
  attention_decay: {
    name: "Attention decay",
    definition:
      "Discussion, decisions and work referencing the outcome decline below its baseline — at its deepest, silent abandonment.",
  },
  reasoning_contradiction: {
    name: "Reasoning contradiction",
    definition:
      "Decisions are made that conflict with the charter's stated reasoning or trade-offs.",
  },
  scope_mutation: {
    name: "Scope mutation",
    definition:
      "The outcome is still discussed, but what people mean by it has changed from the charter definition.",
  },
  metric_detachment: {
    name: "Metric detachment",
    definition:
      "The success metric stops appearing in discussion; progress claims become unquantified.",
  },
  deliberate_replacement: {
    name: "Control · deliberate replacement",
    definition:
      "A fast, dramatic change that was decided and recorded in the open. Silence is the correct answer.",
  },
  uncommitted_discussion: {
    name: "Control · uncommitted discussion",
    definition:
      "A lively thread that never became committed work. Silence is the correct answer.",
  },
};

type RawScenario = typeof scn001;

const SHOWN: RawScenario[] = [
  scn001,
  scn003,
  scn005,
  scn006,
  scn011,
  scn012,
  scn013,
  scn008,
  scn009,
] as unknown as RawScenario[];

export type EvalSignal = {
  id: string;
  date: string;
  source: string;
  content: string;
  /** The point the answer key says there was finally enough evidence. */
  isFlagPoint: boolean;
};

export type EvalCase = {
  id: string;
  label: string;
  typeName: string;
  typeDefinition: string;
  isControl: boolean;
  severity: string;
  company: string;
  profile: string;
  charter: {
    title: string;
    outcome: string;
    metric: string;
    baseline: string;
    target: string;
    timeframe: string;
    anchoredOn: string;
    tradeOffs: string[];
  };
  timeline: EvalSignal[];
  /** What a correct flag would have said. Null on the control cases. */
  flagSummary: string | null;
  /** What should happen instead of a flag. Control cases only. */
  insteadSummary: string | null;
  /** Why the answer key puts the flag where it does. */
  rationale: string;
  /** When a person noticed unaided, and how far ahead of them a flag would have been. */
  noticedOn: string | null;
  leadDays: number | null;
  theGap: string;
};

/** `2026-07-14` → `14 Jul`. Parsed from the string's parts so no timezone shifts it. */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatCaseDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

function daysBetween(from: string, to: string): number {
  const a = Date.UTC(...(from.split("-").map(Number) as [number, number, number]));
  const b = Date.UTC(...(to.split("-").map(Number) as [number, number, number]));
  return Math.round((b - a) / 86_400_000);
}

function project(raw: RawScenario): EvalCase {
  const s = raw as unknown as {
    id: string;
    label: string;
    company_context: { name: string; profile: string };
    charter: {
      title: string;
      outcome: string;
      metric: string;
      baseline: string | number;
      target: string | number;
      timeframe: string;
      anchored_on: string;
      trade_offs: string[];
    };
    signal_timeline: {
      signal_id: string;
      date: string;
      source: string;
      content: string;
    }[];
    human_realization: { first_noticed_date?: string | null };
    ground_truth: {
      drift_type: string;
      control_kind?: string | null;
      severity: string;
      earliest_reasonable_flag_signal?: string | null;
      flag_rationale: string;
      expected_flag_summary?: string | null;
      expected_behavior_instead?: string | null;
    };
    information_asymmetry: { the_gap: string };
  };

  const gt = s.ground_truth;
  const isControl = gt.drift_type === "none";
  const key = isControl ? (gt.control_kind ?? "none") : gt.drift_type;
  const copy = TYPE_COPY[key] ?? { name: key, definition: "" };

  const flagSignal = gt.earliest_reasonable_flag_signal;
  const flagDate = s.signal_timeline.find(
    (sig) => sig.signal_id === flagSignal
  )?.date;
  const noticedOn = s.human_realization.first_noticed_date ?? null;

  return {
    id: s.id,
    label: s.label.replace(/^CONTROL — /, ""),
    typeName: copy.name,
    typeDefinition: copy.definition,
    isControl,
    severity: gt.severity,
    company: s.company_context.name,
    profile: s.company_context.profile,
    charter: {
      title: s.charter.title,
      outcome: s.charter.outcome,
      metric: s.charter.metric,
      baseline: String(s.charter.baseline),
      target: String(s.charter.target),
      timeframe: s.charter.timeframe,
      anchoredOn: formatCaseDate(s.charter.anchored_on),
      tradeOffs: s.charter.trade_offs,
    },
    timeline: s.signal_timeline.map((sig) => ({
      id: sig.signal_id,
      date: formatCaseDate(sig.date),
      source: sig.source,
      content: sig.content,
      isFlagPoint: sig.signal_id === flagSignal,
    })),
    flagSummary: gt.expected_flag_summary || null,
    insteadSummary: gt.expected_behavior_instead || null,
    rationale: gt.flag_rationale,
    noticedOn: noticedOn ? formatCaseDate(noticedOn) : null,
    leadDays:
      flagDate && noticedOn ? daysBetween(flagDate, noticedOn) : null,
    theGap: s.information_asymmetry.the_gap,
  };
}

export const EVAL_CASES: EvalCase[] = SHOWN.map(project);
