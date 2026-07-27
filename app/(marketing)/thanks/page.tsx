import Link from "next/link";

import type { Metadata } from "next";

import { LogEntry, LogHeading, LogLede, LogPage } from "@/components/log/log";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Helm — On the list",
  description: "The address is recorded.",
};

export default function ThanksPage() {
  return (
    <LogPage>
      <LogEntry number="01" loadBearing>
        {/* Confirmations state what is now true. They do not congratulate. */}
        <LogHeading as="h1">Recorded.</LogHeading>
        <LogLede>
          The address is on the list. Updates go out when something real
          changes, and not otherwise.
        </LogLede>
        <div>
          <Link href="/landing">
            <Button variant="outline">Back to the record</Button>
          </Link>
        </div>
      </LogEntry>
    </LogPage>
  );
}
