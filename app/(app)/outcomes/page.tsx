import {
  getOutcomesByQuarter,
  getQuarterById,
} from "@/lib/mock/mockData";

/** Quarter order on outcomes page: FY26 Q2, then FY26 Q1, then older. */
const OUTCOMES_QUARTER_ORDER = ["q-fy26-q2", "q-fy26-q1", "q-fy25-q4"];

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
                <li
                  key={outcome.id}
                  className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
                >
                  <h3 className="font-medium text-foreground">{outcome.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {outcome.context}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {outcome.metric} · {outcome.target} · {outcome.status}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
