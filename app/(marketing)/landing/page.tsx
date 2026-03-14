import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeatureCarouselSection } from "./feature-carousel-section";
import { HeroSection } from "./hero-section";
import { WaitlistSection } from "./waitlist-section";

const problemCards = [
  {
    title: "Direction drifts quietly",
    text: "New priorities appear without deliberate comparison to the original plan.",
  },
  {
    title: "Trade-offs disappear",
    text: "Teams rarely record what stopped in order to pursue something new.",
  },
  {
    title: "Decisions lose context",
    text: "By the time direction reaches teams, the reasoning behind it is gone.",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      <div className="mx-auto max-w-[820px] px-6">
        {/* Problem section */}
        <section className="py-[120px]">
          <p className="text-center text-lg font-medium leading-relaxed text-text-primary">
            Strategy rarely fails during planning.
            <br />
            It drifts during execution.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {problemCards.map(({ title, text }) => (
              <Card
                key={title}
                className="border-0 bg-white shadow-md shadow-black/5"
              >
                <CardHeader>
                  <CardTitle className="text-text-primary">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Helm concept section */}
        <section className="py-[120px]">
          <h2 className="text-xl font-semibold text-text-primary">
            A team member responsible for strategic coherence
          </h2>
          <div className="mt-6 space-y-4 text-text-secondary leading-relaxed">
            <p>
              Helm listens where strategy actually happens — in meetings, Slack
              discussions, and planning conversations.
            </p>
            <p>
              It turns those signals into draft Outcome Charters, helps
              leadership align before the quarter begins, and keeps teams
              connected to those outcomes as the quarter unfolds.
            </p>
            <p>
              When alignment fades, Helm nudges the team to reconnect.
            </p>
          </div>
        </section>

        {/* Feature carousel */}
        <FeatureCarouselSection />

        {/* Waitlist */}
        <section className="py-[120px]">
          <WaitlistSection />
        </section>
      </div>
    </>
  );
}
