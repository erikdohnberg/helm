"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/quarter", label: "Helm" },
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

  return (
    <nav
      className="border-b border-border bg-background"
      aria-label="Main navigation"
    >
      <ul className="flex flex-1 gap-1 px-4">
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
