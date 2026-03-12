import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const problemCards = [
  {
    title: "Direction drifts quietly",
    text: "Quarterly priorities shift without deliberate comparison to the original plan.",
  },
  {
    title: "Trade-offs stay implicit",
    text: "New initiatives are added without clearly identifying what stops.",
  },
  {
    title: "Teams execute without context",
    text: "By the time direction reaches teams, the reasoning behind it is often lost.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="space-y-16">
      <section className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Helm
          </h1>
          <p className="text-xl text-muted-foreground">
            Keep strategy on course.
          </p>
        </div>
        <p className="text-lg text-foreground max-w-xl leading-relaxed">
          Turn internal signals into deliberate quarterly outcomes — with
          explicit trade-offs and shared context before execution begins.
        </p>
        <div className="flex flex-col items-center gap-4 pt-2">
          <Link
            href="#waitlist"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Join the waitlist
          </Link>
          <p className="text-sm text-muted-foreground">
            Currently in private prototype.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Problem</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problemCards.map(({ title, text }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">The Idea</h2>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">How It Works</h2>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">What It Is Not</h2>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          What We&apos;re Exploring Next
        </h2>
      </section>

      <section id="waitlist">
        <h2 className="text-xl font-semibold text-foreground">Waitlist</h2>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">Footer</h2>
      </section>
    </div>
  );
}
