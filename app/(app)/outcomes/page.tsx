import { getAllOutcomes } from "@/lib/mock/mockData";

export default function OutcomesPage() {
  const outcomes = getAllOutcomes();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Outcomes</h1>
      <ul className="space-y-3">
        {outcomes.map((outcome) => (
          <li
            key={outcome.id}
            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
          >
            <h2 className="font-medium text-foreground">{outcome.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{outcome.context}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {outcome.metric} · {outcome.target} · {outcome.status}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
