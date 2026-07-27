"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "next-auth/react";

import { HelmMark } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * The Helm masthead: navy-deep ground, a 2px brass keel line, the mark in the
 * 104px rail, the wordmark in serif, then the sections.
 *
 * The keel line is the one place brass is structural rather than a drift
 * signal — it is the masthead of the record, not a highlight inside it.
 */
const navItems = [
  { href: "/quarter", label: "Quarter" },
  { href: "/outcomes", label: "Outcomes" },
  { href: "/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-brass bg-navy-deep">
      <nav
        aria-label="Main navigation"
        className="mx-auto grid max-w-page grid-cols-[3.5rem_minmax(0,1fr)] px-6 md:grid-cols-[var(--rail)_minmax(0,1fr)] md:px-10"
      >
        <div className="flex items-center justify-center border-r border-[oklch(1_0_0_/_0.14)]">
          <Link
            href="/quarter"
            aria-label="Helm — the quarter as recorded"
            className="flex h-target w-target items-center justify-center rounded-lg text-[oklch(0.97_0.01_85)]"
          >
            <HelmMark size={26} />
          </Link>
        </div>

        <div className="flex h-16 min-w-0 items-center gap-5 pl-4 md:pl-rail-indent">
          <span className="flex-none font-serif text-[21px] font-medium tracking-[0.01em] text-[oklch(0.97_0.01_85)]">
            Helm
          </span>

          <ul className="flex min-w-0 flex-1 items-center gap-[18px]">
            {navItems.map(({ href, label }) => {
              const on = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "whitespace-nowrap border-b pb-0.5 text-[13px] transition-colors duration-quick ease-out",
                      on
                        ? "border-brass-soft font-semibold text-[oklch(0.97_0.01_85)]"
                        : "border-transparent font-normal text-[oklch(0.86_0.015_85)] hover:text-[oklch(0.97_0.01_85)]"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/landing" })}
            className="flex-none whitespace-nowrap text-[13px] text-[oklch(0.86_0.015_85)] transition-colors duration-quick ease-out hover:text-[oklch(0.97_0.01_85)]"
          >
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
