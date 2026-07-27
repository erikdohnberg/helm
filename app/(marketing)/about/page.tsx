import type { Metadata } from "next";

import {
  LogEntry,
  LogHeading,
  LogLede,
  LogPage,
  LogRow,
} from "@/components/log/log";

export const metadata: Metadata = {
  title: "Helm — About",
  description: "What Helm is, and what it deliberately is not.",
};

const verbs = [
  { verb: "Anchor", meaning: "Make an outcome official for a quarter." },
  {
    verb: "Attach",
    meaning: "Join work to an outcome, adding no commitment of its own.",
  },
  {
    verb: "Replace",
    meaning: "Trade one anchored outcome for another, and keep both on record.",
  },
  { verb: "Add", meaning: "Enter alongside — nothing stops, and it says so." },
  { verb: "Retire", meaning: "End an outcome without a successor." },
  { verb: "Record", meaning: "Write a decision and its reasoning down." },
];

const notThis = [
  { label: "Not a task manager", text: "Helm never holds the work itself." },
  {
    label: "Not a roadmap tool",
    text: "A roadmap says when. Helm says what was committed to, and what it cost.",
  },
  {
    label: "Not an OKR platform",
    text: "No health, no score, no traffic light. A judgement nobody made is not a fact.",
  },
];

export default function AboutPage() {
  return (
    <LogPage>
      <LogEntry number="01" loadBearing>
        <LogHeading as="h1">A considered record, not a dashboard.</LogHeading>
        <LogLede>
          Helm is opened by people who suspect they have lost the plot. The
          product exists to give that moment a straight answer: this is what the
          quarter committed to, this is what it cost, and this is what has
          changed since.
        </LogLede>
      </LogEntry>

      <LogEntry number="02">
        <LogHeading>Six verbs carry the whole model.</LogHeading>
        <p className="max-w-prose text-[16px] text-muted-foreground">
          They are the product, so they are never used loosely and never swapped
          for synonyms.
        </p>
        <div className="border-t-2 border-foreground">
          {verbs.map(({ verb, meaning }) => (
            <LogRow key={verb} label={verb}>
              <p className="max-w-prose text-[16px] text-muted-foreground">
                {meaning}
              </p>
            </LogRow>
          ))}
        </div>
      </LogEntry>

      <LogEntry number="03">
        <LogHeading>What Helm is not.</LogHeading>
        <div className="border-t-2 border-foreground">
          {notThis.map(({ label, text }) => (
            <LogRow key={label} label={label}>
              <p className="max-w-prose text-[16px] text-muted-foreground">
                {text}
              </p>
            </LogRow>
          ))}
        </div>
      </LogEntry>
    </LogPage>
  );
}
