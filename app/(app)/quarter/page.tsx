import {
  mockCurrentQuarter,
  mockCurrentQuarterUpdatedDate,
} from "@/lib/mock/mockData";

function formatUpdatedDate(iso: string): string {
  return new Date(iso + "Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function QuarterPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-foreground">Quarter</h1>
      <p className="text-muted-foreground">{mockCurrentQuarter.label}</p>
      <p className="text-sm text-muted-foreground">
        Updated {formatUpdatedDate(mockCurrentQuarterUpdatedDate)}
      </p>
    </div>
  );
}
