"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    id: "value-mix-health",
    title: "Value Mix Health",
    description:
      "Track how your outcome mix shifts across quarters and spot imbalances.",
  },
  {
    id: "trade-off-memory-graph",
    title: "Trade-Off Memory Graph",
    description:
      "Visualize past trade-offs and their outcomes over time.",
  },
  {
    id: "alignment-volatility-index",
    title: "Alignment Volatility Index",
    description:
      "Measure how often and how much priorities change before execution.",
  },
  {
    id: "market-signal-integration",
    title: "Market Signal Integration",
    description:
      "Connect external market signals to outcome planning and charters.",
  },
] as const;

export function ExploringNextSection() {
  const [votes, setVotes] = useState<Record<string, number>>(() =>
    Object.fromEntries(features.map((f) => [f.id, 0]))
  );

  function upvote(id: string) {
    setVotes((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        What We&apos;re Exploring Next
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ id, title, description }) => (
          <Card key={id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => upvote(id)}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
                  aria-label={`Upvote ${title}`}
                >
                  <ChevronUp className="h-4 w-4" />
                  Upvote
                </button>
                <span className="text-sm text-muted-foreground">
                  {votes[id]} vote{votes[id] !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
