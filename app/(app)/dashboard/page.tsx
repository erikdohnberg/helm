import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Eyebrow, RecordTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Eyebrow>Signed in</Eyebrow>
        <RecordTitle as="h1" level="page">
          There is no dashboard
        </RecordTitle>
      </header>
      <EmptyState
        title="Helm keeps a record, not a dashboard"
        action={
          <Link href="/quarter">
            <Button>Read the quarter</Button>
          </Link>
        }
      >
        The quarter as recorded is the screen this product is about. Everything
        else serves it.
      </EmptyState>
    </div>
  );
}
