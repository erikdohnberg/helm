import type { Outcome, Quarter } from "@/lib/types";

const CURRENT_QUARTER_ID = "q-fy26-q1";

const MOCK_QUARTERS: Quarter[] = [
  {
    id: "q-fy25-q4",
    label: "FY25 Q4",
    year: 2025,
    startDate: "2025-07-01",
    endDate: "2025-09-30",
    narrativeSummary: null,
    hasStarted: true,
  },
  {
    id: "q-fy26-q1",
    label: "FY26 Q1",
    year: 2026,
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    narrativeSummary:
      "Q1 focuses on billing unification and self-serve migration to reduce support load and unblock enterprise pipeline. EU compliance certification is in scope; partner co-sell is deferred to Q2.",
    hasStarted: false,
  },
  {
    id: "q-fy26-q2",
    label: "FY26 Q2",
    year: 2026,
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    narrativeSummary: null,
    hasStarted: false,
  },
];

const MOCK_OUTCOMES: Outcome[] = [
  // FY26 Q1 — Anchored (replaces out-2)
  {
    id: "out-1",
    title: "Ship unified billing experience",
    quarterId: "q-fy26-q1",
    context: "Customers hit friction when managing multiple products; support volume is high.",
    metric: "Support tickets related to billing",
    target: "Reduce by 40%",
    timeframe: "By end of FY26 Q1",
    decisionBullets: [
      "Leadership aligned on single billing surface as top priority.",
      "Engineering capacity committed from Platform and Payments.",
    ],
    googleDocUrl: "https://docs.google.com/document/d/1",
    slackThreadUrl: "https://slack.com/archives/C123/p123",
    status: "Anchored",
    outcomeOwner: "Jordan Lee",
    decisionOwner: "Sam Chen",
    entryMode: "Replace",
    sourceType: "Meeting",
    reprioritizedFromQuarterLabel: null,
    replacedOutcomeId: "out-2",
    replacedByOutcomeId: null,
    attachedToOutcomeId: null,
    focusWarning: null,
    noLongerPrioritizedReasonBullets: [],
    originallyAnchoredLabel: null,
    lastActivityDate: "2025-12-01",
  },
  // FY26 Q1 — Inactive (replaced by out-1)
  {
    id: "out-2",
    title: "Legacy billing consolidation (paused)",
    quarterId: "q-fy26-q1",
    context: "Original scope was Phase 1 only; superseded by unified billing outcome.",
    metric: "N/A",
    target: "N/A",
    timeframe: "N/A",
    decisionBullets: ["Deprioritized in favor of unified billing experience."],
    googleDocUrl: "https://docs.google.com/document/d/2",
    slackThreadUrl: null,
    status: "Inactive",
    outcomeOwner: "Jordan Lee",
    decisionOwner: "Sam Chen",
    entryMode: "Replace",
    sourceType: "LeadershipInput",
    reprioritizedFromQuarterLabel: null,
    replacedOutcomeId: null,
    replacedByOutcomeId: "out-1",
    attachedToOutcomeId: null,
    focusWarning: null,
    noLongerPrioritizedReasonBullets: [
      "Superseded by unified billing outcome (out-1).",
      "Leadership chose broader scope over incremental consolidation.",
    ],
    originallyAnchoredLabel: "FY26 Q1",
    lastActivityDate: "2025-11-15",
  },
  // FY26 Q1 — Anchored
  {
    id: "out-3",
    title: "Launch self-serve migration toolkit",
    quarterId: "q-fy26-q1",
    context: "Enterprise deals are blocked on manual migration; product-led motion needs this.",
    metric: "Time to first value for new enterprise accounts",
    target: "Under 14 days",
    timeframe: "By end of FY26 Q1",
    decisionBullets: [
      "Product and GTM agreed on self-serve as differentiator.",
      "Documented in Q1 planning doc.",
    ],
    googleDocUrl: "https://docs.google.com/document/d/3",
    slackThreadUrl: "https://slack.com/archives/C123/p456",
    status: "Anchored",
    outcomeOwner: "Alex Rivera",
    decisionOwner: "Sam Chen",
    entryMode: "Attach",
    sourceType: "Discussion",
    reprioritizedFromQuarterLabel: null,
    replacedOutcomeId: null,
    replacedByOutcomeId: null,
    attachedToOutcomeId: null,
    focusWarning: null,
    noLongerPrioritizedReasonBullets: [],
    originallyAnchoredLabel: null,
    lastActivityDate: "2025-12-05",
  },
  // FY26 Q1 — Anchored, Additive with focusWarning
  {
    id: "out-4",
    title: "Deliver compliance certification for EU region",
    quarterId: "q-fy26-q1",
    context: "Required for EU expansion; legal and sales have been pushing for timeline.",
    metric: "Certification achieved",
    target: "Complete by Dec 31",
    timeframe: "By end of FY26 Q1",
    decisionBullets: [
      "Board asked for clarity on EU readiness.",
      "Legal and Security committed to support.",
    ],
    googleDocUrl: "https://docs.google.com/document/d/4",
    slackThreadUrl: null,
    status: "Anchored",
    outcomeOwner: "Morgan Taylor",
    decisionOwner: "Sam Chen",
    entryMode: "Additive",
    sourceType: "LeadershipInput",
    reprioritizedFromQuarterLabel: null,
    replacedOutcomeId: null,
    replacedByOutcomeId: null,
    attachedToOutcomeId: null,
    focusWarning:
      "New priority; ensure capacity reviewed. May require trade-off with other Q1 commitments.",
    noLongerPrioritizedReasonBullets: [],
    originallyAnchoredLabel: null,
    lastActivityDate: "2025-11-28",
  },
  // FY26 Q1 — Inactive
  {
    id: "out-5",
    title: "Pilot partner co-sell program",
    quarterId: "q-fy26-q1",
    context: "Pilot did not get enough pipeline; deferred to next quarter.",
    metric: "Pipeline from partners",
    target: "N/A",
    timeframe: "N/A",
    decisionBullets: ["Deferred to FY26 Q2 after pipeline review."],
    googleDocUrl: "https://docs.google.com/document/d/5",
    slackThreadUrl: null,
    status: "Inactive",
    outcomeOwner: "Casey Kim",
    decisionOwner: "Sam Chen",
    entryMode: "Additive",
    sourceType: "Meeting",
    reprioritizedFromQuarterLabel: null,
    replacedOutcomeId: null,
    replacedByOutcomeId: null,
    attachedToOutcomeId: null,
    focusWarning: null,
    noLongerPrioritizedReasonBullets: [
      "Pipeline from pilot below threshold.",
      "Partners need more enablement before scaling.",
    ],
    originallyAnchoredLabel: "FY26 Q1",
    lastActivityDate: "2025-11-20",
  },
  // FY26 Q2 — Draft
  {
    id: "out-6",
    title: "Improve onboarding completion rate",
    quarterId: "q-fy26-q2",
    context: "Drop-off in first week is high; hypothesis is unclear value prop.",
    metric: "Day-7 completion rate",
    target: "TBD",
    timeframe: "FY26 Q2",
    decisionBullets: [],
    googleDocUrl: null,
    slackThreadUrl: null,
    status: "Draft",
    outcomeOwner: "Jordan Lee",
    decisionOwner: "Sam Chen",
    entryMode: "Additive",
    sourceType: "Discussion",
    reprioritizedFromQuarterLabel: null,
    replacedOutcomeId: null,
    replacedByOutcomeId: null,
    attachedToOutcomeId: null,
    focusWarning: null,
    noLongerPrioritizedReasonBullets: [],
    originallyAnchoredLabel: null,
    lastActivityDate: null,
  },
  // FY26 Q2 — AwaitingAlignment
  {
    id: "out-7",
    title: "Scale outbound motion in EMEA",
    quarterId: "q-fy26-q2",
    context: "EMEA growth is a board priority; need sales and marketing alignment.",
    metric: "Qualified opportunities in EMEA",
    target: "2x current run rate",
    timeframe: "By end of FY26 Q2",
    decisionBullets: [
      "Draft charter shared; awaiting GTM and regional lead sign-off.",
    ],
    googleDocUrl: "https://docs.google.com/document/d/7",
    slackThreadUrl: null,
    status: "AwaitingAlignment",
    outcomeOwner: "Casey Kim",
    decisionOwner: "Sam Chen",
    entryMode: "Additive",
    sourceType: "LeadershipInput",
    reprioritizedFromQuarterLabel: null,
    replacedOutcomeId: null,
    replacedByOutcomeId: null,
    attachedToOutcomeId: null,
    focusWarning: null,
    noLongerPrioritizedReasonBullets: [],
    originallyAnchoredLabel: null,
    lastActivityDate: "2025-12-02",
  },
  // FY26 Q2 — InDevelopment
  {
    id: "out-8",
    title: "Ship new analytics dashboard for product usage",
    quarterId: "q-fy26-q2",
    context: "Customers and CS have asked for better visibility into usage.",
    metric: "Dashboard adoption among paying accounts",
    target: "60% within 30 days of release",
    timeframe: "FY26 Q2",
    decisionBullets: [
      "Product and Engineering aligned; implementation in progress.",
    ],
    googleDocUrl: "https://docs.google.com/document/d/8",
    slackThreadUrl: "https://slack.com/archives/C123/p789",
    status: "InDevelopment",
    outcomeOwner: "Alex Rivera",
    decisionOwner: "Sam Chen",
    entryMode: "Attach",
    sourceType: "Discussion",
    reprioritizedFromQuarterLabel: null,
    replacedOutcomeId: null,
    replacedByOutcomeId: null,
    attachedToOutcomeId: null,
    focusWarning: null,
    noLongerPrioritizedReasonBullets: [],
    originallyAnchoredLabel: null,
    lastActivityDate: "2025-12-08",
  },
];

export function getCurrentQuarter(): Quarter {
  const quarter = MOCK_QUARTERS.find((q) => q.id === CURRENT_QUARTER_ID);
  if (!quarter) throw new Error("Current quarter not found in mock data");
  return quarter;
}

/** Current quarter for page/skeleton use (e.g. /quarter). */
export const mockCurrentQuarter = getCurrentQuarter();

/** Mock "last updated" date for the current quarter (ISO date string). */
export const mockCurrentQuarterUpdatedDate = "2025-12-05";

export function getQuarterById(id: string): Quarter | undefined {
  return MOCK_QUARTERS.find((q) => q.id === id);
}

export function getOutcomesByQuarter(quarterId: string): Outcome[] {
  return MOCK_OUTCOMES.filter((o) => o.quarterId === quarterId).sort(
    (a, b) => a.title.localeCompare(b.title)
  );
}

export function getInactiveOutcomes(): Outcome[] {
  return MOCK_OUTCOMES.filter((o) => o.status === "Inactive");
}
