"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "next-auth/react";

import { helmLogoBlackSrc, helmLogoWhiteSrc } from "@/lib/brand/helm-logos";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/quarter", label: "Quarter" },
  { href: "/outcomes", label: "Outcomes" },
  { href: "/settings", label: "Settings" },
] as const;

function NavLink({
  href,
  children,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-3 text-sm transition-colors",
        isActive
          ? "font-medium text-foreground border-b-2 border-foreground/20 -mb-px"
          : "text-muted-foreground hover:text-foreground/80"
      )}
    >
      {children}
    </Link>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const quarterActive = pathname === "/quarter";

  return (
    <nav
      className="border-b border-border bg-background"
      aria-label="Main navigation"
    >
      <ul className="flex flex-1 items-center gap-1 px-4">
        <li>
          <Link
            href="/quarter"
            aria-label="Helm"
            className={cn(
              "flex items-center px-3 py-3",
              quarterActive
                ? "border-b-2 border-foreground/20 -mb-px"
                : "opacity-90 hover:opacity-100"
            )}
          >
            <img
              src={helmLogoBlackSrc}
              alt=""
              width={120}
              height={32}
              className="h-7 w-auto object-contain object-left dark:hidden"
            />
            <img
              src={helmLogoWhiteSrc}
              alt=""
              width={120}
              height={32}
              className="hidden h-7 w-auto object-contain object-left dark:block"
            />
          </Link>
        </li>
        {navItems.map(({ href, label }) => (
          <li key={label}>
            <NavLink
              href={href}
              isActive={
                pathname === href ||
                (href === "/settings" && pathname.startsWith("/settings"))
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
        <li className="ml-auto">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/landing" })}
            className="px-3 py-3 text-sm text-muted-foreground hover:text-foreground/80"
          >
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}
