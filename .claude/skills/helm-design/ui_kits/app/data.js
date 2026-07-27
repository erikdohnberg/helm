window.HELM_OUTCOMES = [
  {
    id: "o1", state: "anchored", doc: true,
    title: "Two named design partners live on the co-sell motion",
    commitment: "Two design partners are running the co-sell motion in production by the end of FY26 Q1, with their onboarding recorded end to end.",
    tradeoff: "Self-serve billing was deferred to FY26 Q2 to free the two engineers this needs.",
    facts: [
      { label: "Metric", value: "Partners live in production" },
      { label: "Anchored", value: "14 Jan by Ada Lovelace" },
      { label: "Attachments", value: "7 since 02 Feb, up from 3", observed: true },
    ],
    timeline: [
      { date: "14 Jan", glyph: "anchor", text: "Anchored in the FY26 planning review. Two alternatives were declined." },
      { date: "02 Feb", glyph: "shackle", text: "Partner onboarding runbook attached by Grace Hopper." },
      { date: "11 Feb", glyph: "sounding", text: "3 attachments in nine days, up from 1", observed: true },
      { date: "21 Feb", glyph: "bearing-off", text: "Work started on unentered scope contradicts this charter", observed: true },
    ],
    attachments: [
      { what: "Partner onboarding runbook", who: "Grace Hopper", when: "02 Feb" },
      { what: "Co-sell pricing sheet", who: "Ada Lovelace", when: "09 Feb" },
      { what: "Partner API scoping doc", who: "Alan Turing", when: "18 Feb" },
    ],
  },
  {
    id: "o2", state: "anchored", doc: true,
    title: "Support response falls below four hours",
    facts: [
      { label: "Metric", value: "Median first response" },
      { label: "Anchored", value: "14 Jan by Alan Turing" },
      { label: "Now", value: "5h 20m, down from 9h", observed: true },
    ],
  },
  {
    id: "o3", state: "additive",
    title: "Ship the compliance audit trail",
    facts: [
      { label: "Entered", value: "02 Feb, nothing displaced" },
      { label: "Asked by", value: "Board readiness review" },
    ],
  },
  { id: "a1", state: "attached", parent: "o1", title: "Partner onboarding runbook", observed: "Last touched 11 Feb" },
  {
    id: "r1", state: "replaced",
    title: "Self-serve billing, phase one",
    reasons: [
      "Traded for the co-sell motion on 14 Jan.",
      "Kept in the record; the reasoning stays legible.",
    ],
  },
];
