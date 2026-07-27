import type { Metadata } from "next";

import { LogEntry, LogHeading, LogLede, LogPage } from "@/components/log/log";

export const metadata: Metadata = {
  title: "Helm — Privacy",
  description: "What Helm does with an email address, stated plainly.",
};

export default function PrivacyPage() {
  return (
    <LogPage>
      <LogEntry number="01" loadBearing>
        <LogHeading as="h1">Privacy.</LogHeading>
        <LogLede>
          Email addresses collected through the waitlist or a feature vote are
          used for Helm product updates, and to count a vote once per person.
        </LogLede>
        <p className="max-w-prose text-[16px] text-muted-foreground">
          They are not shared with third parties and are not used for anything
          else. Ask and the address is removed.
        </p>
      </LogEntry>
    </LogPage>
  );
}
