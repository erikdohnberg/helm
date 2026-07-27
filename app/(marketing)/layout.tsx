import Link from "next/link";

import { HelmMark } from "@/components/ui/icon";

/**
 * The log surface.
 *
 * The marketing site is not a second design language — it is the record, set
 * at reading scale. Chart paper rather than dark glass, printed serif rather
 * than geometric sans, ruled blocks rather than cards.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="log-surface flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex-1">{children}</div>

      <footer className="border-t-2 border-brass bg-navy-deep text-[oklch(0.86_0.015_85)]">
        <div className="mx-auto grid max-w-page grid-cols-1 gap-6 px-6 py-12 md:grid-cols-[var(--rail)_minmax(0,1fr)] md:px-10">
          <div className="flex items-start justify-center text-[oklch(0.97_0.01_85)] md:border-r md:border-[oklch(1_0_0_/_0.14)] md:pr-6">
            <HelmMark size={26} title="Helm" />
          </div>
          <div className="flex flex-col gap-4 md:pl-rail-indent">
            <nav
              aria-label="Marketing"
              className="flex flex-wrap gap-x-6 gap-y-2 text-help"
            >
              <Link
                href="/landing"
                className="hover:text-[oklch(0.97_0.01_85)]"
              >
                Landing
              </Link>
              <Link href="/about" className="hover:text-[oklch(0.97_0.01_85)]">
                About
              </Link>
              <Link
                href="/privacy"
                className="hover:text-[oklch(0.97_0.01_85)]"
              >
                Privacy
              </Link>
            </nav>
            <p className="text-help">
              Built in Toronto by{" "}
              <Link
                href="https://www.erikdohnberg.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[oklch(1_0_0_/_0.35)] underline-offset-4 hover:text-[oklch(0.97_0.01_85)]"
              >
                Erik Dohnberg
              </Link>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
