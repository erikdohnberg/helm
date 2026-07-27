import {
  BrassBand,
  BrassTerm,
  LogEntry,
  LogHeading,
  LogLede,
  LogPage,
  LogRow,
  Soundings,
} from "@/components/log/log";

import { ExploringNextSection } from "./exploring-next-section";
import { FeatureCarouselSection } from "./feature-carousel-section";
import { HeroSection } from "./hero-section";
import { WaitlistSection } from "./waitlist-section";

/**
 * The landing page is a log surface: a ruled margin rail carrying numbered
 * entries, hairline rows in place of cards, and exactly one full-bleed brass
 * moment — which carries the question, not a feature.
 */
const failures = [
  {
    label: "It drifts quietly",
    text: "New priorities arrive without anyone comparing them to what the quarter already committed to.",
  },
  {
    label: "The cost disappears",
    text: "Teams rarely write down what stopped in order to start something new, so the trade-off is unrecoverable a month later.",
  },
  {
    label: "The reasoning is lost",
    text: "By the time direction reaches the people doing the work, the argument behind it has gone.",
  },
];

const soundings = [
  {
    figure: "5 weeks",
    caption: "a migration frozen, still reported as on course",
  },
  { figure: "Nine asks", caption: "each one too small to refuse on its own" },
  {
    figure: "One fifth",
    caption: "of a pod's capacity, spent on work nobody entered",
  },
];

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      <LogPage>
        <LogEntry number="01" loadBearing>
          <LogHeading>
            Strategy rarely fails during planning.
            <br />
            It drifts during <em>execution</em>.
          </LogHeading>
          <div className="border-t-2 border-foreground">
            {failures.map(({ label, text }) => (
              <LogRow key={label} label={label}>
                <p className="max-w-prose text-[16px] text-muted-foreground">
                  {text}
                </p>
              </LogRow>
            ))}
          </div>
          <Soundings items={soundings} className="mt-6" />
        </LogEntry>

        <LogEntry number="02">
          <LogHeading>
            A team member responsible for strategic coherence.
          </LogHeading>
          <LogLede>
            Helm listens where strategy actually happens — in meetings, in
            channels, in planning conversations — and writes what the quarter
            committed to.
          </LogLede>
          <p className="max-w-prose text-[16px] text-muted-foreground">
            It turns those signals into draft Outcome Charters, helps leadership
            anchor them before the quarter begins, and keeps the record honest
            as the quarter unfolds. When new work contradicts what was already
            decided, Helm says so — and asks the only question that resolves it.
          </p>
        </LogEntry>

        <FeatureCarouselSection />
      </LogPage>

      {/* The one brass moment on this page. It carries the question. */}
      <BrassBand question={<>What stops?</>}>
        <BrassTerm verb="Attach">
          It serves something already agreed. Nothing enters the quarter.
        </BrassTerm>
        <BrassTerm verb="Replace">
          It takes the place of a named outcome, which stays in the record.
        </BrassTerm>
        <BrassTerm verb="Add">
          Nothing stops — and the quarter says so, for the rest of the quarter.
        </BrassTerm>
      </BrassBand>

      <LogPage>
        <LogEntry number="04">
          <LogHeading>What we are exploring next.</LogHeading>
          <p className="max-w-prose text-[16px] text-muted-foreground">
            None of these is built. A vote tells us which one to write down
            first.
          </p>
          <ExploringNextSection />
        </LogEntry>

        <LogEntry number="05" loadBearing>
          <div id="waitlist" className="scroll-mt-8">
            <LogHeading>Follow the build.</LogHeading>
          </div>
          <LogLede>
            Helm is in private prototype. Updates go out when something real
            changes, and not otherwise.
          </LogLede>
          <WaitlistSection />
        </LogEntry>
      </LogPage>
    </>
  );
}
